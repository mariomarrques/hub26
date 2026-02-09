import { useState, useMemo } from "react";
import { Search, X, Package, AlertTriangle, SlidersHorizontal } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { RealPhotosDialog } from "@/components/products/RealPhotosDialog";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { useProducts, type Product } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

type SortOption = "default" | "recent" | "price_asc" | "price_desc";

function parseYuanPrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[¥R$\s]/g, "").replace(",", ".");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

const Index = () => {
  const { isAdmin, isModerator } = useAuth();
  const { data: products, isLoading, error, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const canManage = isAdmin || isModerator;

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const debouncedSearch = useDebounce(search, 300);

  // Admin dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [duplicatingProduct, setDuplicatingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductCardData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real photos
  const [realPhotosOpen, setRealPhotosOpen] = useState(false);
  const [realPhotosProduct, setRealPhotosProduct] = useState<{ name: string; photos: string[] }>({ name: "", photos: [] });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = products.filter((p) => {
      if (debouncedSearch) {
        if (!p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      }
      if (categoryFilter !== "all") {
        if (p.category_id !== categoryFilter) return false;
      }
      return true;
    });

    switch (sortBy) {
      case "recent":
        result = [...result].sort((a, b) =>
          new Date(b.updated_at || b.created_at || "").getTime() - new Date(a.updated_at || a.created_at || "").getTime()
        );
        break;
      case "price_asc":
        result = [...result].sort((a, b) => parseYuanPrice(a.origin_price) - parseYuanPrice(b.origin_price));
        break;
      case "price_desc":
        result = [...result].sort((a, b) => parseYuanPrice(b.origin_price) - parseYuanPrice(a.origin_price));
        break;
    }

    return result;
  }, [products, debouncedSearch, categoryFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setSortBy("default");
  };

  const hasActiveFilters = !!debouncedSearch || categoryFilter !== "all";

  // Admin handlers
  const findProduct = (card: ProductCardData) => products?.find((p) => p.id === card.id) || null;

  const handleEdit = (card: ProductCardData) => {
    setDuplicatingProduct(null);
    setEditingProduct(findProduct(card));
    setFormOpen(true);
  };

  const handleDuplicate = (card: ProductCardData) => {
    setEditingProduct(null);
    setDuplicatingProduct(findProduct(card));
    setFormOpen(true);
  };

  const handleDeleteClick = (card: ProductCardData) => {
    setProductToDelete(card);
    setDeleteDialogOpen(true);
  };

  const handleViewRealPhotos = (card: ProductCardData) => {
    // TODO: real photos from DB - for now placeholder
    const product = findProduct(card);
    if (product) {
      setRealPhotosProduct({ name: product.name, photos: [product.image] });
      setRealPhotosOpen(true);
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    origin_price: string;
    resale_range: string;
    status: string;
    category_id: string;
    admin_note?: string;
    affiliate_link?: string;
    image: string;
  }) => {
    setIsSubmitting(true);
    try {
      if (editingProduct && !duplicatingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
      } else {
        await createProduct.mutateAsync(data);
      }
      setFormOpen(false);
      setDuplicatingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch {
      toast.error("Erro ao excluir produto");
    }
  };

  const mapToCardData = (p: Product): ProductCardData => ({
    id: p.id,
    name: p.name,
    image: p.image,
    originPrice: p.origin_price,
    affiliateLink: p.affiliate_link || undefined,
    hasRealPhotos: false, // TODO: real photos support
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-page-title">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          Encontre produtos para importação via agente de compras
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Mais recentes</SelectItem>
            <SelectItem value="recent">Modificados recentemente</SelectItem>
            <SelectItem value="price_desc">Mais caro (¥)</SelectItem>
            <SelectItem value="price_asc">Mais barato (¥)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground self-center">
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar produtos</h3>
          <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={mapToCardData(product)}
                  index={index}
                  canManage={canManage}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                  onViewRealPhotos={handleViewRealPhotos}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/20 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {hasActiveFilters ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {hasActiveFilters
                  ? "Tente ajustar seus filtros ou busca."
                  : "Novos produtos serão adicionados em breve."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Admin: Form Dialog */}
      {canManage && (
        <ProductFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setDuplicatingProduct(null);
          }}
          product={duplicatingProduct || editingProduct}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
          isDuplicating={!!duplicatingProduct}
        />
      )}

      {/* Admin: Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Real Photos Dialog */}
      <RealPhotosDialog
        open={realPhotosOpen}
        onOpenChange={setRealPhotosOpen}
        productName={realPhotosProduct.name}
        photos={realPhotosProduct.photos}
      />
    </div>
  );
};

export default Index;
