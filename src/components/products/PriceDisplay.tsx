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
    sm: { label: "text-[10px]", price: "text-sm font-bold text-muted-foreground", converted: "text-base font-semibold text-primary" },
    md: { label: "text-[10px]", price: "text-base font-bold text-muted-foreground", converted: "text-lg font-bold text-success" },
    lg: { label: "text-xs", price: "text-lg font-bold text-muted-foreground", converted: "text-2xl font-bold text-success" },
  };

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-2">
        {/* Yuan price - left, stacked */}
        <div className="flex flex-col">
          <span className={cn(sizeClasses[size].label, "text-muted-foreground/70 uppercase tracking-wider font-medium")}>
            Preço China
          </span>
          <span className={sizeClasses[size].price}>
            {formattedOrigin}
          </span>
        </div>

        {/* BRL estimated price - right, stacked */}
        {showConversion && (
          <div className="flex flex-col items-end">
            <span className={cn(sizeClasses[size].label, "text-muted-foreground/70 uppercase tracking-wider font-medium")}>
              Estimado
            </span>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : convertedPrice ? (
              <span className={sizeClasses[size].converted}>
                R$ {convertedPrice}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
