import { useEffect, type ChangeEvent } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSupplierAvatarUpload } from "@/hooks/use-supplier-avatar-upload";
import {
  SUPPLIER_LINK_TYPE_VALUES,
  SUPPLIER_STATUS_VALUES,
  type SupplierLinkItem,
  type SupplierStatus,
  useCreateSupplier,
  useUpdateSupplier,
} from "@/hooks/use-suppliers";

const optionalUrlSchema = z.string().url("URL inválida").or(z.literal(""));
const countryOptions = ["Brasil", "China"] as const;
const shippingMethodOptions = ["Vários", "Offline", "Frete LZ", "Mercado Livre", "Shopee", "AliExpress"] as const;

const supplierLinkSchema = z.object({
  type: z.enum(SUPPLIER_LINK_TYPE_VALUES, { required_error: "Selecione o tipo de link" }),
  url: optionalUrlSchema,
});

const adminSupplierFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120, "Nome deve ter no máximo 120 caracteres"),
  avatar_url: optionalUrlSchema,
  country: z.enum(countryOptions).or(z.literal("")),
  shipping_method: z.enum(shippingMethodOptions).or(z.literal("")),
  prep_time: z.string().max(120, "Tempo de preparo deve ter no máximo 120 caracteres"),
  shipping_time: z.string().max(120, "Tempo de envio deve ter no máximo 120 caracteres"),
  description: z.string().max(1200, "Descrição deve ter no máximo 1200 caracteres"),
  links: z.array(supplierLinkSchema),
  status: z.enum(SUPPLIER_STATUS_VALUES, { required_error: "Selecione um status" }),
});

type AdminSupplierFormValues = z.infer<typeof adminSupplierFormSchema>;

export interface EditableSupplier {
  id: string;
  name: string;
  avatar_url: string | null;
  country: string | null;
  shipping_method: string | null;
  prep_time: string | null;
  shipping_time: string | null;
  description: string | null;
  whatsapp_link: string | null;
  group_link: string | null;
  links: SupplierLinkItem[];
  status: string;
}

interface AdminSupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: EditableSupplier | null;
  onSuccess?: () => void;
}

const emptyValues: AdminSupplierFormValues = {
  name: "",
  avatar_url: "",
  country: "",
  shipping_method: "",
  prep_time: "",
  shipping_time: "",
  description: "",
  links: [{ type: "whatsapp", url: "" }],
  status: "pending",
};

function normalizeStatus(value?: string | null): SupplierStatus {
  if (value && SUPPLIER_STATUS_VALUES.includes(value as SupplierStatus)) {
    return value as SupplierStatus;
  }
  return "pending";
}

function toFormDefaults(supplier?: EditableSupplier | null): AdminSupplierFormValues {
  if (!supplier) return emptyValues;

  const links = (supplier.links && supplier.links.length > 0)
    ? supplier.links
    : [
        ...(supplier.whatsapp_link ? [{ type: "whatsapp", url: supplier.whatsapp_link }] : []),
        ...(supplier.group_link ? [{ type: "group", url: supplier.group_link }] : []),
      ];

  return {
    name: supplier.name ?? "",
    avatar_url: supplier.avatar_url ?? "",
    country: countryOptions.includes((supplier.country || "") as (typeof countryOptions)[number])
      ? (supplier.country as (typeof countryOptions)[number])
      : "",
    shipping_method: shippingMethodOptions.includes(
      (supplier.shipping_method || "") as (typeof shippingMethodOptions)[number]
    )
      ? (supplier.shipping_method as (typeof shippingMethodOptions)[number])
      : "",
    prep_time: supplier.prep_time ?? "",
    shipping_time: supplier.shipping_time ?? "",
    description: supplier.description ?? "",
    links: links.length > 0 ? links : [{ type: "whatsapp", url: "" }],
    status: normalizeStatus(supplier.status),
  };
}

export function AdminSupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: AdminSupplierFormDialogProps) {
  const { isAdmin } = useAuth();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const { uploadSupplierAvatar, isUploading: isUploadingAvatar } = useSupplierAvatarUpload();
  const isEditMode = !!supplier?.id;

  const form = useForm<AdminSupplierFormValues>({
    resolver: zodResolver(adminSupplierFormSchema),
    defaultValues: emptyValues,
  });
  const { fields: linkFields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  useEffect(() => {
    if (!open) return;
    form.reset(toFormDefaults(supplier));
  }, [form, open, supplier]);

  const isSubmitting = createSupplier.isPending || updateSupplier.isPending || isUploadingAvatar;

  const avatarPreviewUrl = form.watch("avatar_url");

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadResult = await uploadSupplierAvatar(file);
    if (uploadResult) {
      form.setValue("avatar_url", uploadResult.publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    event.target.value = "";
  };

  const handleSubmit = async (values: AdminSupplierFormValues) => {
    if (!isAdmin) return;

    const links = values.links
      .map((link) => ({
        type: link.type,
        url: link.url.trim(),
      }))
      .filter((link) => !!link.url);

    const whatsappLink = links.find((link) => link.type === "whatsapp")?.url || null;
    const groupLink = links.find((link) => link.type === "group")?.url || null;

    const payload = {
      name: values.name,
      avatar_url: values.avatar_url || null,
      country: values.country || null,
      shipping_method: values.shipping_method || null,
      prep_time: values.prep_time || null,
      shipping_time: values.shipping_time || null,
      description: values.description || null,
      links,
      whatsapp_link: whatsappLink,
      group_link: groupLink,
      status: values.status,
    };

    try {
      if (isEditMode && supplier) {
        await updateSupplier.mutateAsync({
          id: supplier.id,
          ...payload,
        });
      } else {
        await createSupplier.mutateAsync(payload);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Tratamento de erro já realizado nos hooks.
    }
  };

  if (!isAdmin) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso restrito</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apenas administradores podem cadastrar ou editar fornecedores.
          </p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar fornecedor" : "Cadastrar fornecedor"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Guangzhou Imports" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Você pode informar uma URL manualmente ou enviar uma imagem local.
                  </p>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG ou WebP. Máximo 5MB.
                  </p>
                  {isUploadingAvatar && (
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Enviando avatar...
                    </p>
                  )}
                  {avatarPreviewUrl && (
                    <img
                      src={avatarPreviewUrl}
                      alt="Preview do avatar"
                      className="h-16 w-16 rounded-lg border border-border object-cover"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <Select
                    value={field.value || "__none__"}
                    onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Não informado</SelectItem>
                      <SelectItem value="Brasil">Brasil</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipping_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de envio</FormLabel>
                  <Select
                    value={field.value || "__none__"}
                    onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de envio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Não informado</SelectItem>
                      {shippingMethodOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="prep_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de preparo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2-4 dias" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de envio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 8-15 dias" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações gerais sobre o fornecedor..."
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <FormLabel className="m-0">Redes e contato</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ type: "whatsapp", url: "" })}
                  disabled={isSubmitting}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  + Adicionar link
                </Button>
              </div>

              <div className="space-y-2">
                {linkFields.map((linkField, index) => (
                  <div key={linkField.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[170px,1fr,40px]">
                    <FormField
                      control={form.control}
                      name={`links.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="group">Grupo</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="site">Site</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`links.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={isSubmitting || linkFields.length <= 1}
                        aria-label="Remover link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 border-t border-border pt-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : isEditMode ? (
                  "Salvar alterações"
                ) : (
                  "Cadastrar fornecedor"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
