import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = ["Todos", "Camisas", "Grifes", "Acessórios", "Eletrônicos", "Calçados"];
const statuses = ["Todos", "Quente", "Em Alta", "Novo"];

interface ProductFiltersProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
}

export function ProductFilters({ onSearch, onCategoryChange, onStatusChange }: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeStatus, setActiveStatus] = useState("Todos");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  const handleStatusClick = (status: string) => {
    setActiveStatus(status);
    onStatusChange?.(status);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-card border-border focus:border-primary focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-label">Categoria</span>
        </div>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
              activeCategory === category
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
          <span className="text-label">Status</span>
        </div>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
              activeStatus === status
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            )}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
