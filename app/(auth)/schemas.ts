import { z } from "zod";
import { normaliserTelephone } from "@/lib/whatsapp";

// Partagés entre le formulaire (client) et la Server Action (serveur)

const telephone = z
  .string()
  .trim()
  .min(1, "Entre ton numéro")
  .refine((v) => normaliserTelephone(v) !== null, "Numéro invalide. Exemple : 77 123 45 67");

const pin = z.string().regex(/^\d{6}$/, "Le code PIN doit avoir 6 chiffres");

export const connexionSchema = z.object({ telephone, pin });

export const inscriptionSchema = z.object({
  nomAtelier: z.string().trim().min(2, "Entre le nom de ton atelier").max(60, "Nom trop long"),
  telephone,
  pin,
});

export type ConnexionValeurs = z.infer<typeof connexionSchema>;
export type InscriptionValeurs = z.infer<typeof inscriptionSchema>;

// Email technique Supabase, jamais montré au tailleur
export const emailTechnique = (tel: string) => `${tel}@taaru.app`;
