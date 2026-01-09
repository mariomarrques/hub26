import { useEffect } from "react";
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
import { useCategories } from "@/hooks/use-categories";
import {
  ProductWithCategory,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-products";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  image: z.string().url("URL da imagem inválida"),
  origin_price: z.string().min(1, "Preço de origem é obrigatório"),
  resale_range: z.string().min(1, "Faixa de revenda é obrigatória"),
  status: z.string(),
  category_id: z.string().optional(),
  admin_note: z.string().optional(),
  affiliate_link: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithCategory | null;
  defaultCategoryId?: string;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  defaultCategoryId,
}: ProductFormDialogProps) {
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!product;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: "",
      origin_price: "",
      resale_range: "",
      status: "new",
      category_id: defaultCategoryId || "",
      admin_note: "",
      affiliate_link: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        image: product.image,
        origin_price: product.origin_price,
        resale_range: product.resale_range,
        status: product.status,
        category_id: product.category_id || "",
        admin_note: product.admin_note || "",
        affiliate_link: product.affiliate_link || "",
      });
    } else {
      form.reset({
        name: "",
        image: "",
        origin_price: "",
        resale_range: "",
        status: "new",
        category_id: defaultCategoryId || "",
        admin_note: "",
        affiliate_link: "",
      });
    }
  }, [product, defaultCategoryId, form]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      image: data.image,
      origin_price: data.origin_price,
      resale_range: data.resale_range,
      status: data.status,
      category_id: data.category_id || undefined,
      admin_note: data.admin_note,
      affiliate_link: data.affiliate_link,
    };

    if (isEditing) {
      await updateProduct.mutateAsync({ id: product.id, ...payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camisa Polo Premium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
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
                      <Input placeholder="R$ 120 - 180" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="hot">Hot</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="affiliate_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Afiliado</FormLabel>
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
                  <FormLabel>Nota do Admin</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o produto..."
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
              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
