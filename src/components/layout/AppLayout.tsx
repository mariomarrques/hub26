import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-16">
        <div className="mx-auto max-w-[1440px] px-4 md:px-xl py-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
