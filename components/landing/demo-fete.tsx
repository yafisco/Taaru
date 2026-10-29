"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVisible } from "./apparition";

const CAPACITE = 18;
const COMMANDES = 21;

// Démo animée de la carte « mode fête » : les commandes montent jusqu'à dépasser la capacité
export function DemoFete() {
  const [ref, visible] = useVisible<HTMLDivElement>("-20% 0px");
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!visible) return;
    // Animations réduites : on affiche directement le résultat final
    const duree = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2800;
    let raf = 0;
    const debut = performance.now();
    const tic = (t: number) => {
      const p = duree ? Math.min((t - debut) / duree, 1) : 1;
      setN(Math.round(COMMANDES * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tic);
    };
    raf = requestAnimationFrame(tic);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const complet = n >= CAPACITE;

  return (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full max-w-sm rounded-2xl border-2 bg-white p-5 text-left text-foreground shadow-2xl transition-colors duration-500",
        complet ? "border-red-400" : "border-or"
      )}
    >
      <p className="flex items-center gap-2 font-semibold">
        <PartyPopper className={cn("size-5", complet ? "text-red-600" : "text-amber-600")} /> Tabaski dans 23 jours
      </p>
      <p className="mt-3 text-sm">
        <span className="text-3xl font-bold tabular-nums">{n}</span> tenues à coudre sur une capacité de{" "}
        <span className="font-semibold">{CAPACITE}</span>
      </p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-colors duration-500", complet ? "bg-red-600" : "bg-primary")}
          style={{ width: `${Math.min(n / CAPACITE, 1) * 100}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-3 flex items-center gap-2 font-bold text-red-700 transition-opacity duration-500",
          complet ? "opacity-100" : "opacity-0"
        )}
        aria-live="polite"
      >
        <AlertTriangle className="size-5" /> Tu es complet !
      </p>
    </div>
  );
}
