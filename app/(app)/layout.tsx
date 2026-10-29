import { Suspense } from "react";
import { BarreNavigation, BottomNav } from "@/components/bottom-nav";

// Pas de lecture de session ici : proxy.ts protège déjà les routes,
// et le layout reste statique (affiché instantanément).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-40">{children}</main>
      <Suspense fallback={<BarreNavigation pathname={null} />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
