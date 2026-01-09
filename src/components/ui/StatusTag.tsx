import { cn } from "@/lib/utils";
import { Flame, TrendingUp, Sparkles, Pause } from "lucide-react";

type TagVariant = "hot" | "trending" | "new" | "paused";

interface StatusTagProps {
  variant: TagVariant;
  children?: React.ReactNode;
}

const variantConfig = {
  hot: {
    icon: Flame,
    label: "Quente",
    className: "bg-hot/15 text-hot border-hot/20",
  },
  trending: {
    icon: TrendingUp,
    label: "Em alta",
    className: "bg-warning/15 text-warning border-warning/20",
  },
  new: {
    icon: Sparkles,
    label: "Novo",
    className: "bg-success/15 text-success border-success/20",
  },
  paused: {
    icon: Pause,
    label: "Pausado",
    className: "bg-muted/50 text-muted-foreground border-muted",
  },
};

export function StatusTag({ variant, children }: StatusTagProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-xxs rounded-pill border px-xs py-1 text-[12px] font-medium transition-all duration-hover",
        config.className,
        variant === "hot" && "pulse-hot"
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={1.5} />
      {children || config.label}
    </span>
  );
}
