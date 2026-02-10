import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useHubVideos, type HubVideo } from "@/hooks/use-hub-videos";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Video, Upload, Download } from "lucide-react";
import { toast } from "sonner";

type VideoFormData = {
  title: string;
  original_filename: string;
  panda_video_id: string;
  embed_url: string;
  thumbnail_url: string;
  downloadable_url: string;
  description: string;
  is_downloadable: boolean;
};

const emptyForm: VideoFormData = {
  title: "",
  original_filename: "",
  panda_video_id: "",
  embed_url: "",
  thumbnail_url: "",
  downloadable_url: "",
  description: "",
  is_downloadable: true,
};

export default function AdminVideos() {
  const { videos, isLoading, createVideo, updateVideo, deleteVideo } = useHubVideos();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HubVideo | null>(null);
  const [form, setForm] = useState<VideoFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingVideo(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (video: HubVideo) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      original_filename: video.original_filename || "",
      panda_video_id: video.panda_video_id || "",
      embed_url: video.embed_url || "",
      thumbnail_url: video.thumbnail_url || "",
      downloadable_url: video.downloadable_url || "",
      description: video.description || "",
      is_downloadable: video.is_downloadable,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        original_filename: form.original_filename.trim() || null,
        panda_video_id: form.panda_video_id.trim() || null,
        embed_url: form.embed_url.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        downloadable_url: form.downloadable_url.trim() || null,
        description: form.description.trim() || null,
        is_downloadable: form.is_downloadable,
        file_size_mb: null,
        upload_status: "manual",
        sort_order: 0,
      };

      if (editingVideo) {
        await updateVideo.mutateAsync({ id: editingVideo.id, ...payload });
      } else {
        await createVideo.mutateAsync(payload);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (video: HubVideo) => {
    if (!confirm(`Remover "${video.title}"?`)) return;
    await deleteVideo.mutateAsync(video.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Biblioteca de Vídeos</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os vídeos disponíveis no Hub
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Vídeo
          </Button>
        </div>

        {/* Future upload placeholder */}
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 flex items-center justify-center gap-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Upload direto de vídeos</span>
          <Badge variant="secondary" className="text-xs">Em breve</Badge>
        </div>

        {/* Videos table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Video className="h-12 w-12 text-muted-foreground/20 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold mb-2">Nenhum vídeo cadastrado</h3>
            <p className="text-sm text-muted-foreground">Clique em "Adicionar Vídeo" para começar.</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Thumb</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Arquivo Original</TableHead>
                  <TableHead className="w-24 text-center">Download</TableHead>
                  <TableHead className="w-28 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt="" className="h-10 w-16 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-16 rounded bg-muted flex items-center justify-center">
                          <Video className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {video.original_filename || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {video.is_downloadable && video.downloadable_url ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Download className="h-3 w-3" /> HD
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(video)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(video)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVideo ? "Editar Vídeo" : "Adicionar Vídeo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Review Air Jordan 1 Travis Scott" />
            </div>
            <div className="space-y-2">
              <Label>Nome original do arquivo</Label>
              <Input value={form.original_filename} onChange={(e) => setForm({ ...form, original_filename: e.target.value })}
                placeholder="Ex: aj1_travis_review_final.mp4" />
            </div>
            <div className="space-y-2">
              <Label>Panda Video ID</Label>
              <Input value={form.panda_video_id} onChange={(e) => setForm({ ...form, panda_video_id: e.target.value })}
                placeholder="ID do vídeo no PandaVídeo" />
            </div>
            <div className="space-y-2">
              <Label>URL de Embed</Label>
              <Input value={form.embed_url} onChange={(e) => setForm({ ...form, embed_url: e.target.value })}
                placeholder="https://player-vz-..." />
            </div>
            <div className="space-y-2">
              <Label>URL da Thumbnail</Label>
              <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>URL de Download (Full HD)</Label>
              <Input value={form.downloadable_url} onChange={(e) => setForm({ ...form, downloadable_url: e.target.value })}
                placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição opcional do vídeo..." rows={3} />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label>Permitir download</Label>
              <Switch checked={form.is_downloadable}
                onCheckedChange={(checked) => setForm({ ...form, is_downloadable: checked })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingVideo ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
