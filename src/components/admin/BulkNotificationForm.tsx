import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Megaphone, AlertTriangle, ShoppingBag, Users } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { AppRole } from "@/types/auth";
import { BulkNotificationParams } from "@/hooks/use-admin";

const formSchema = z.object({
  type: z.enum(["announcement", "alert", "product", "community"]),
  title: z.string().min(1, "Título é obrigatório").max(100, "Máximo 100 caracteres"),
  message: z.string().min(1, "Mensagem é obrigatória").max(500, "Máximo 500 caracteres"),
  link: z.string().url("URL inválida").optional().or(z.literal("")),
  targetAll: z.boolean(),
  targetRoles: z.array(z.enum(["admin", "moderator", "member"])),
});

type FormData = z.infer<typeof formSchema>;

const notificationTypes = [
  { value: "announcement", label: "Anúncio", icon: Megaphone },
  { value: "alert", label: "Alerta", icon: AlertTriangle },
  { value: "product", label: "Produto", icon: ShoppingBag },
  { value: "community", label: "Comunidade", icon: Users },
];

const roleOptions: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Administradores" },
  { value: "moderator", label: "Moderadores" },
  { value: "member", label: "Membros" },
];

interface BulkNotificationFormProps {
  onSubmit: (params: BulkNotificationParams) => void;
  isLoading?: boolean;
  userCounts?: {
    admin: number;
    moderator: number;
    member: number;
    total: number;
  };
}

export function BulkNotificationForm({
  onSubmit,
  isLoading,
  userCounts,
}: BulkNotificationFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "announcement",
      title: "",
      message: "",
      link: "",
      targetAll: true,
      targetRoles: [],
    },
  });

  const targetAll = form.watch("targetAll");
  const targetRoles = form.watch("targetRoles");
  const type = form.watch("type");
  const title = form.watch("title");
  const message = form.watch("message");

  const getRecipientCount = () => {
    if (!userCounts) return 0;
    if (targetAll) return userCounts.total;
    return targetRoles.reduce((acc, role) => acc + (userCounts[role] || 0), 0);
  };

  const handleSubmit = (data: FormData) => {
    onSubmit({
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || undefined,
      targetRoles: data.targetAll ? undefined : (data.targetRoles as AppRole[]),
    });
  };

  const TypeIcon = notificationTypes.find((t) => t.value === type)?.icon || Bell;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Notificação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da notificação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conteúdo da notificação..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/500 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="targetAll"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Enviar para todos os usuários
                    </FormLabel>
                  </FormItem>
                )}
              />

              {!targetAll && (
                <FormField
                  control={form.control}
                  name="targetRoles"
                  render={() => (
                    <FormItem>
                      <FormLabel>Destinatários</FormLabel>
                      <div className="space-y-2">
                        {roleOptions.map((role) => (
                          <FormField
                            key={role.value}
                            control={form.control}
                            name="targetRoles"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(role.value)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, role.value]);
                                      } else {
                                        field.onChange(
                                          current.filter((v) => v !== role.value)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {role.label}{" "}
                                  {userCounts && (
                                    <span className="text-muted-foreground">
                                      ({userCounts[role.value]})
                                    </span>
                                  )}
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
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Preview</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {title || "Título da notificação"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                        {message || "Mensagem da notificação..."}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Agora mesmo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Esta notificação será enviada para:
              </p>
              <p className="mt-1 text-2xl font-bold">
                {getRecipientCount()} usuário(s)
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
          <Button type="submit" disabled={isLoading || getRecipientCount() === 0}>
            {isLoading ? "Enviando..." : `Enviar para ${getRecipientCount()} usuário(s)`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
