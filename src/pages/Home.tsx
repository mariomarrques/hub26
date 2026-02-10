import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Store, Sparkles, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
  comingSoon?: boolean;
}

const navigationItems: NavigationItem[] = [
  { name: "Produtos Indicados", href: "/produtos", icon: Package, color: "teal" },
  { name: "Vídeos", href: "/videos", icon: Video, color: "teal" },
  { name: "Bazar do Marin", href: "/bazar", icon: Store, color: "teal", comingSoon: true },
];

const getButtonClasses = (color: string, comingSoon?: boolean) => {
  if (comingSoon) {
    return "border-primary/40 text-foreground/60 hover:bg-primary/5 hover:border-primary/60 hover:text-foreground/80";
  }
  return "border-primary/40 text-foreground/80 hover:bg-primary/8 hover:border-primary/60 hover:text-foreground";
};

const Home = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");

  const handleNavClick = (item: NavigationItem) => {
    if (item.comingSoon) {
      setComingSoonFeature(item.name);
      setShowComingSoon(true);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        {/* Gradient Overlay — low opacity to let ambient show through */}
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
        
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
                  className={cn(
                    "relative min-w-[140px] md:min-w-[160px] h-11 md:h-12 text-sm md:text-base border-2 bg-card/30 backdrop-blur-sm transition-all duration-300",
                    getButtonClasses(item.color, item.comingSoon)
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {item.name}
                  
                  {/* Badge "Em breve" para itens comingSoon */}
                  {item.comingSoon && (
                    <span className="absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-primary text-primary-foreground shadow-lg">
                      <Sparkles className="h-2 w-2" />
                      Breve
                    </span>
                  )}
                </Button>
              );

              if (item.comingSoon) {
                return (
                  <div 
                    key={item.href} 
                    onClick={() => handleNavClick(item)} 
                    className="cursor-pointer"
                  >
                    {ButtonContent}
                  </div>
                );
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

      <ComingSoonDialog 
        open={showComingSoon} 
        onOpenChange={setShowComingSoon}
        featureName={comingSoonFeature}
      />
    </>
  );
};

export default Home;
