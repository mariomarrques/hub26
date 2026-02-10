import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import type { ProductVideo } from "@/hooks/use-product-videos";

interface PandaVideoModalProps {
  video: ProductVideo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PandaVideoModal({ video, open, onOpenChange }: PandaVideoModalProps) {
  if (!video) return null;

  const embedSrc = video.embed_url || 
    (video.panda_video_id ? `https://player-vz-7b3143cf-d51.tv.pandavideo.com.br/embed/?v=${video.panda_video_id}` : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg">{video.title}</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Player */}
          {embedSrc ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={embedSrc}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-lg bg-muted/20 flex items-center justify-center">
              <Play className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground ml-2">Vídeo não disponível</p>
            </div>
          )}

          {/* Download Button */}
          {video.is_downloadable && video.downloadable_url && (
            <div className="flex justify-center">
              <Button
                size="lg"
                className="gap-3 font-semibold text-base px-8"
                onClick={() => window.open(video.downloadable_url!, "_blank", "noopener,noreferrer")}
              >
                <Download className="h-5 w-5" />
                Baixar em Full HD
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
