import { useCurrencyRate } from "@/hooks/use-currency-rate";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceDisplayProps {
  originPrice: string;
  showConversion?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function parsePrice(priceStr: string): number | null {
  const cleaned = priceStr.replace(/[¥R$\s]/g, "").trim();
  const normalized = cleaned.replace(",", ".");
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

export function PriceDisplay({
  originPrice,
  showConversion = true,
  size = "md",
  className,
}: PriceDisplayProps) {
  const { formatBRL, isLoading } = useCurrencyRate();

  const numericPrice = parsePrice(originPrice);
  const convertedPrice = numericPrice !== null ? formatBRL(numericPrice) : null;

  const formattedOrigin = originPrice.includes("¥")
    ? originPrice
    : `¥ ${originPrice}`;

  const sizeClasses = {
    sm: { origin: "text-xs text-muted-foreground", converted: "text-sm font-semibold text-primary" },
    md: { origin: "text-xs text-muted-foreground", converted: "text-[15px] font-bold text-success" },
    lg: { origin: "text-sm text-muted-foreground", converted: "text-xl font-bold text-success" },
  };

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        {/* Yuan price - left, small */}
        <span className={sizeClasses[size].origin}>
          Preço China {formattedOrigin}
        </span>

        {/* BRL estimated price - right, bold, colored */}
        {showConversion && (
          <>
            {isLoading ? (
              <Skeleton className="h-4 w-20 inline-block" />
            ) : convertedPrice ? (
              <span className={sizeClasses[size].converted}>
                R$ {convertedPrice}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
