import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background bg-ambient">
      <AppHeader />
      <main className="relative z-10 pt-16">
        <div className="mx-auto max-w-[1440px] px-4 md:px-xl py-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
