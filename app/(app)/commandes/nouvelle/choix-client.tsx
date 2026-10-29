"use client";

import { useState, useTransition } from "react";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { creerClientRapide, type ClientRapide } from "@/app/(app)/clients/actions";
import { simplifier } from "@/lib/texte";
import { afficherTelephone } from "@/lib/whatsapp";

type Props = {
  clients: ClientRapide[];
  choisi: ClientRapide | null;
  onChoisir: (client: ClientRapide | null) => void;
};

export function ChoixClient({ clients, choisi, onChoisir }: Props) {
  const [recherche, setRecherche] = useState("");
  const [nouveau, setNouveau] = useState(clients.length === 0);

  if (choisi) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 px-4 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {choisi.nom.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{choisi.nom}</p>
          <p className="text-sm text-muted-foreground">
            {choisi.telephone ? afficherTelephone(choisi.telephone) : "Pas de numéro"}
          </p>
        </div>
        <Button type="button" variant="ghost" className="h-10" onClick={() => onChoisir(null)}>
          Changer
        </Button>
      </div>
    );
  }

  if (nouveau) {
    return (
      <NouveauClient
        nomInitial={/\d/.test(recherche) ? "" : recherche}
        telInitial={/\d/.test(recherche) ? recherche : ""}
        onCree={onChoisir}
        onAnnuler={clients.length > 0 ? () => setNouveau(false) : undefined}
      />
    );
  }

  const texte = simplifier(recherche.trim());
  const chiffres = recherche.replace(/\D/g, "");
  // Sans recherche : les 5 clients les plus récents (liste triée par date de création)
  const resultats = (
    texte
      ? clients.filter((c) => simplifier(c.nom).includes(texte) || (chiffres.length >= 2 && c.telephone?.includes(chiffres)))
      : clients
  ).slice(0, 5);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Nom ou téléphone du client"
          aria-label="Rechercher un client"
          className="h-12 pl-10 text-lg"
        />
      </div>

      <ul className="divide-y rounded-xl border">
        {resultats.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onChoisir(c)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-muted"
            >
              <span className="truncate font-medium">{c.nom}</span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {c.telephone ? afficherTelephone(c.telephone) : ""}
              </span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => setNouveau(true)}
            className="flex w-full items-center gap-2 px-4 py-3 font-medium text-primary active:bg-muted"
          >
            <UserPlus className="size-5" />
            {texte && resultats.length === 0 ? `Nouveau client « ${recherche.trim()} »` : "Nouveau client"}
          </button>
        </li>
      </ul>
    </div>
  );
}

type NouveauProps = {
  nomInitial: string;
  telInitial: string;
  onCree: (client: ClientRapide) => void;
  onAnnuler?: () => void;
};

// Pas de <form> ici : on est déjà dans le formulaire de commande (pas de formulaires imbriqués)
function NouveauClient({ nomInitial, telInitial, onCree, onAnnuler }: NouveauProps) {
  const [nom, setNom] = useState(nomInitial);
  const [telephone, setTelephone] = useState(telInitial);
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();

  function ajouter() {
    setErreur(undefined);
    startTransition(async () => {
      const r = await creerClientRapide(nom, telephone);
      if (r.client) onCree(r.client);
      else setErreur(r.erreur);
    });
  }

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Nouveau client</p>
        {onAnnuler && (
          <Button type="button" variant="ghost" size="icon-lg" onClick={onAnnuler} aria-label="Annuler">
            <X />
          </Button>
        )}
      </div>
      <Input
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        placeholder="Nom (ex : Moussa Diop)"
        aria-label="Nom du client"
        autoComplete="off"
        className="h-12 text-lg"
      />
      <Input
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        type="tel"
        inputMode="tel"
        placeholder="Téléphone (ex : 77 123 45 67)"
        aria-label="Téléphone du client"
        autoComplete="off"
        className="h-12 text-lg"
      />
      {erreur && <p className="text-sm text-destructive">{erreur}</p>}
      <Button type="button" size="lg" variant="secondary" disabled={enCours} onClick={ajouter} className="h-12 w-full text-base">
        {enCours && <Loader2 className="animate-spin" />}
        Ajouter ce client
      </Button>
    </div>
  );
}
