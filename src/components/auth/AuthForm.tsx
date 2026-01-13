import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
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
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (data: LoginFormData | SignupFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function AuthForm({ mode, onSubmit, isLoading, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {mode === "signup" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground/80">
                  Nome
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      placeholder="Seu nome"
                      {...field}
                      className={cn(
                        "h-11 pl-10 bg-white/[0.03] border-white/[0.08]",
                        "placeholder:text-muted-foreground/40",
                        "focus:bg-white/[0.05] focus:border-primary/50",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-foreground/80">
                Email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    {...field}
                    className={cn(
                      "h-11 pl-10 bg-white/[0.03] border-white/[0.08]",
                      "placeholder:text-muted-foreground/40",
                      "focus:bg-white/[0.05] focus:border-primary/50",
                      "transition-all duration-200"
                    )}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-foreground/80">
                Senha
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className={cn(
                      "h-11 pl-10 pr-11 bg-white/[0.03] border-white/[0.08]",
                      "placeholder:text-muted-foreground/40",
                      "focus:bg-white/[0.05] focus:border-primary/50",
                      "transition-all duration-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {mode === "signup" && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground/80">
                  Confirmar Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className={cn(
                        "h-11 pl-10 bg-white/[0.03] border-white/[0.08]",
                        "placeholder:text-muted-foreground/40",
                        "focus:bg-white/[0.05] focus:border-primary/50",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full h-11 mt-2 font-medium",
            "bg-primary hover:bg-primary/90",
            "shadow-lg shadow-primary/20",
            "transition-all duration-200",
            "disabled:opacity-50"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "login" ? "Entrando..." : "Criando conta..."}
            </>
          ) : (
            mode === "login" ? "Entrar" : "Criar conta"
          )}
        </Button>
      </form>
    </Form>
  );
}
