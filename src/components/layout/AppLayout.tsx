import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "@/contexts/SidebarContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <AppSidebar />
        <main className="pt-14">
          <div className="mx-auto max-w-[1440px] px-xl py-xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
