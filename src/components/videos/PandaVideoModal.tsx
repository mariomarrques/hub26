import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import type { HubVideo } from "@/hooks/use-hub-videos";

interface PandaVideoModalProps {
  video: HubVideo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PandaVideoModal({ video, open, onOpenChange }: PandaVideoModalProps) {
  if (!video) return null;

  const embedSrc = video.embed_url || 
    (video.panda_video_id ? `https://player-vz-7b3143cf-d51.tv.pandavideo.com.br/embed/?v=${video.panda_video_id}` : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg p-0 overflow-hidden mx-auto">
        <DialogHeader className="p-3 pb-0">
          <DialogTitle className="text-base">{video.title}</DialogTitle>
        </DialogHeader>

        <div className="px-3 pb-3 space-y-3">
          {embedSrc ? (
            <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: "9 / 16", maxHeight: "75vh" }}>
              <iframe
                src={embedSrc}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full rounded-lg bg-muted/20 flex items-center justify-center" style={{ aspectRatio: "9 / 16", maxHeight: "75vh" }}>
              <Play className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground ml-2">Vídeo não disponível</p>
            </div>
          )}

          {video.is_downloadable && video.downloadable_url && (
            <div className="flex justify-center">
              <Button
                size="default"
                className="gap-2 font-semibold text-sm px-6 w-full sm:w-auto"
                onClick={() => window.open(video.downloadable_url!, "_blank", "noopener,noreferrer")}
              >
                <Download className="h-4 w-4" />
                Baixar em Full HD
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
