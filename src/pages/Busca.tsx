import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Search, Package, Users, Store, ArrowRight, Home, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusTag } from "@/components/ui/StatusTag";
import { mockSuppliers, mockMembers } from "@/data/mockData";
import { MEMBER_LEVELS } from "@/types/member";
import { cn, normalizeSearch } from "@/lib/utils";
import { useSearchProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";

type SearchTab = "all" | "products" | "suppliers" | "members";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  new: "Novo",
};

export default function Busca() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const debouncedQuery = useDebounce(query, 300);
  
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch real products from database
  const { data: products = [], isLoading: isLoadingProducts } = useSearchProducts(debouncedQuery);

  const normalizedQuery = normalizeSearch(debouncedQuery);

  // Filter suppliers and members from mock data (can be integrated later)
  const filteredSuppliers = useMemo(() => {
    if (!normalizedQuery) return [];
    return mockSuppliers.filter((s) =>
      normalizeSearch(s.name).includes(normalizedQuery) ||
      s.categories.some((cat) => normalizeSearch(cat).includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  const filteredMembers = useMemo(() => {
    if (!normalizedQuery) return [];
    return mockMembers.filter((m) =>
      normalizeSearch(m.name).includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  // Apply additional filters to products
  const displayProducts = useMemo(() => {
    let filtered = products;
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category?.name === categoryFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    return filtered;
  }, [products, categoryFilter, statusFilter]);

  const displaySuppliers = useMemo(() => {
    let suppliers = filteredSuppliers;
    if (categoryFilter !== "all") {
      suppliers = suppliers.filter((s) => s.categories.includes(categoryFilter));
    }
    if (statusFilter !== "all") {
      suppliers = suppliers.filter((s) => s.status === statusFilter);
    }
    return suppliers;
  }, [filteredSuppliers, categoryFilter, statusFilter]);

  const totalResults = products.length + filteredSuppliers.length + filteredMembers.length;

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    mockSuppliers.forEach((s) => s.categories.forEach((c) => cats.add(c)));
    return Array.from(cats).sort();
  }, [products]);

  const handleSearchChange = (value: string) => {
    setSearchParams({ q: value });
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="animate-fade-in">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Busca</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          {query ? (
            <>Resultados para "{query}"</>
          ) : (
            <>Buscar</>
          )}
        </h1>
        {query && !isLoadingProducts && (
          <p className="text-muted-foreground">
            {totalResults} {totalResults === 1 ? "resultado encontrado" : "resultados encontrados"}
          </p>
        )}
      </div>

      {/* Search input */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar produtos, fornecedores, membros..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SearchTab)}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all" className="gap-2">
            Todos
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {totalResults}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Produtos
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {products.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Store className="h-4 w-4" />
            Fornecedores
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {filteredSuppliers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Membros
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {filteredMembers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      {(activeTab === "all" || activeTab === "products" || activeTab === "suppliers") && (
        <div className="flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {activeTab === "products" || activeTab === "all" ? (
                <>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="trending">📈 Trending</SelectItem>
                  <SelectItem value="new">✨ Novo</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Results */}
      <div className="space-y-8">
        {/* Loading state */}
        {isLoadingProducts && query && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Products Section */}
        {!isLoadingProducts && (activeTab === "all" || activeTab === "products") && displayProducts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Produtos
              <span className="text-muted-foreground font-normal">({displayProducts.length})</span>
            </h2>
            <div className="grid gap-3">
              {displayProducts.map((product) => (
                <article
                  key={product.id}
                  onClick={() => navigate(`/produto/${product.id}`)}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusTag variant={product.status as "hot" | "trending" | "new"} />
                      <span className="text-xs text-muted-foreground">{product.category?.name}</span>
                    </div>
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.origin_price} → {product.resale_range}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Suppliers Section */}
        {(activeTab === "all" || activeTab === "suppliers") && displaySuppliers.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Fornecedores
              <span className="text-muted-foreground font-normal">({displaySuppliers.length})</span>
            </h2>
            <div className="grid gap-3">
              {displaySuppliers.map((supplier) => (
                <article
                  key={supplier.id}
                  onClick={() => navigate("/fornecedores")}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={supplier.status === "active" ? "default" : supplier.status === "paused" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {STATUS_LABELS[supplier.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ⭐ {getSupplierAvgRating(supplier.rating)}
                      </span>
                    </div>
                    <h3 className="font-medium truncate">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {supplier.categories.join(", ")}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Members Section */}
        {(activeTab === "all" || activeTab === "members") && filteredMembers.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Membros
              <span className="text-muted-foreground font-normal">({filteredMembers.length})</span>
            </h2>
            <div className="grid gap-3">
              {filteredMembers.map((member) => (
                <article
                  key={member.id}
                  onClick={() => navigate(`/perfil/${member.id}`)}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{member.name}</h3>
                    <p className={cn("text-sm", MEMBER_LEVELS[member.tier].color)}>
                      {MEMBER_LEVELS[member.tier].name}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!isLoadingProducts && totalResults === 0 && query && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground">
              Tente buscar por outros termos ou verifique a ortografia
            </p>
          </div>
        )}

        {/* Initial state */}
        {!query && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Digite para buscar</h3>
            <p className="text-muted-foreground">
              Busque por produtos, fornecedores ou membros da comunidade
            </p>
          </div>
        )}
      </div>
    </div>
  );
}