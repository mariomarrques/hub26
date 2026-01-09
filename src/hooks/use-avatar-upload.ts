import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UseAvatarUploadReturn {
  uploadAvatar: (file: File, userId: string) => Promise<string | null>;
  removeAvatar: (userId: string) => Promise<boolean>;
  isUploading: boolean;
}

export function useAvatarUpload(): UseAvatarUploadReturn {
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo inválido. Use JPG, PNG ou WebP.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo 2MB.");
      return false;
    }
    return true;
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${userId}/avatar.${fileExt}`;

      // Remove old avatar if exists
      await supabase.storage.from("avatars").remove([filePath]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Avatar atualizado com sucesso!");
      return avatarUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Erro ao fazer upload do avatar.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async (userId: string): Promise<boolean> => {
    setIsUploading(true);
    try {
      // List files in user folder
      const { data: files } = await supabase.storage
        .from("avatars")
        .list(userId);

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from("avatars").remove(filePaths);
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Avatar removido com sucesso!");
      return true;
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Erro ao remover avatar.");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, removeAvatar, isUploading };
}
