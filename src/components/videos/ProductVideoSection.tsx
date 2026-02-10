import { useState } from "react";
import { Video } from "lucide-react";
import { useProductVideos, type ProductVideo } from "@/hooks/use-product-videos";
import { VideoCard } from "./VideoCard";
import { PandaVideoModal } from "./PandaVideoModal";

interface ProductVideoSectionProps {
  productId: string;
}

export function ProductVideoSection({ productId }: ProductVideoSectionProps) {
  const { videos, isLoading } = useProductVideos(productId);
  const [selectedVideo, setSelectedVideo] = useState<ProductVideo | null>(null);

  if (isLoading || videos.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Vídeos do Produto</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPlay={setSelectedVideo}
          />
        ))}
      </div>

      <PandaVideoModal
        video={selectedVideo}
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      />
    </div>
  );
}
