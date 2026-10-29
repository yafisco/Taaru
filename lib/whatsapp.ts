// lib/whatsapp.ts — liens WhatsApp wa.me (sans API, gratuit)

const PREFIXES_SN = ["70", "75", "76", "77", "78"];

/** "77 123 45 67" | "+221771234567" | "00221 77..." -> "221771234567" (ou null si invalide) */
export function normaliserTelephone(brut: string): string | null {
  let n = brut.replace(/\D/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.length === 9) n = "221" + n;
  if (n.length !== 12 || !n.startsWith("221")) return null;
  return PREFIXES_SN.includes(n.slice(3, 5)) ? n : null;
}

/** "221771234567" -> "77 123 45 67" */
export function afficherTelephone(n: string): string {
  const l = n.replace(/^221/, "");
  return `${l.slice(0, 2)} ${l.slice(2, 5)} ${l.slice(5, 7)} ${l.slice(7, 9)}`;
}

export type Langue = "fr" | "wo";
type Vars = { client: string; modele: string; atelier: string; reste: number; code?: string; date?: string };

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

export const MODELES = {
  pret: {
    fr: (v: Vars) =>
      // « commande » est féminin : la phrase reste juste avec tous les modèles (taille basse, robe, boubou…)
      `Salam ${v.client} 👋\nVotre commande « ${v.modele} » est prête chez ${v.atelier} ✂️\n` +
      (v.reste > 0 ? `Reste à payer : ${fcfa(v.reste)}.\n` : `Tout est réglé, merci !\n`) +
      `À bientôt 🙏`,
    wo: (v: Vars) =>
      `Salaam aleykoum ${v.client} 👋\nSa ${v.modele} pare na ci ${v.atelier} ✂️\n` +
      (v.reste > 0 ? `Li des : ${fcfa(v.reste)}.\n` : `Fey nga lépp, jërëjëf !\n`) +
      `Ba beneen yoon 🙏`,
  },
  recu: {
    fr: (v: Vars) =>
      `Bonjour ${v.client}, commande n°${v.code} bien reçue chez ${v.atelier} ✅\n` +
      `Modèle : ${v.modele}\nLivraison prévue : ${v.date}\nReste à payer : ${fcfa(v.reste)}.`,
    wo: (v: Vars) =>
      `Salaam ${v.client}, sa commande n°${v.code} agsi na ci ${v.atelier} ✅\n` +
      `Modèle : ${v.modele}\nDinañu la ko jox : ${v.date}\nLi des : ${fcfa(v.reste)}.`,
  },
  relance: {
    fr: (v: Vars) =>
      `Bonjour ${v.client}, petit rappel de ${v.atelier} : votre ${v.modele} vous attend. ` +
      `Reste à payer : ${fcfa(v.reste)}. Merci 🙏`,
    wo: (v: Vars) =>
      `Salaam ${v.client}, ${v.atelier} lay fàttali : sa ${v.modele} mungi lay xaar. ` +
      `Li des : ${fcfa(v.reste)}. Jërëjëf 🙏`,
  },
} as const;

export type TypeMessage = keyof typeof MODELES;

export function lienWhatsApp(telephone: string, type: TypeMessage, langue: Langue, vars: Vars): string | null {
  const tel = normaliserTelephone(telephone);
  if (!tel) return null;
  const texte = MODELES[type][langue](vars);
  return `https://wa.me/${tel}?text=${encodeURIComponent(texte)}`;
}

/* Exemple :
lienWhatsApp("77 123 45 67", "pret", "wo", { client: "Moussa", modele: "grand boubou", atelier: "Atelier Ndiaye", reste: 15000 })
-> https://wa.me/221771234567?text=Salaam%20aleykoum%20Moussa...
*/
