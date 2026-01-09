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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  BazarProduct,
  useCreateBazarProduct,
  useUpdateBazarProduct,
} from "@/hooks/use-bazar-products";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  image: z.string().url("URL da imagem inválida"),
  price: z.string().min(1, "Preço é obrigatório"),
  original_price: z.string().optional(),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  max_stock: z.coerce.number().min(1, "Estoque máximo deve ser maior que 0"),
  is_kit: z.boolean(),
  kit_items: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BazarProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: BazarProduct | null;
}

export function BazarProductFormDialog({
  open,
  onOpenChange,
  product,
}: BazarProductFormDialogProps) {
  const createProduct = useCreateBazarProduct();
  const updateProduct = useUpdateBazarProduct();
  const isEditing = !!product;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: "",
      price: "",
      original_price: "",
      stock: 0,
      max_stock: 100,
      is_kit: false,
      kit_items: undefined,
    },
  });

  const watchIsKit = form.watch("is_kit");

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        image: product.image,
        price: product.price,
        original_price: product.original_price || "",
        stock: product.stock,
        max_stock: product.max_stock,
        is_kit: product.is_kit,
        kit_items: product.kit_items || undefined,
      });
    } else {
      form.reset({
        name: "",
        image: "",
        price: "",
        original_price: "",
        stock: 0,
        max_stock: 100,
        is_kit: false,
        kit_items: undefined,
      });
    }
  }, [product, form]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      image: data.image,
      price: data.price,
      original_price: data.original_price || undefined,
      stock: data.stock,
      max_stock: data.max_stock,
      is_kit: data.is_kit,
      kit_items: data.is_kit ? data.kit_items : undefined,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Produto do Bazar" : "Novo Produto do Bazar"}
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
                    <Input placeholder="Ex: Mochila Tática Premium" {...field} />
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 89,90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="original_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Original</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 129,90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Máximo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_kit"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>É um Kit?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marque se o produto é um kit com múltiplos itens
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchIsKit && (
              <FormField
                control={form.control}
                name="kit_items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de Itens no Kit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
