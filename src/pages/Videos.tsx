import { useState, useMemo } from "react";
import { Search, X, Play, Download, Video, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideos } from "@/hooks/use-videos";
import { useDebounce } from "@/hooks/use-debounce";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const Videos = () => {
  const { videos, isLoading, error } = useVideos();
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 300);

  const categories = useMemo(() => {
    const cats = new Set(videos.map((v) => v.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (debouncedSearch && !v.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
      return true;
    });
  }, [videos, debouncedSearch, categoryFilter]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-page-title">
          Biblioteca de <span className="text-primary">Vídeos</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Vídeos de alta qualidade para divulgação e marketing
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vídeos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters toggle */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Collapsible Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <div className="flex flex-wrap gap-2 p-4 bg-card border border-border rounded-xl">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("all")}
                >
                  Todas
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            {categoryFilter !== "all" && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="self-end text-xs text-muted-foreground">
                <X className="h-3 w-3 mr-1" /> Limpar filtros
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Video className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar vídeos</h3>
          <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && (
        <>
          {filteredVideos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group rounded-xl border border-border bg-card overflow-hidden card-hover hover:shadow-card-hover"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted/20 overflow-hidden">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Play button */}
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
                    >
                      <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </a>
                    {/* Download badge */}
                    <a
                      href={video.video_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-sm border border-border text-xs font-medium text-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-3 w-3" />
                      Baixar
                    </a>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground truncate">{video.title}</h3>
                    {video.category && (
                      <p className="text-xs text-muted-foreground mt-1">{video.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Video className="h-12 w-12 text-muted-foreground/20 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum vídeo encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {search ? "Tente ajustar sua busca." : "Novos vídeos serão adicionados em breve."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Videos;
