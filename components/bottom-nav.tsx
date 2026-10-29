"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Plus, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const LIENS = [
  { href: "/", label: "Accueil", icone: Home },
  { href: "/commandes", label: "Commandes", icone: Package },
  { href: "/clients", label: "Clients", icone: Users },
  { href: "/reglages", label: "Réglages", icone: Settings },
];

const estActif = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

// Lit l'URL pour surligner l'onglet actif. À placer dans un <Suspense> (Cache Components).
export function BottomNav() {
  return <BarreNavigation pathname={usePathname()} />;
}

// Barre de navigation en bas + bouton flottant « + Commande ».
// pathname null = rendu statique (fallback du Suspense), aucun onglet surligné.
export function BarreNavigation({ pathname }: { pathname: string | null }) {
  const surNouvelleCommande = pathname === "/commandes/nouvelle";

  return (
    <>
      {!surNouvelleCommande && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 mb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex max-w-md justify-end px-4">
            <Link
              href="/commandes/nouvelle"
              className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-or px-5 text-base font-semibold text-or-foreground shadow-lg active:scale-95"
            >
              <Plus className="size-5" strokeWidth={2.5} />
              Commande
            </Link>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
          {LIENS.map(({ href, label, icone: Icone }) => {
            const actif = pathname !== null && estActif(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium",
                    actif ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icone className="size-6" strokeWidth={actif ? 2.5 : 2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
