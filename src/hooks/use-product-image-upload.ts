import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProductImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao fazer upload da imagem");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      const urlParts = imageUrl.split("/products/");
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from("products")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  };

  return { uploadImage, deleteImage, isUploading };
}
