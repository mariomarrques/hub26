import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg"];

export interface ReviewImageUploadResult {
  path: string;
  publicUrl: string;
}

export function useReviewImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const isMimeTypeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(extension);

    if (!isMimeTypeAllowed && !isExtensionAllowed) {
      toast.error("Formato inválido. Use PNG, JPG ou JPEG.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return false;
    }

    return true;
  };

  const uploadReviewImage = async (file: File): Promise<ReviewImageUploadResult | null> => {
    if (!validateFile(file)) return null;

    setIsUploading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Você precisa estar autenticado para enviar imagem.");
        return null;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const normalizedExt = ALLOWED_EXTENSIONS.includes(fileExt) ? fileExt : "jpg";
      const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${normalizedExt}`;

      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("review-images").getPublicUrl(filePath);

      return {
        path: filePath,
        publicUrl,
      };
    } catch (error) {
      console.error("Error uploading review image:", error);
      toast.error("Erro ao fazer upload da imagem.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadReviewImage, isUploading };
}
