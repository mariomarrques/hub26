import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle, PauseCircle, Sparkles, Store } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandDialog,
  CommandInput,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";
import { mockProducts, mockSuppliers, mockMembers } from "@/data/mockData";
import { MEMBER_LEVELS } from "@/types/member";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  className?: string;
}

const SUPPLIER_STATUS_ICONS = {
  active: CheckCircle,
  paused: PauseCircle,
  new: Sparkles,
};

const SUPPLIER_STATUS_COLORS = {
  active: "text-green-500",
  paused: "text-yellow-500",
  new: "text-blue-500",
};

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = debouncedQuery
    ? mockProducts
        .filter((p) =>
          p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredSuppliers = debouncedQuery
    ? mockSuppliers
        .filter((s) =>
          s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          s.categories.some((cat) => cat.toLowerCase().includes(debouncedQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const filteredMembers = debouncedQuery
    ? mockMembers
        .filter((m) =>
          m.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const hasResults = filteredProducts.length > 0 || filteredSuppliers.length > 0 || filteredMembers.length > 0;

  const handleProductSelect = (product: (typeof mockProducts)[0]) => {
    if (product.affiliateLink && product.affiliateLink !== "#") {
      window.open(product.affiliateLink, "_blank");
    }
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
  };

  const handleSupplierSelect = (supplier: (typeof mockSuppliers)[0]) => {
    navigate("/fornecedores");
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
  };

  const handleMemberSelect = (member: (typeof mockMembers)[0]) => {
    navigate(`/perfil/${member.id}`);
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
  };

  const handleViewAll = () => {
    navigate(`/busca?q=${encodeURIComponent(query)}`);
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSupplierAvgRating = (rating: { quality: number; delivery: number; communication: number }) => {
    return ((rating.quality + rating.delivery + rating.communication) / 3).toFixed(1);
  };

  const renderResults = (isMobile = false) => (
    <>
      {!debouncedQuery && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Digite para buscar...
        </div>
      )}
      {debouncedQuery && !hasResults && (
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
      )}
      {filteredProducts.length > 0 && (
        <CommandGroup heading="Produtos">
          {filteredProducts.map((product) => (
            <CommandItem
              key={product.id}
              onSelect={() => handleProductSelect(product)}
              className="flex items-center gap-3 p-2 cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.category} • {product.originPrice}
                </p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {filteredSuppliers.length > 0 && (
        <CommandGroup heading="Fornecedores">
          {filteredSuppliers.map((supplier) => {
            const StatusIcon = SUPPLIER_STATUS_ICONS[supplier.status];
            return (
              <CommandItem
                key={supplier.id}
                onSelect={() => handleSupplierSelect(supplier)}
                className="flex items-center gap-3 p-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{supplier.name}</p>
                    <StatusIcon className={cn("h-3.5 w-3.5", SUPPLIER_STATUS_COLORS[supplier.status])} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {supplier.categories.join(", ")} • ⭐ {getSupplierAvgRating(supplier.rating)}
                  </p>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
      {filteredMembers.length > 0 && (
        <CommandGroup heading="Membros">
          {filteredMembers.map((member) => (
            <CommandItem
              key={member.id}
              onSelect={() => handleMemberSelect(member)}
              className="flex items-center gap-3 p-2 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{member.name}</p>
                <p className={cn("text-xs", MEMBER_LEVELS[member.tier].color)}>
                  {MEMBER_LEVELS[member.tier].name}
                </p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {debouncedQuery && hasResults && (
        <CommandItem
          onSelect={handleViewAll}
          className="justify-center text-primary mt-2 cursor-pointer"
        >
          <Search className="mr-2 h-4 w-4" />
          Ver todos os resultados para "{debouncedQuery}"
        </CommandItem>
      )}
    </>
  );

  return (
    <>
      {/* Desktop search with popover */}
      <div className={cn("hidden md:block", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar produtos, fornecedores, membros..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setOpen(true);
                }}
                onClick={() => setOpen(true)}
                onFocus={() => query && setOpen(true)}
                className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-[10px] text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[400px] p-0 bg-card border-border"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              const target = e.target as HTMLElement;
              if (target === inputRef.current) {
                e.preventDefault();
              }
            }}
          >
            <Command shouldFilter={false}>
              <CommandList>
                {renderResults()}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile search button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Search className="h-5 w-5 text-muted-foreground" />
      </Button>
      <CommandDialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <CommandInput
          placeholder="Buscar produtos, fornecedores, membros..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {renderResults(true)}
        </CommandList>
      </CommandDialog>
    </>
  );
}