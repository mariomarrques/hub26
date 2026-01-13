import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    setIsLoading(true);
    setError(null);

    const { error } = await signUp(data.email, data.password, data.name || "");

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este email já está cadastrado");
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial" />
      
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-[420px] animate-fade-in">
        {/* Glass Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="px-8 pt-10 pb-2 text-center">
            {/* Logo */}
            <div 
              className="mb-8 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-foreground">Hub</span>{" "}
                <span className="text-primary">26</span>
              </h1>
              <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-primary/40" />
            </div>

            {/* Title */}
            <div 
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: "150ms" }}
            >
              <h2 className="text-xl font-semibold text-foreground">
                Criar conta
              </h2>
              <p className="text-sm text-muted-foreground">
                Junte-se à comunidade Hub 26
              </p>
            </div>
          </div>

          {/* Form */}
          <div 
            className="px-8 py-8 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <AuthForm
              mode="signup"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card/80 px-4 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link 
                to="/login" 
                className="font-medium text-primary transition-colors hover:text-primary/80"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p 
          className="mt-8 text-center text-xs text-muted-foreground/60 animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          Ao criar sua conta, você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
}
