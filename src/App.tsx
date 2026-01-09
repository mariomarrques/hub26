import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Bazar from "./pages/Bazar";
import Busca from "./pages/Busca";
import Fornecedores from "./pages/Fornecedores";
import Avisos from "./pages/Avisos";
import Comunidade from "./pages/Comunidade";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="dark">
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/bazar" element={<Bazar />} />
              <Route path="/busca" element={<Busca />} />
              <Route path="/fornecedores" element={<Fornecedores />} />
              <Route path="/avisos" element={<Avisos />} />
              <Route path="/comunidade" element={<Comunidade />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
