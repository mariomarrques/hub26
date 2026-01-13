import { Store, Rocket, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

// Configuração específica para cada feature
const featureConfig: Record<string, {
  icon: typeof Store;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
  details: string[];
}> = {
  "Bazar do Marin": {
    icon: Store,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    description: "O marketplace exclusivo do Hub 26 para produtos com pronta entrega no Brasil.",
    details: [
      "Compre direto de membros verificados",
      "Estoque no Brasil, entrega rápida",
      "Preços especiais para a comunidade",
    ],
  },
};

const defaultConfig = {
  icon: Rocket,
  iconColor: "text-primary",
  bgColor: "bg-primary/10",
  borderColor: "border-primary/20",
  description: "Esta funcionalidade está sendo desenvolvida com muito carinho.",
  details: [
    "Em breve disponível para todos",
    "Fique atento às novidades",
  ],
};

export function ComingSoonDialog({ 
  open, 
  onOpenChange, 
  featureName = "Esta funcionalidade" 
}: ComingSoonDialogProps) {
  const config = featureConfig[featureName] || defaultConfig;
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm p-0 overflow-hidden border-border/50">
        {/* Header com gradiente */}
        <div className={cn(
          "relative px-6 pt-8 pb-6",
          "bg-gradient-to-b from-card to-background"
        )}>
          {/* Badge "Em breve" */}
          <div className="absolute top-4 right-4">
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide",
              "bg-amber-500/15 text-amber-500 border border-amber-500/25"
            )}>
              <Sparkles className="h-3 w-3" />
              Em breve
            </span>
          </div>

          {/* Ícone principal */}
          <div className="flex justify-center mb-5">
            <div className={cn(
              "flex items-center justify-center w-20 h-20 rounded-2xl border-2",
              config.bgColor,
              config.borderColor
            )}>
              <Icon className={cn("h-10 w-10", config.iconColor)} strokeWidth={1.5} />
            </div>
          </div>

          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-xl font-semibold">
              {featureName}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
              {config.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Lista de features */}
        <div className="px-6 pb-2">
          <ul className="space-y-2.5">
            {config.details.map((detail, index) => (
              <li 
                key={index}
                className="flex items-center gap-3 text-sm text-foreground"
              >
                <span className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  config.bgColor,
                  config.iconColor
                )}>
                  {index + 1}
                </span>
                {detail}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <AlertDialogFooter className="px-6 py-4 bg-muted/30 border-t border-border/50">
          <AlertDialogAction className="w-full h-10">
            Entendi, aguardar lançamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
