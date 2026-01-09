import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "currency_rate_cny_brl";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedRate {
  rate: number;
  timestamp: number;
}

export function useCurrencyRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsedCache: CachedRate = JSON.parse(cached);
          const isValid = Date.now() - parsedCache.timestamp < CACHE_DURATION;
          if (isValid && parsedCache.rate) {
            setRate(parsedCache.rate);
            setIsLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      // Fetch new rate
      try {
        const response = await fetch(
          "https://api.frankfurter.dev/v1/latest?base=CNY&symbols=BRL"
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch exchange rate");
        }
        
        const data = await response.json();
        const newRate = data.rates?.BRL;
        
        if (newRate) {
          setRate(newRate);
          // Cache the rate
          const cacheData: CachedRate = {
            rate: newRate,
            timestamp: Date.now(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }
      } catch (err) {
        console.error("Error fetching currency rate:", err);
        setError("Não foi possível obter a cotação");
        // Try to use cached rate even if expired
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsedCache: CachedRate = JSON.parse(cached);
            if (parsedCache.rate) {
              setRate(parsedCache.rate);
            }
          } catch {
            // Ignore parse errors
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, []);

  const convertToBRL = useCallback(
    (yuanValue: number): number | null => {
      if (!rate || isNaN(yuanValue)) return null;
      return yuanValue * rate;
    },
    [rate]
  );

  const formatBRL = useCallback(
    (yuanValue: number): string | null => {
      const converted = convertToBRL(yuanValue);
      if (converted === null) return null;
      return converted.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    [convertToBRL]
  );

  return {
    rate,
    isLoading,
    error,
    convertToBRL,
    formatBRL,
  };
}
