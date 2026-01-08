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
    <div className="space-y-md animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-sm top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
        <Input
          type="text"
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-input bg-card border-border-subtle rounded-input text-foreground placeholder:text-text-muted focus:border-primary focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-sm top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors duration-hover"
          >
            <X className="h-[16px] w-[16px]" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-xs">
        <div className="flex items-center gap-xxs text-small mr-xs">
          <Filter className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
          <span className="text-section-label">Categoria</span>
        </div>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "rounded-pill border h-tab px-sm text-[13px] font-medium transition-all duration-hover",
              activeCategory === category
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-text-secondary hover:bg-hover hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-xs">
        <div className="flex items-center gap-xxs text-small mr-xs">
          <span className="text-section-label">Status</span>
        </div>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status)}
            className={cn(
              "rounded-pill border h-tab px-sm text-[13px] font-medium transition-all duration-hover",
              activeStatus === status
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-text-secondary hover:bg-hover hover:text-foreground"
            )}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
