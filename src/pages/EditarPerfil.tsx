import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { uploadAvatar, removeAvatar, isUploading } = useAvatarUpload();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
    },
  });

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    await uploadAvatar(file, user.id);
    await refreshProfile();
  };

  const handleAvatarRemove = async () => {
    if (!user) return;
    await removeAvatar(user.id);
    await refreshProfile();
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: data.name })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Perfil atualizado com sucesso!");
      navigate("/perfil");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-lg max-w-md mx-auto">
      <div className="flex items-center gap-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/perfil")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Perfil</h1>
          <p className="text-muted-foreground text-sm">
            Atualize suas informações pessoais
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-lg border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
            <AvatarUpload
              currentUrl={profile?.avatar_url}
              name={profile?.name || ""}
              isUploading={isUploading}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-xs">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado.
              </p>
            </div>

            <div className="flex gap-sm pt-md">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/perfil")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-xs animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
