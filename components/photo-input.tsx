"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, RotateCcw, X } from "lucide-react";
import { cheminMiniature } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type EtatPhoto =
  | { statut: "vide" }
  | { statut: "envoi" }
  | { statut: "ok"; path: string }
  | { statut: "erreur"; message: string };

type Props = {
  /** Chemin Storage, ex : {atelier_id}/{commande_id}/tissu.jpg */
  path: string;
  label: string;
  onChange: (etat: EtatPhoto) => void;
};

// Photo prise avec l'appareil, compressée (≤ 250 Ko, 1280 px) puis envoyée tout de suite
// dans le bucket privé « photos », pendant que le tailleur remplit le reste.
export function PhotoInput({ path, label, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [etat, setEtat] = useState<EtatPhoto>({ statut: "vide" });
  const fichierRef = useRef<File | null>(null);
  const dernierEnvoi = useRef(0); // ignore un ancien envoi si la photo a été reprise ou retirée

  useEffect(() => () => void (apercu && URL.revokeObjectURL(apercu)), [apercu]);

  function changer(e: EtatPhoto) {
    setEtat(e);
    onChange(e);
  }

  async function envoyer(fichier: File) {
    const numero = ++dernierEnvoi.current;
    const siDernier = (e: EtatPhoto) => numero === dernierEnvoi.current && changer(e);
    changer({ statut: "envoi" });
    try {
      const { default: imageCompression } = await import("browser-image-compression");
      const compresse = await imageCompression(fichier, {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 1280,
        fileType: "image/jpeg",
        initialQuality: 0.8,
        useWebWorker: true,
        libURL: "/vendor/browser-image-compression-2.0.2.js",
      });
      const options = { upsert: true, contentType: "image/jpeg" };
      const stockage = createClient().storage.from("photos");
      const { error } = await stockage.upload(path, compresse, options);
      if (error) throw error;
      // Miniature (~15 Ko) pour les listes : 30 photos pleines pèseraient 7 Mo en 3G.
      // Facultative : si elle échoue, la liste affiche une icône à la place.
      try {
        const mini = await imageCompression(compresse, {
          maxSizeMB: 0.03,
          maxWidthOrHeight: 240,
          fileType: "image/jpeg",
          useWebWorker: true,
          libURL: "/vendor/browser-image-compression-2.0.2.js",
        });
        await stockage.upload(cheminMiniature(path), mini, options);
      } catch {
        // miniature facultative
      }
      siDernier({ statut: "ok", path });
    } catch {
      siDernier({ statut: "erreur", message: "La photo n'est pas partie. Vérifie ta connexion." });
    }
  }

  function choisir(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = ""; // permet de reprendre la même photo
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      changer({ statut: "erreur", message: "Ce fichier n'est pas une photo." });
      return;
    }
    fichierRef.current = fichier;
    setApercu(URL.createObjectURL(fichier));
    envoyer(fichier);
  }

  function retirer() {
    dernierEnvoi.current++;
    fichierRef.current = null;
    setApercu(null);
    changer({ statut: "vide" });
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={choisir} className="sr-only" />

      {!apercu ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground active:bg-muted"
        >
          <Camera className="size-8" />
          <span className="font-medium">{label}</span>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), next/image inutile ici */}
          <img src={apercu} alt="Aperçu de la photo" className="h-48 w-full object-cover" />

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-white",
              etat.statut === "erreur" ? "bg-destructive" : "bg-black/60"
            )}
          >
            {etat.statut === "envoi" && (
              <>
                <Loader2 className="size-4 animate-spin" /> Envoi de la photo…
              </>
            )}
            {etat.statut === "ok" && (
              <>
                <CheckCircle2 className="size-4" /> Photo enregistrée
              </>
            )}
            {etat.statut === "erreur" && (
              <>
                <span className="flex-1">{etat.message}</span>
                <button
                  type="button"
                  onClick={() => fichierRef.current && envoyer(fichierRef.current)}
                  className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-1"
                >
                  <RotateCcw className="size-4" /> Réessayer
                </button>
              </>
            )}
          </div>

          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-10 items-center gap-1 rounded-full bg-black/60 px-3 text-sm font-medium text-white"
            >
              <Camera className="size-4" /> Reprendre
            </button>
            <button
              type="button"
              onClick={retirer}
              aria-label="Retirer la photo"
              className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
