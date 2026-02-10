import { useState } from "react";
import { Video, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useProductVideos } from "@/hooks/use-product-videos";

interface ProductVideoManagerProps {
  productId: string;
}

export function ProductVideoManager({ productId }: ProductVideoManagerProps) {
  const { videos, isLoading, createVideo, deleteVideo } = useProductVideos(productId);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [pandaVideoId, setPandaVideoId] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [downloadableUrl, setDownloadableUrl] = useState("");
  const [isDownloadable, setIsDownloadable] = useState(true);

  const resetForm = () => {
    setTitle("");
    setPandaVideoId("");
    setEmbedUrl("");
    setThumbnailUrl("");
    setDownloadableUrl("");
    setIsDownloadable(true);
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    createVideo.mutate({
      product_id: productId,
      title: title.trim(),
      panda_video_id: pandaVideoId.trim() || null,
      embed_url: embedUrl.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      downloadable_url: downloadableUrl.trim() || null,
      is_downloadable: isDownloadable,
      sort_order: videos.length,
    }, { onSuccess: resetForm });
  };

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Vídeos do Produto (PandaVídeo)</label>
        </div>
        {!showForm && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
          </Button>
        )}
      </div>

      {/* Existing videos */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando vídeos...
        </div>
      ) : videos.length > 0 ? (
        <div className="space-y-2">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2 min-w-0">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt="" className="w-12 h-8 object-cover rounded" />
                ) : (
                  <div className="w-12 h-8 bg-muted/40 rounded flex items-center justify-center">
                    <Video className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm truncate">{v.title}</span>
                {v.is_downloadable && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">HD</span>
                )}
              </div>
              <Button
                type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                onClick={() => deleteVideo.mutate(v.id)}
                disabled={deleteVideo.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Nenhum vídeo adicionado ainda.</p>
      )}

      {/* Add form */}
      {showForm && (
        <div className="space-y-3 p-3 rounded-lg border bg-muted/10">
          <div>
            <Label className="text-xs">Título do vídeo *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Review do produto" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Panda Video ID</Label>
            <Input value={pandaVideoId} onChange={(e) => setPandaVideoId(e.target.value)} placeholder="ID do vídeo no PandaVídeo" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Embed URL (alternativo)</Label>
            <Input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://player-vz-..." className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Thumbnail URL</Label>
            <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">URL de Download (Full HD)</Label>
            <Input value={downloadableUrl} onChange={(e) => setDownloadableUrl(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isDownloadable} onCheckedChange={setIsDownloadable} />
            <Label className="text-xs">Permitir download</Label>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAdd} disabled={createVideo.isPending || !title.trim()}>
              {createVideo.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Adicionar Vídeo
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
