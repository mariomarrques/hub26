import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const STORAGE_BUCKET = "products";
const SUPPLIER_AVATAR_PREFIX = "supplier-avatars";

export interface SupplierAvatarUploadResult {
  path: string;
  publicUrl: string;
}

export function useSupplierAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const extAllowed = ALLOWED_EXTENSIONS.includes(extension);

    if (!mimeAllowed && !extAllowed) {
      toast.error("Formato inválido. Use PNG, JPG, JPEG ou WebP.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return false;
    }

    return true;
  };

  const uploadSupplierAvatar = async (
    file: File
  ): Promise<SupplierAvatarUploadResult | null> => {
    if (!validateFile(file)) return null;

    setIsUploading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Você precisa estar autenticado para enviar avatar.");
        return null;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const normalizedExt = ALLOWED_EXTENSIONS.includes(fileExt) ? fileExt : "jpg";
      const filePath = `${SUPPLIER_AVATAR_PREFIX}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${normalizedExt}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

      toast.success("Avatar enviado com sucesso!");
      return {
        path: filePath,
        publicUrl,
      };
    } catch (error) {
      console.error("Error uploading supplier avatar:", error);
      toast.error("Erro ao fazer upload do avatar do fornecedor.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadSupplierAvatar, isUploading };
}
