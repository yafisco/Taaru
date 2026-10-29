"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { connecter } from "../actions";
import { Champ, ErreurFormulaire } from "../champ";
import { connexionSchema, type ConnexionValeurs } from "../schemas";

export function ConnexionForm() {
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnexionValeurs>({
    resolver: zodResolver(connexionSchema),
    defaultValues: { telephone: "", pin: "" },
  });

  const onSubmit = handleSubmit((valeurs) => {
    setErreur(undefined);
    startTransition(async () => {
      const resultat = await connecter(valeurs);
      if (resultat?.erreur) setErreur(resultat.erreur);
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Champ id="telephone" label="Ton numéro de téléphone" erreur={errors.telephone?.message}>
        <Input
          id="telephone"
          type="tel"
          inputMode="tel"
          placeholder="77 123 45 67"
          autoComplete="tel"
          aria-invalid={!!errors.telephone}
          className="h-12 text-lg"
          {...register("telephone")}
        />
      </Champ>

      <Champ id="pin" label="Ton code PIN" erreur={errors.pin?.message}>
        <PinInput id="pin" autoComplete="current-password" aria-invalid={!!errors.pin} {...register("pin")} />
      </Champ>

      <ErreurFormulaire message={erreur} />

      <Button type="submit" size="lg" disabled={enCours} className="h-12 w-full text-base">
        {enCours && <Loader2 className="animate-spin" />}
        Se connecter
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-primary underline-offset-4 hover:underline">
          Créer mon atelier
        </Link>
      </p>
    </form>
  );
}
