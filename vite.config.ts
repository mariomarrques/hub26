import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// ============================================================================
// AUDITORIA: Removido componentTagger() do lovable-tagger
// O lovable-tagger era usado pelo Lovable.dev para rastrear componentes
// durante o desenvolvimento na plataforma deles. Não tem utilidade fora dela.
// ============================================================================

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
