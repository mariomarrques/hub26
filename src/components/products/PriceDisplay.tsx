import { useCurrencyRate } from "@/hooks/use-currency-rate";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceDisplayProps {
  originPrice: string;
  showConversion?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function parsePrice(priceStr: string): number | null {
  // Remove currency symbols and spaces
  const cleaned = priceStr.replace(/[¥R$\s]/g, "").trim();
  // Replace comma with dot for parsing
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

  // Format origin price with Yuan symbol if not already present
  const formattedOrigin = originPrice.includes("¥")
    ? originPrice
    : `¥ ${originPrice}`;

  const sizeClasses = {
    sm: {
      origin: "text-sm font-medium",
      converted: "text-xs",
    },
    md: {
      origin: "text-[14px] font-medium",
      converted: "text-xs",
    },
    lg: {
      origin: "text-lg font-semibold",
      converted: "text-sm",
    },
  };

  return (
    <div className={className}>
      <span className={sizeClasses[size].origin}>{formattedOrigin}</span>
      {showConversion && (
        <>
          {isLoading ? (
            <Skeleton className="h-3 w-16 mt-0.5 inline-block ml-1" />
          ) : convertedPrice ? (
            <span className={`${sizeClasses[size].converted} text-muted-foreground ml-1`}>
              (≈ R$ {convertedPrice})
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
