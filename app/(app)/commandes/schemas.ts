import { z } from "zod";
import { EVENEMENTS } from "@/lib/mesures";

// Partagé entre le formulaire (client) et la Server Action (serveur)

const CLES_EVENEMENTS = EVENEMENTS.map((e) => e.cle) as [string, ...string[]];
const MONTANT_MAX = 10_000_000; // 10 millions FCFA : garde-fou contre une faute de frappe

export const MODES_PAIEMENT = [
  { cle: "especes", label: "Espèces" },
  { cle: "wave", label: "Wave" },
  { cle: "orange_money", label: "Orange Money" },
] as const;

export const commandeSchema = z
  .object({
    clientId: z.uuid({ error: "Choisis ou ajoute un client" }),
    modele: z.string().trim().min(2, "Choisis ou écris le modèle").max(80, "Trop long"),
    prixTotal: z
      .number({ error: "Entre le prix" })
      .int()
      .positive("Entre le prix")
      .max(MONTANT_MAX, "Montant trop grand"),
    acompte: z.number({ error: "Montant invalide" }).int().min(0).max(MONTANT_MAX, "Montant trop grand"),
    mode: z.enum(["especes", "wave", "orange_money"]),
    dateLivraison: z.iso.date({ error: "Choisis la date de livraison" }),
    evenement: z.enum(CLES_EVENEMENTS).nullable(),
  })
  .refine((v) => v.acompte <= v.prixTotal, { path: ["acompte"], message: "L'acompte dépasse le prix" });

export type CommandeValeurs = z.infer<typeof commandeSchema>;

/** "25 000" | "25000" -> 25000 ; "" -> vide (NaN, refusé par zod si obligatoire) */
export const lireMontant = (v: unknown) => {
  const chiffres = String(v ?? "").replace(/\D/g, "");
  return chiffres === "" ? NaN : Number(chiffres);
};
