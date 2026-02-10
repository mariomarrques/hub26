import { useState, useMemo } from "react";
import { Search, X, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useHubVideos, type HubVideo } from "@/hooks/use-hub-videos";
import { useDebounce } from "@/hooks/use-debounce";
import { VideoCard } from "@/components/videos/VideoCard";
import { PandaVideoModal } from "@/components/videos/PandaVideoModal";

const Videos = () => {
  const { videos, isLoading, error } = useHubVideos();
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<HubVideo | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filteredVideos = useMemo(() => {
    if (!debouncedSearch) return videos;
    const q = debouncedSearch.toLowerCase();
    return videos.filter((v) =>
      v.title.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q)
    );
  }, [videos, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-page-title">
          Biblioteca de <span className="text-primary">Vídeos</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Vídeos de alta qualidade para divulgação e marketing
        </p>
      </div>

      <div className="relative max-w-md">
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

      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Video className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar vídeos</h3>
          <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        </div>
      )}

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

      {!isLoading && !error && (
        <>
          {filteredVideos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} onPlay={setSelectedVideo} />
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

      <PandaVideoModal
        video={selectedVideo}
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      />
    </div>
  );
};

export default Videos;
