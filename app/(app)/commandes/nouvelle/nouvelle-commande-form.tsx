"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErreurFormulaire } from "@/components/champ";
import { PhotoInput, type EtatPhoto } from "@/components/photo-input";
import { Puce } from "@/components/puce";
import type { ClientRapide } from "@/app/(app)/clients/actions";
import { formatDate, formatFCFA } from "@/lib/format";
import { EVENEMENTS, MODELES_COURANTS } from "@/lib/mesures";
import { nouvelId } from "@/lib/texte";
import { creerCommande } from "../actions";
import { commandeSchema, lireMontant, MODES_PAIEMENT, type CommandeValeurs } from "../schemas";
import { ChoixClient } from "./choix-client";

type Props = { atelierId: string; clients: ClientRapide[]; clientInitial: ClientRapide | null };

const MONTANTS_RAPIDES = [5_000, 10_000, 25_000];
const DELAIS = [3, 7, 14];
const dateDans = (jours: number) => format(addDays(new Date(), jours), "yyyy-MM-dd");

export function NouvelleCommandeForm({ atelierId, clients, clientInitial }: Props) {
  // Id créé dès l'ouverture : il sert de dossier pour la photo envoyée en avance
  const [id] = useState(nouvelId);
  const [client, setClient] = useState(clientInitial);
  const [photo, setPhoto] = useState<EtatPhoto>({ statut: "vide" });
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CommandeValeurs>({
    resolver: zodResolver(commandeSchema),
    defaultValues: {
      clientId: clientInitial?.id ?? "",
      modele: "",
      acompte: 0,
      mode: "especes",
      dateLivraison: "",
      evenement: null,
    },
  });
  const [modele, prixTotal, acompte, mode, dateLivraison, evenement] = useWatch({
    control,
    name: ["modele", "prixTotal", "acompte", "mode", "dateLivraison", "evenement"],
  });
  const prix = Number.isFinite(prixTotal) ? prixTotal : 0;
  const verse = Number.isFinite(acompte) ? acompte : 0;
  const choisir = <K extends keyof CommandeValeurs>(champ: K, valeur: CommandeValeurs[K]) =>
    setValue(champ, valeur as never, { shouldValidate: true, shouldDirty: true });

  const onSubmit = handleSubmit((v) => {
    setErreur(undefined);
    if (photo.statut === "erreur") return setErreur("La photo n'est pas partie : réessaie ou retire-la.");
    startTransition(async () => {
      const r = await creerCommande(id, photo.statut === "ok" ? photo.path : null, v);
      if (r?.erreur) setErreur(r.erreur);
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <Section numero={1} titre="Client" erreur={errors.clientId?.message}>
        <ChoixClient
          clients={clients}
          choisi={client}
          onChoisir={(c) => {
            setClient(c);
            choisir("clientId", c?.id ?? "");
          }}
        />
      </Section>

      <Section numero={2} titre="Photo du tissu">
        <PhotoInput path={`${atelierId}/${id}/tissu.jpg`} label="Prendre le tissu en photo" onChange={setPhoto} />
      </Section>

      <Section numero={3} titre="Modèle" erreur={errors.modele?.message}>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {MODELES_COURANTS.map((m) => (
            <Puce key={m} actif={modele === m} onClick={() => choisir("modele", m)}>
              {m}
            </Puce>
          ))}
        </div>
        <Input
          placeholder="Ou écris le modèle…"
          aria-label="Modèle"
          autoComplete="off"
          aria-invalid={!!errors.modele}
          className="mt-3 h-12 text-lg"
          {...register("modele")}
        />
      </Section>

      <Section numero={4} titre="Prix et acompte">
        <div className="space-y-4">
          <ChampMontant
            id="prixTotal"
            label="Prix total"
            erreur={errors.prixTotal?.message}
            valeur={prix}
            {...register("prixTotal", { setValueAs: lireMontant })}
          />

          <div>
            <ChampMontant
              id="acompte"
              label="Acompte versé"
              erreur={errors.acompte?.message}
              valeur={verse}
              {...register("acompte", { setValueAs: (v) => (String(v).trim() === "" ? 0 : lireMontant(v)) })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {MONTANTS_RAPIDES.map((m) => (
                <Puce key={m} actif={verse === m} onClick={() => choisir("acompte", m)}>
                  {m.toLocaleString("fr-FR")}
                </Puce>
              ))}
              <Puce actif={prix > 0 && verse === prix} disabled={prix <= 0} onClick={() => choisir("acompte", prix)}>
                Tout payé
              </Puce>
            </div>
          </div>

          {verse > 0 && (
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Mode de paiement">
              {MODES_PAIEMENT.map((p) => (
                <Puce key={p.cle} actif={mode === p.cle} onClick={() => choisir("mode", p.cle)} className="px-2">
                  {p.label}
                </Puce>
              ))}
            </div>
          )}

          {prix > 0 && (
            <p className="flex items-baseline justify-between rounded-lg bg-muted px-4 py-3">
              <span className="font-medium">Reste à payer</span>
              <span className="text-xl font-bold">{formatFCFA(Math.max(prix - verse, 0))}</span>
            </p>
          )}
        </div>
      </Section>

      <Section numero={5} titre="Livraison" erreur={errors.dateLivraison?.message}>
        <div className="flex gap-2">
          {DELAIS.map((j) => (
            <Puce key={j} actif={dateLivraison === dateDans(j)} onClick={() => choisir("dateLivraison", dateDans(j))}>
              +{j} jours
            </Puce>
          ))}
        </div>
        <Input
          type="date"
          min={dateDans(0)}
          aria-label="Date de livraison"
          aria-invalid={!!errors.dateLivraison}
          className="mt-3 h-12 text-lg"
          {...register("dateLivraison")}
        />
        {dateLivraison && <p className="mt-2 text-sm text-muted-foreground">Livraison prévue : {formatDate(dateLivraison)}</p>}

        <p className="mt-5 mb-2 text-sm font-medium">Pour un événement ?</p>
        <div className="flex flex-wrap gap-2">
          {EVENEMENTS.map((e) => (
            <Puce key={e.cle} actif={evenement === e.cle} onClick={() => choisir("evenement", evenement === e.cle ? null : e.cle)}>
              {e.label}
            </Puce>
          ))}
        </div>
      </Section>

      {/* Barre fixe au-dessus de la navigation : le bouton reste toujours à portée de pouce */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md space-y-2 px-4 py-3">
          <ErreurFormulaire message={erreur} />
          <Button type="submit" size="lg" disabled={enCours || photo.statut === "envoi"} className="h-12 w-full text-base">
            {(enCours || photo.statut === "envoi") && <Loader2 className="animate-spin" />}
            {photo.statut === "envoi" ? "Envoi de la photo…" : `Enregistrer${modele ? ` · ${modele}` : ""}`}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({
  numero,
  titre,
  erreur,
  children,
}: {
  numero: number;
  titre: string;
  erreur?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
          {numero}
        </span>
        {titre}
      </h2>
      {children}
      {erreur && <p className="mt-2 text-sm text-destructive">{erreur}</p>}
    </section>
  );
}

type ChampMontantProps = React.ComponentProps<"input"> & { id: string; label: string; erreur?: string; valeur: number };

function ChampMontant({ id, label, erreur, valeur, ...props }: ChampMontantProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-base font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          inputMode="numeric"
          pattern="[0-9 ]*"
          autoComplete="off"
          placeholder="0"
          aria-invalid={!!erreur}
          className="h-12 pr-16 text-lg"
          {...props}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
          FCFA
        </span>
      </div>
      {erreur ? (
        <p className="text-sm text-destructive">{erreur}</p>
      ) : (
        valeur >= 1000 && <p className="text-sm text-muted-foreground">{formatFCFA(valeur)}</p>
      )}
    </div>
  );
}
