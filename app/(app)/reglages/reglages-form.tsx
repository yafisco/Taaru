"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Champ, ErreurFormulaire } from "@/components/champ";
import { Puce } from "@/components/puce";
import { FETES } from "@/lib/fete";
import { modifierReglages } from "./actions";
import { reglagesSchema, type ReglagesValeurs } from "./schemas";

const LANGUES = [
  { cle: "fr", label: "Français" },
  { cle: "wo", label: "Wolof" },
] as const;

export function ReglagesForm({ valeurs }: { valeurs: ReglagesValeurs }) {
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ReglagesValeurs>({ resolver: zodResolver(reglagesSchema), defaultValues: valeurs });
  const [langue, fete] = useWatch({ control, name: ["langue", "fete"] });
  const options = { shouldDirty: true, shouldValidate: true };
  const choisirLangue = (v: ReglagesValeurs["langue"]) => setValue("langue", v, options);
  const choisirFete = (v: ReglagesValeurs["fete"]) => setValue("fete", v, options);

  const onSubmit = handleSubmit((v) => {
    setErreur(undefined);
    startTransition(async () => {
      const r = await modifierReglages(v);
      if (r.erreur) return setErreur(r.erreur);
      reset(v);
      toast.success("Réglages enregistrés");
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Champ id="nom" label="Nom de l'atelier" erreur={errors.nom?.message}>
        <Input id="nom" autoComplete="organization" aria-invalid={!!errors.nom} className="h-12 text-lg" {...register("nom")} />
      </Champ>

      <fieldset className="space-y-2">
        <legend className="text-base font-medium">Langue des messages WhatsApp</legend>
        <div className="grid grid-cols-2 gap-2">
          {LANGUES.map((l) => (
            <Puce key={l.cle} actif={langue === l.cle} onClick={() => choisirLangue(l.cle)} className="h-12 text-base">
              {l.label}
            </Puce>
          ))}
        </div>
      </fieldset>

      <Champ
        id="capacite"
        label="Tenues par semaine"
        erreur={errors.capacite?.message}
        aide="Combien de tenues ton atelier peut coudre en une semaine. Sert au mode fête."
      >
        <Input
          id="capacite"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-invalid={!!errors.capacite}
          className="h-12 w-32 text-lg"
          {...register("capacite", { setValueAs: (v) => (String(v).trim() === "" ? NaN : Number(v)) })}
        />
      </Champ>

      <fieldset className="space-y-3 rounded-xl border p-4">
        <legend className="px-1 text-base font-medium">Mode fête</legend>
        <p className="text-sm text-muted-foreground">
          Choisis la prochaine fête : l&apos;accueil affichera le compte à rebours et t&apos;alertera si tu acceptes trop de commandes.
        </p>
        <div className="flex flex-wrap gap-2">
          {FETES.map((f) => (
            <Puce key={f.cle} actif={fete === f.cle} onClick={() => choisirFete(fete === f.cle ? null : f.cle)}>
              {f.label}
            </Puce>
          ))}
        </div>
        {fete && (
          <Champ id="feteDate" label="Date de la fête" erreur={errors.feteDate?.message}>
            <Input id="feteDate" type="date" aria-invalid={!!errors.feteDate} className="h-12 text-lg" {...register("feteDate")} />
          </Champ>
        )}
      </fieldset>

      <ErreurFormulaire message={erreur} />

      <Button type="submit" size="lg" disabled={enCours || !isDirty} className="h-12 w-full text-base">
        {enCours && <Loader2 className="animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
