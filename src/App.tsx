import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Bazar from "./pages/Bazar";
import Busca from "./pages/Busca";
import Fornecedores from "./pages/Fornecedores";
import Avisos from "./pages/Avisos";
import Comunidade from "./pages/Comunidade";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import Configuracoes from "./pages/Configuracoes";
import Categoria from "./pages/Categoria";
import Produto from "./pages/Produto";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Home /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/produtos"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Index /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fornecedores"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Fornecedores /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/avisos"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Avisos /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/comunidade"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Comunidade /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Perfil /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/editar-perfil"
                  element={
                    <ProtectedRoute>
                      <AppLayout><EditarPerfil /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Configuracoes /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categoria/:slug"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Categoria /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/produto/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout><Produto /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AppLayout><AdminDashboard /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AppLayout><AdminUsers /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/produtos"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AppLayout><AdminProducts /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notificacoes"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AppLayout><AdminNotifications /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/posts"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AppLayout><AdminPosts /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AppLayout><AdminAuditLogs /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
