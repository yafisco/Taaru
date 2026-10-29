// lib/fete.ts : mode fête (Tabaski, Korité…). L'atelier choisit une fête et sa date dans Réglages.
import { differenceInCalendarDays } from "date-fns";

export const FETES = [
  { cle: "tabaski", label: "Tabaski" },
  { cle: "korite", label: "Korité" },
  { cle: "magal", label: "Magal" },
  { cle: "gamou", label: "Gamou" },
] as const;

export type CleFete = (typeof FETES)[number]["cle"];

/** ateliers.fete_nom stocke le libellé (« Tabaski ») ; commandes.evenement stocke la clé (« tabaski ») */
export const cleDeFete = (nom: string | null) => FETES.find((f) => f.label === nom)?.cle ?? null;

export type ModeFete = {
  nom: string;
  joursRestants: number;
  commandesAFaire: number;
  capacite: number;
  complet: boolean;
};

/**
 * Charge avant la fête. Capacité = semaines restantes × tenues par semaine.
 * On compte les commandes de l'événement qui ne sont pas encore prêtes (reçue, coupe, couture).
 */
export function calculerModeFete(
  fete: { nom: string | null; date: string | null; capaciteSemaine: number },
  commandes: { evenement: string | null; statut: string | null }[],
  aujourdhui = new Date()
): ModeFete | null {
  const cle = cleDeFete(fete.nom);
  if (!cle || !fete.date) return null;

  const joursRestants = differenceInCalendarDays(new Date(fete.date), aujourdhui);
  if (joursRestants < 0) return null;

  const commandesAFaire = commandes.filter(
    (c) => c.evenement === cle && (c.statut === "recue" || c.statut === "coupe" || c.statut === "couture")
  ).length;
  const capacite = Math.floor((joursRestants / 7) * fete.capaciteSemaine);

  return { nom: fete.nom!, joursRestants, commandesAFaire, capacite, complet: commandesAFaire >= capacite };
}
