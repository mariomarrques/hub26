import { Star, Crown, Shield, Gem, Award } from "lucide-react";
import { MemberTier, MEMBER_LEVELS } from "@/types/member";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemberBadgeProps {
  tier: MemberTier;
  showLabel?: boolean;
  className?: string;
}

const tierIcons: Record<MemberTier, React.ElementType> = {
  member: Star,
  active: Award,
  gold: Star,
  platinum: Gem,
  founder: Crown,
};

export function MemberBadge({ tier, showLabel = true, className }: MemberBadgeProps) {
  const level = MEMBER_LEVELS[tier];
  const Icon = tierIcons[tier];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] opacity-80",
              level.color,
              className
            )}
          >
            <Icon className="h-2.5 w-2.5" strokeWidth={2} />
            {showLabel && <span>{level.name}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <p>{level.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
