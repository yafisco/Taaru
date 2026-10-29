"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { MODELES, type Langue } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// Le vrai message que l'app envoie (mêmes modèles que lib/whatsapp.ts)
const EXEMPLE = { client: "Moussa", modele: "Grand boubou", atelier: "Atelier Ndiaye", reste: 15_000 };

export function ApercuWhatsApp() {
  const [langue, setLangue] = useState<Langue>("wo");

  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-white/10 p-1 text-sm font-semibold" role="group" aria-label="Langue du message">
        {(["wo", "fr"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={langue === l}
            onClick={() => setLangue(l)}
            className={cn("h-10 rounded-full transition-colors", langue === l ? "bg-or text-or-foreground" : "text-white/80")}
          >
            {l === "wo" ? "Wolof" : "Français"}
          </button>
        ))}
      </div>

      {/* Écran de discussion WhatsApp simplifié */}
      <div className="overflow-hidden rounded-3xl border-4 border-black/80 bg-[#EFE7DD] shadow-2xl">
        <div className="flex items-center gap-2 bg-[#075E54] px-4 py-3 text-white">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">M</div>
          <div>
            <p className="text-sm font-semibold">Moussa</p>
            <p className="text-xs opacity-80">en ligne</p>
          </div>
        </div>
        <div className="min-h-52 p-3">
          <div key={langue} className="ml-auto max-w-[88%] animate-in rounded-lg rounded-tr-none bg-[#DCF8C6] px-3 py-2 text-sm text-black shadow-sm duration-500 fade-in slide-in-from-bottom-2">
            <p className="whitespace-pre-line">{MODELES.pret[langue](EXEMPLE)}</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-black/50">
              18:42 <CheckCheck className="size-3.5 text-sky-500" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
