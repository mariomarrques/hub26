import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Pause, Sparkles, Star, Truck } from "lucide-react";
import { Supplier } from "@/data/mockData";
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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const AVAILABLE_CATEGORIES = [
  "Camisas",
  "Calçados",
  "Acessórios",
  "Grifes",
  "Eletrônicos",
  "Streetwear",
  "Relógios",
  "Bolsas",
];

const supplierSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
  status: z.enum(["active", "paused", "new"], { required_error: "Selecione um status" }),
  quality: z.number().min(0).max(5),
  delivery: z.number().min(0).max(5),
  categories: z.array(z.string()).min(1, "Selecione pelo menos 1 categoria"),
  adminNote: z.string().max(300, "Nota deve ter no máximo 300 caracteres").optional(),
  contact: z.string().max(100, "Contato deve ter no máximo 100 caracteres").optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (supplier: Omit<Supplier, "id">) => void;
}

function StatusBadgePreview({ status }: { status: Supplier["status"] }) {
  const config = {
    active: { icon: CheckCircle, label: "Confiável", className: "bg-success/15 text-success border-success/20" },
    paused: { icon: Pause, label: "Pausado", className: "bg-muted/50 text-muted-foreground border-muted" },
    new: { icon: Sparkles, label: "Novo", className: "bg-primary/15 text-primary border-primary/20" },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function RatingBarPreview({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-muted-foreground">{label}</span>
          <span className="text-[10px] font-medium text-foreground">{value.toFixed(1)}</span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SupplierPreview({ data }: { data: Partial<SupplierFormData> }) {
  const avgRating = ((data.quality || 0) + (data.delivery || 0)) / 2;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {data.name || "Nome do Fornecedor"}
          </h4>
          <div className="flex items-center gap-2">
            {data.status && <StatusBadgePreview status={data.status} />}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {avgRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {data.categories && data.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.categories.map((cat) => (
            <span key={cat} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <RatingBarPreview label="Qualidade" value={data.quality || 0} icon={Star} />
        <RatingBarPreview label="Prazo" value={data.delivery || 0} icon={Truck} />
      </div>

      {data.adminNote && (
        <p className="rounded-md bg-muted/50 p-2 text-[10px] text-muted-foreground leading-relaxed">
          "{data.adminNote}"
        </p>
      )}
    </div>
  );
}

export function AddSupplierDialog({ open, onOpenChange, onSubmit }: AddSupplierDialogProps) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      status: "new",
      quality: 4.0,
      delivery: 4.0,
      categories: [],
      adminNote: "",
      contact: "",
    },
  });

  const watchedValues = form.watch();

  const handleSubmit = (data: SupplierFormData) => {
    onSubmit({
      name: data.name,
      status: data.status,
      rating: {
        quality: data.quality,
        delivery: data.delivery,
        communication: 4.0, // Legacy field, keeping for compatibility
      },
      categories: data.categories,
      adminNote: data.adminNote,
      contact: data.contact,
    });
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Fornecedor</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[1fr,280px]">
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Fornecedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Quality Imports China" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            Confiável
                          </span>
                        </SelectItem>
                        <SelectItem value="new">
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Novo
                          </span>
                        </SelectItem>
                        <SelectItem value="paused">
                          <span className="flex items-center gap-2">
                            <Pause className="h-4 w-4 text-muted-foreground" />
                            Pausado
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ratings */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          Qualidade
                        </span>
                        <span className="text-sm font-medium">{field.value.toFixed(1)}</span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={5}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          className="py-2"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          Prazo de Entrega
                        </span>
                        <span className="text-sm font-medium">{field.value.toFixed(1)}</span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={5}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          className="py-2"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Categories */}
              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <FormLabel>Categorias</FormLabel>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {AVAILABLE_CATEGORIES.map((category) => (
                        <FormField
                          key={category}
                          control={form.control}
                          name="categories"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...(field.value || []), category]
                                      : field.value?.filter((v) => v !== category) || [];
                                    field.onChange(newValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {category}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Note */}
              <FormField
                control={form.control}
                name="adminNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota do Admin (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Fornecedor principal para produtos premium..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: whatsapp, email, site..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Fornecedor</Button>
              </div>
            </form>
          </Form>

          {/* Preview */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-muted-foreground mb-3">Preview</p>
            <SupplierPreview data={watchedValues} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
