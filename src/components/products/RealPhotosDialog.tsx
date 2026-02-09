import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RealPhotosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  photos: string[];
}

export function RealPhotosDialog({ open, onOpenChange, productName, photos }: RealPhotosDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => setCurrentIndex((i) => (i + 1) % photos.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Fotos Reais — {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Main image */}
          <div className="aspect-square bg-panel rounded-lg overflow-hidden">
            <img
              src={photos[currentIndex]}
              alt={`Foto real ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={goPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={goNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {photos.map((photo, i) => (
              <button
                key={i}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  i === currentIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                )}
                onClick={() => setCurrentIndex(i)}
              >
                <img src={photo} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {currentIndex + 1} de {photos.length} fotos reais
        </p>
      </DialogContent>
    </Dialog>
  );
}
