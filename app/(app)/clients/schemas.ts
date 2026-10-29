import { z } from "zod";
import { MESURES_FEMME, MESURES_HOMME } from "@/lib/mesures";
import { normaliserTelephone } from "@/lib/whatsapp";

// Partagés entre les formulaires (client) et les Server Actions (serveur)

export const genreSchema = z.enum(["homme", "femme"]);

export const clientSchema = z.object({
  nom: z.string().trim().min(2, "Entre le nom du client").max(80, "Nom trop long"),
  // Facultatif, mais sans numéro pas de WhatsApp
  telephone: z
    .string()
    .trim()
    .refine((v) => v === "" || normaliserTelephone(v) !== null, "Numéro invalide. Exemple : 77 123 45 67"),
  quartier: z.string().trim().max(60, "Trop long"),
  genre: genreSchema.nullable(),
});

export type ClientValeurs = z.infer<typeof clientSchema>;

const CLES_MESURES = new Set([...MESURES_HOMME, ...MESURES_FEMME].map((c) => c.cle));

/** "104" | "104,5" | "104.5" -> 104.5 ; "" -> null ; sinon undefined (invalide) */
export function lireMesure(brut: string): number | null | undefined {
  const v = brut.trim().replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= 300 ? Math.round(n * 10) / 10 : undefined;
}

export const mesuresSchema = z.object({
  genre: genreSchema,
  valeurs: z
    .record(z.string(), z.string().max(6))
    .refine((v) => Object.keys(v).every((cle) => CLES_MESURES.has(cle)), "Mesure inconnue")
    .refine((v) => Object.values(v).every((m) => lireMesure(m) !== undefined), "Une mesure n'est pas valide (en cm, ex : 104 ou 104,5)"),
  remarques: z.string().trim().max(500, "Remarques trop longues"),
});

export type MesuresValeurs = z.infer<typeof mesuresSchema>;
