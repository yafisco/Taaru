"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { afficherTelephone } from "@/lib/whatsapp";

type ClientLigne = { id: string; nom: string; telephone: string | null; quartier: string | null };

// "Ndèye" -> "ndeye" pour chercher sans se soucier des accents
const simplifier = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Filtrage côté navigateur : instantané, et aucune requête réseau à chaque lettre (3G)
export function ClientsListe({ clients }: { clients: ClientLigne[] }) {
  const [recherche, setRecherche] = useState("");

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
        <UserPlus className="size-10 text-muted-foreground" />
        <p className="font-medium">Aucun client pour l&apos;instant.</p>
        <p className="text-sm text-muted-foreground">Ajoute ton premier client et garde ses mesures une fois pour toutes.</p>
      </div>
    );
  }

  const texte = simplifier(recherche.trim());
  const chiffres = recherche.replace(/\D/g, "");
  const filtres = clients.filter(
    (c) =>
      !texte ||
      simplifier(c.nom).includes(texte) ||
      (chiffres.length >= 2 && c.telephone?.includes(chiffres))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Nom ou téléphone"
          aria-label="Rechercher un client"
          className="h-12 pl-10 text-lg"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filtres.length} client{filtres.length > 1 ? "s" : ""}
      </p>

      {filtres.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Aucun client ne correspond à « {recherche} ».</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {filtres.map((c) => (
            <li key={c.id}>
              <Link href={`/clients/${c.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 active:bg-muted">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {c.nom.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.nom}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[c.telephone && afficherTelephone(c.telephone), c.quartier].filter(Boolean).join(" · ") || "Pas de numéro"}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
