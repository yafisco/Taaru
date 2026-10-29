import { format } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { normaliserTelephone } from "@/lib/whatsapp";

/** Commandes en cours (ni livrées ni annulées) autorisées en Gratuit.
 *  Même valeur que dans verifier_limite_gratuite() (supabase/schema.sql), qui bloque côté base. */
export const LIMITE_GRATUIT = 30;

/** Formules Pro en FCFA, mêmes prix que sur la landing */
export const FORMULES_PRO = [
  { mois: 1, montant: 5_000, label: "1 mois" },
  { mois: 3, montant: 12_500, label: "Saison (3 mois)" },
] as const;
export const PRIX_INSTALLATION = 10_000;

/** Message d'erreur levé par la base quand la limite est atteinte */
export const ERREUR_LIMITE = "limite_gratuite";
export const MESSAGE_LIMITE = `Tu as ${LIMITE_GRATUIT} commandes en cours, la limite de l'offre Gratuit. Livre une commande ou passe à Pro.`;

/** Pro tant que la date de fin n'est pas passée (le jour de fin est inclus) */
export const estPro = (proJusquAu: string | null) => !!proJusquAu && proJusquAu >= format(new Date(), "yyyy-MM-dd");

export type Offre = { pro: boolean; proJusquAu: string | null; enCours: number; limiteAtteinte: boolean };

/** Offre de l'atelier connecté et nombre de commandes qui comptent dans la limite */
export async function lireOffre(supabase: SupabaseClient<Database>): Promise<Offre | null> {
  const [{ data: atelier }, { count }] = await Promise.all([
    supabase.from("ateliers").select("pro_jusqu_au").maybeSingle(),
    supabase.from("commandes").select("id", { count: "exact", head: true }).not("statut", "in", "(livree,annulee)"),
  ]);
  if (!atelier) return null;
  const pro = estPro(atelier.pro_jusqu_au);
  const enCours = count ?? 0;
  return { pro, proJusquAu: atelier.pro_jusqu_au, enCours, limiteAtteinte: !pro && enCours >= LIMITE_GRATUIT };
}

/** Lien WhatsApp vers Taaru avec le message déjà écrit */
export function lienContactTaaru(telephone: string, message: string): string | null {
  const n = normaliserTelephone(telephone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}
