import { Play, Download, Video } from "lucide-react";
import type { HubVideo } from "@/hooks/use-hub-videos";

interface VideoCardProps {
  video: HubVideo;
  onPlay: (video: HubVideo) => void;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  return (
    <div
      className="group rounded-xl border border-white/[0.06] bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-200 ease-in-out hover:border-white/[0.1] hover:shadow-[0_4px_24px_-6px_hsl(var(--glow))] cursor-pointer"
      onClick={() => onPlay(video)}
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
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity shadow-lg">
            <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* Download badge */}
        {video.is_downloadable && video.downloadable_url && (
          <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-sm border border-border text-xs font-medium text-foreground flex items-center gap-1">
            <Download className="h-3 w-3" />
            HD
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground truncate">{video.title}</h3>
        {video.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{video.description}</p>
        )}
      </div>
    </div>
  );
}
