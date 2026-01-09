import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

const CACHE_KEY = "currency_rate_cny_brl";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedRate {
  rate: number;
  timestamp: number;
}

// Singleton state to prevent multiple API calls
let globalRate: number | null = null;
let globalLoading = true;
let globalError: string | null = null;
let fetchPromise: Promise<void> | null = null;
let subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function getSnapshot() {
  return { rate: globalRate, isLoading: globalLoading, error: globalError };
}

function fetchRateIfNeeded() {
  // Already fetching or already have rate
  if (fetchPromise || globalRate !== null) {
    return;
  }

  // Check localStorage cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsedCache: CachedRate = JSON.parse(cached);
      const isValid = Date.now() - parsedCache.timestamp < CACHE_DURATION;
      if (isValid && parsedCache.rate) {
        globalRate = parsedCache.rate;
        globalLoading = false;
        notifySubscribers();
        return;
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // Fetch new rate (only one request)
  fetchPromise = (async () => {
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
        globalRate = newRate;
        // Cache the rate
        const cacheData: CachedRate = {
          rate: newRate,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (err) {
      console.error("Error fetching currency rate:", err);
      globalError = "Não foi possível obter a cotação";
      
      // Try to use cached rate even if expired
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsedCache: CachedRate = JSON.parse(cached);
          if (parsedCache.rate) {
            globalRate = parsedCache.rate;
          }
        } catch {
          // Ignore parse errors
        }
      }
    } finally {
      globalLoading = false;
      fetchPromise = null;
      notifySubscribers();
    }
  })();
}

export function useCurrencyRate() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    fetchRateIfNeeded();
  }, []);

  const convertToBRL = useCallback(
    (yuanValue: number): number | null => {
      if (!state.rate || isNaN(yuanValue)) return null;
      return yuanValue * state.rate;
    },
    [state.rate]
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
    rate: state.rate,
    isLoading: state.isLoading,
    error: state.error,
    convertToBRL,
    formatBRL,
  };
}
