import { useEffect, useMemo, useState } from "react";
import { Loader2, Star, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSubmitSupplierReview, type SupplierListItem } from "@/hooks/use-suppliers";
import { useReviewImageUpload } from "@/hooks/use-review-image-upload";

interface SupplierReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SupplierListItem | null;
}

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function RatingSelector({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const isActive = value <= rating;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-full p-1.5 transition-all ${
              isActive
                ? "bg-warning/15 text-warning"
                : "text-muted-foreground/60 hover:bg-muted/60 hover:text-warning"
            }`}
            aria-label={`Selecionar ${value} estrela${value > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-5 w-5 ${isActive ? "fill-warning text-warning" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function SupplierReviewDialog({ open, onOpenChange, supplier }: SupplierReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const submitReview = useSubmitSupplierReview();
  const { uploadReviewImage, isUploading } = useReviewImageUpload();

  const fileLabel = useMemo(() => {
    if (!imageFile) return "";
    const sizeMb = (imageFile.size / (1024 * 1024)).toFixed(1);
    return `${imageFile.name} (${sizeMb}MB)`;
  }, [imageFile]);

  const imagePreviewUrl = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!open) {
      setRating(0);
      setComment("");
      setImageFile(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Use PNG, JPG ou JPEG.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!supplier) return;

    if (rating < 1 || rating > 5) {
      toast.error("Selecione uma nota de 1 a 5.");
      return;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const uploadResult = await uploadReviewImage(imageFile);
      if (!uploadResult) return;
      imageUrl = uploadResult.publicUrl;
    }

    await submitReview.mutateAsync({
      supplier_id: supplier.id,
      rating,
      comment,
      image_url: imageUrl,
    });

    onOpenChange(false);
  };

  const isPending = submitReview.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Avaliar {supplier?.name || "fornecedor"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Nota obrigatória</p>
              <span className="text-xs text-muted-foreground">
                {rating > 0 ? `${rating}/5` : "Selecione uma nota"}
              </span>
            </div>
            <RatingSelector rating={rating} onChange={setRating} />
            <p className="text-xs text-muted-foreground">Selecione de 1 a 5 estrelas.</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-2.5">
            <p className="text-sm font-medium text-foreground">Comentário (opcional)</p>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Compartilhe sua experiência..."
              rows={4}
              className="resize-none rounded-lg border-border/80 bg-background"
            />
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
            <p className="text-sm font-medium text-foreground">Imagem (opcional)</p>

            <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30">
              <Upload className="h-4 w-4" />
              <span>Selecionar imagem</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                disabled={isPending}
                className="hidden"
              />
            </label>

            <p className="text-xs text-muted-foreground">Formatos aceitos: PNG, JPG, JPEG. Máximo 5MB.</p>

            {fileLabel && (
              <div className="space-y-2">
                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Pré-visualização da imagem"
                    className="w-full max-h-52 rounded-lg border border-border/80 object-cover"
                  />
                )}
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 truncate">
                    <Upload className="h-3.5 w-3.5" />
                    <span className="truncate">{fileLabel}</span>
                  </div>
                  <button
                    type="button"
                    className="ml-2 rounded-sm p-0.5 hover:bg-muted"
                    onClick={() => setImageFile(null)}
                    disabled={isPending}
                    aria-label="Remover imagem"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
            Após o envio, sua avaliação ficará aguardando aprovação antes de aparecer publicamente.
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="h-10 w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button className="h-10 w-full sm:w-auto" onClick={handleSubmit} disabled={isPending || !supplier}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar avaliação"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
