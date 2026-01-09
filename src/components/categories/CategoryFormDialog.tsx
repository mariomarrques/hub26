import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CategoryImageUpload } from "./CategoryImageUpload";
import { useCategories, Category } from "@/hooks/use-categories";
import { useCategoryImageUpload } from "@/hooks/use-category-image-upload";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEditMode = !!category;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const { createCategory, updateCategory } = useCategories();
  const { uploadCategoryImage, removeCategoryImage, isUploading } = useCategoryImageUpload();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const watchName = form.watch("name");

  // Populate form when editing
  useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
      setPreviewUrl(category.image);
      setHasNewImage(false);
    }
  }, [category, open, form]);

  useEffect(() => {
    if (watchName && !isEditMode) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, form, isEditMode]);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setHasNewImage(true);
  };

  const handleRemoveImage = () => {
    if (previewUrl && hasNewImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(null);
    setHasNewImage(true);
  };

  const resetForm = () => {
    form.reset();
    if (previewUrl && hasNewImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(null);
    setHasNewImage(false);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    if (!previewUrl && !imageFile) {
      toast.error("Selecione uma imagem para a categoria");
      return;
    }

    let imageUrl = category?.image || "";

    // Upload new image if changed
    if (hasNewImage && imageFile) {
      const newImageUrl = await uploadCategoryImage(imageFile, values.slug);
      if (!newImageUrl) return;
      
      // Remove old image if editing
      if (isEditMode && category?.image) {
        await removeCategoryImage(category.image);
      }
      
      imageUrl = newImageUrl;
    }

    if (isEditMode && category) {
      updateCategory.mutate(
        {
          id: category.id,
          name: values.name,
          slug: values.slug,
          image: imageUrl,
          description: values.description || null,
        },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
          },
        }
      );
    } else {
      createCategory.mutate(
        {
          name: values.name,
          slug: values.slug,
          image: imageUrl,
          description: values.description || null,
        },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isPending = isUploading || createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Categoria" : "Adicionar Categoria"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel>Imagem *</FormLabel>
              <div className="mt-2">
                <CategoryImageUpload
                  previewUrl={previewUrl}
                  isUploading={isUploading}
                  onFileSelect={handleFileSelect}
                  onRemove={handleRemoveImage}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camisetas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug {!isEditMode && "(gerado automaticamente)"}</FormLabel>
                  <FormControl>
                    <Input placeholder="camisetas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descrição da categoria"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : isEditMode ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
