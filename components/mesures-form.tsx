"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErreurFormulaire } from "@/components/champ";
import { champsMesures, type ChampMesure } from "@/lib/mesures";
import { cn } from "@/lib/utils";
import { enregistrerMesures } from "@/app/(app)/clients/actions";
import { mesuresSchema, type MesuresValeurs } from "@/app/(app)/clients/schemas";

type Props = {
  clientId: string;
  genre: "homme" | "femme" | null;
  valeurs: Record<string, number>;
  remarques: string | null;
};

const GROUPES: { cle: ChampMesure["groupe"]; titre: string }[] = [
  { cle: "haut", titre: "Haut du corps" },
  { cle: "bas", titre: "Bas du corps" },
  { cle: "longueurs", titre: "Longueurs" },
];

// 104.5 -> "104,5" (affichage à la française)
const versTexte = (v: Record<string, number>) =>
  Object.fromEntries(Object.entries(v).map(([k, n]) => [k, String(n).replace(".", ",")]));

export function MesuresForm({ clientId, genre: genreInitial, valeurs, remarques }: Props) {
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();
  const [genre, setGenre] = useState<"homme" | "femme">(genreInitial ?? "homme");
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<MesuresValeurs>({
    resolver: zodResolver(mesuresSchema),
    defaultValues: { genre, valeurs: versTexte(valeurs), remarques: remarques ?? "" },
  });

  const champs = champsMesures(genre);

  const onSubmit = handleSubmit(
    (v) => {
      setErreur(undefined);
      // On n'envoie que les champs affichés pour ce genre
      const affiches = Object.fromEntries(champs.map((c) => [c.cle, v.valeurs[c.cle] ?? ""]));
      startTransition(async () => {
        const resultat = await enregistrerMesures(clientId, { genre, valeurs: affiches, remarques: v.remarques });
        if (resultat.erreur) return setErreur(resultat.erreur);
        reset(v);
        toast.success("Mesures enregistrées");
      });
    },
    (e) => setErreur(e.remarques?.message ?? "Une mesure n'est pas valide (en cm, ex : 104 ou 104,5)")
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Genre">
        {(["homme", "femme"] as const).map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={genre === g}
            onClick={() => setGenre(g)}
            className={cn(
              "h-11 rounded-lg border text-base font-medium capitalize",
              genre === g ? "border-primary bg-primary text-primary-foreground" : "bg-background"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {GROUPES.map(({ cle, titre }) => (
        <fieldset key={cle} className="space-y-3">
          <legend className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{titre}</legend>
          <div className="grid grid-cols-2 gap-3">
            {champs
              .filter((c) => c.groupe === cle)
              .map((c) => (
                <div key={c.cle} className="space-y-1.5">
                  <Label htmlFor={`m-${c.cle}`} className="min-h-8 items-end text-sm leading-tight">
                    {c.label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={`m-${c.cle}`}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="—"
                      className="h-12 pr-10 text-lg"
                      {...register(`valeurs.${c.cle}`)}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </fieldset>
      ))}

      <div className="space-y-1.5">
        <Label htmlFor="remarques" className="text-base">
          Remarques
        </Label>
        <Textarea
          id="remarques"
          rows={2}
          placeholder="Aime les manches larges, col officier…"
          className="text-base"
          {...register("remarques")}
        />
      </div>

      <ErreurFormulaire message={erreur} />

      <Button
        type="submit"
        size="lg"
        disabled={enCours || (!isDirty && genre === (genreInitial ?? "homme"))}
        className="h-12 w-full text-base"
      >
        {enCours && <Loader2 className="animate-spin" />}
        Enregistrer les mesures
      </Button>
    </form>
  );
}
