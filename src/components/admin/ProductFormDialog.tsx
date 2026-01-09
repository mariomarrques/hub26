import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2, Upload, X } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useProductImageUpload } from "@/hooks/use-product-image-upload";
import type { Product } from "@/hooks/use-products";

const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  origin_price: z.string().min(1, "Preço de origem é obrigatório"),
  resale_range: z.string().min(1, "Faixa de revenda é obrigatória"),
  status: z.enum(["new", "hot", "trending", "paused"]),
  category_id: z.string().uuid("Selecione uma categoria"),
  admin_note: z.string().optional(),
  affiliate_link: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: {
    name: string;
    origin_price: string;
    resale_range: string;
    status: string;
    category_id: string;
    admin_note?: string;
    affiliate_link?: string;
    image: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const statusOptions = [
  { value: "new", label: "Novo" },
  { value: "hot", label: "Hot" },
  { value: "trending", label: "Tendência" },
  { value: "paused", label: "Pausado" },
];

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading,
}: ProductFormDialogProps) {
  const { categories } = useCategories();
  const { uploadImage, isUploading } = useProductImageUpload();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      origin_price: "",
      resale_range: "",
      status: "new",
      category_id: "",
      admin_note: "",
      affiliate_link: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        origin_price: product.origin_price,
        resale_range: product.resale_range,
        status: product.status as "new" | "hot" | "trending" | "paused",
        category_id: product.category_id || "",
        admin_note: product.admin_note || "",
        affiliate_link: product.affiliate_link || "",
      });
      setImageUrl(product.image);
      setImagePreview(product.image);
    } else {
      form.reset({
        name: "",
        origin_price: "",
        resale_range: "",
        status: "new",
        category_id: "",
        admin_note: "",
        affiliate_link: "",
      });
      setImageUrl("");
      setImagePreview("");
    }
  }, [product, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const url = await uploadImage(file);
    if (url) {
      setImageUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImagePreview("");
  };

  const handleSubmit = async (values: ProductFormValues) => {
    if (!imageUrl) {
      form.setError("name", { message: "Imagem é obrigatória" });
      return;
    }
    await onSubmit({
      name: values.name,
      origin_price: values.origin_price,
      resale_range: values.resale_range,
      status: values.status,
      category_id: values.category_id,
      admin_note: values.admin_note,
      affiliate_link: values.affiliate_link,
      image: imageUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem do Produto</label>
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para fazer upload
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Relógio Minimalista" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Origem</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 45,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resale_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faixa de Revenda</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 89 - R$ 129" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="affiliate_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Afiliado (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota do Admin (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações internas sobre o produto..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : product ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Produto"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
