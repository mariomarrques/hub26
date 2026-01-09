import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <AppSidebar />
      <main className="pl-sidebar pt-14 transition-all duration-hover">
        <div className="mx-auto max-w-[1440px] px-xl py-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
