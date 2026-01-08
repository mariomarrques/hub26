import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-sidebar transition-all duration-hover">
        <div className="mx-auto max-w-[1440px] px-xl py-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
