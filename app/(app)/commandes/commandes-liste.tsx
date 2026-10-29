"use client";

import { useState } from "react";
import { PackageOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommandeCard, type CommandeResume } from "@/components/commande-card";
import { simplifier } from "@/lib/texte";

export type Onglet = "en-cours" | "pretes" | "livrees";
export type CommandeListe = CommandeResume & { onglet: Onglet; texteRecherche: string };

const ONGLETS: { cle: Onglet; label: string }[] = [
  { cle: "en-cours", label: "En cours" },
  { cle: "pretes", label: "Prêtes" },
  { cle: "livrees", label: "Livrées" },
];

const VIDES: Record<Onglet, string> = {
  "en-cours": "Aucune commande en cours. Ajoute la première en 1 minute.",
  pretes: "Aucune tenue prête à récupérer.",
  livrees: "Aucune commande livrée pour l'instant.",
};

// Commandes déjà triées par le serveur (en retard d'abord, puis par date de livraison)
export function CommandesListe({ commandes, ongletInitial }: { commandes: CommandeListe[]; ongletInitial: Onglet }) {
  const [onglet, setOnglet] = useState<Onglet>(ongletInitial);
  const [recherche, setRecherche] = useState("");

  const texte = simplifier(recherche.trim());
  const chiffres = recherche.replace(/\D/g, "");
  const filtrees = commandes.filter(
    (c) =>
      c.onglet === onglet &&
      (!texte || c.texteRecherche.includes(texte) || (chiffres.length >= 2 && c.texteRecherche.includes(chiffres)))
  );
  const nombre = (o: Onglet) => commandes.filter((c) => c.onglet === o).length;

  return (
    <div className="space-y-4">
      <Tabs value={onglet} onValueChange={(v) => setOnglet(v as Onglet)}>
        <TabsList className="h-11 w-full">
          {ONGLETS.map((o) => (
            <TabsTrigger key={o.cle} value={o.cle} className="h-9 flex-1 text-sm">
              {o.label} ({nombre(o.cle)})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Client, modèle ou n° de commande"
          aria-label="Rechercher une commande"
          className="h-12 pl-10 text-lg"
        />
      </div>

      {filtrees.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground">
          <PackageOpen className="size-10" />
          <p>{texte ? `Aucune commande ne correspond à « ${recherche.trim()} ».` : VIDES[onglet]}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtrees.map((c) => (
            <li key={c.id}>
              <CommandeCard c={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
