import { Link } from "react-router-dom";
import { Package, Store, Users, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

const navigationItems: NavigationItem[] = [
  { name: "Produtos", href: "/produtos", icon: Package, color: "cyan" },
  { name: "Bazar do Marin", href: "/bazar", icon: Store, color: "cyan", disabled: true, comingSoon: true },
  { name: "Fornecedores", href: "/fornecedores", icon: Users, color: "blue" },
  { name: "Comunidade", href: "/comunidade", icon: MessageSquare, color: "teal" },
  { name: "Avisos", href: "/avisos", icon: Bell, color: "emerald" },
];

const getButtonClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    cyan: "border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400",
    blue: "border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400",
    teal: "border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400",
    emerald: "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400",
  };
  return colorMap[color] || colorMap.cyan;
};

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Logo/Title */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="text-foreground">Hub</span>{" "}
            <span className="text-primary">26</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full opacity-60" />
        </div>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
          Sua central de{" "}
          <span className="text-primary font-medium">produtos e fornecedores</span>
        </p>
        
        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-12 max-w-2xl">
          {navigationItems.map((item) => {
            const ButtonContent = (
              <Button 
                variant="outline" 
                disabled={item.disabled}
                className={cn(
                  "min-w-[140px] md:min-w-[160px] h-11 md:h-12 text-sm md:text-base border-2 bg-card/30 backdrop-blur-sm transition-all duration-300 relative",
                  item.disabled 
                    ? "opacity-60 cursor-not-allowed border-muted text-muted-foreground hover:bg-transparent" 
                    : getButtonClasses(item.color)
                )}
              >
                <item.icon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                {item.name}
                {item.comingSoon && (
                  <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 bg-amber-500 text-white border-0 hover:bg-amber-500">
                    Em breve
                  </Badge>
                )}
              </Button>
            );

            if (item.disabled) {
              return <div key={item.href}>{ButtonContent}</div>;
            }

            return (
              <Link key={item.href} to={item.href}>
                {ButtonContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
