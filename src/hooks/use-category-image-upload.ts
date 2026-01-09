import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export function useCategoryImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP.");
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Arquivo muito grande. Máximo 2MB.");
      return false;
    }
    return true;
  };

  const uploadCategoryImage = async (file: File, slug: string): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("categories")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("categories")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Erro ao fazer upload: " + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeCategoryImage = async (imageUrl: string): Promise<boolean> => {
    try {
      const fileName = imageUrl.split("/").pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from("categories")
        .remove([fileName]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast.error("Erro ao remover imagem: " + error.message);
      return false;
    }
  };

  return { uploadCategoryImage, removeCategoryImage, isUploading };
}
