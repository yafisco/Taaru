// lib/mesures.ts — champs de mesures (en cm). Une fiche par client, stockée dans mesures.valeurs (JSONB)

export type ChampMesure = { cle: string; label: string; groupe: "haut" | "bas" | "longueurs" };

const COMMUNS: ChampMesure[] = [
  { cle: "tour_cou",        label: "Tour de cou",       groupe: "haut" },
  { cle: "epaule",          label: "Épaule",            groupe: "haut" },
  { cle: "tour_poitrine",   label: "Tour de poitrine",  groupe: "haut" },
  { cle: "tour_bras",       label: "Tour de bras",      groupe: "haut" },
  { cle: "longueur_manche", label: "Longueur manche",   groupe: "haut" },
  { cle: "poignet",         label: "Poignet",           groupe: "haut" },
  { cle: "tour_taille",     label: "Tour de taille",    groupe: "bas" },
  { cle: "tour_hanches",    label: "Tour de hanches",   groupe: "bas" },
];

export const MESURES_HOMME: ChampMesure[] = [
  ...COMMUNS,
  { cle: "longueur_chemise",  label: "Longueur chemise / tunique", groupe: "longueurs" },
  { cle: "longueur_boubou",   label: "Longueur grand boubou",      groupe: "longueurs" },
  { cle: "longueur_pantalon", label: "Longueur pantalon",          groupe: "longueurs" },
  { cle: "tour_cuisse",       label: "Tour de cuisse",             groupe: "bas" },
  { cle: "bas_pantalon",      label: "Bas de pantalon",            groupe: "bas" },
];

export const MESURES_FEMME: ChampMesure[] = [
  ...COMMUNS,
  { cle: "dessous_poitrine", label: "Dessous de poitrine",      groupe: "haut" },
  { cle: "longueur_buste",   label: "Longueur buste",           groupe: "longueurs" },
  { cle: "longueur_haut",    label: "Longueur haut (taille basse)", groupe: "longueurs" },
  { cle: "longueur_jupe",    label: "Longueur jupe / pagne",    groupe: "longueurs" },
  { cle: "longueur_robe",    label: "Longueur robe / kaftan",   groupe: "longueurs" },
];

export const champsMesures = (genre: "homme" | "femme" | null) =>
  genre === "femme" ? MESURES_FEMME : MESURES_HOMME;

export const MODELES_COURANTS = [
  "Grand boubou", "Kaftan", "Taille basse", "Ensemble pagne", "Tunique + pantalon",
  "Robe", "Chemise", "Costume", "Abaya", "Uniforme",
];

export const EVENEMENTS = [
  { cle: "tabaski", label: "Tabaski" }, { cle: "korite", label: "Korité" },
  { cle: "magal", label: "Magal" },     { cle: "gamou", label: "Gamou" },
  { cle: "mariage", label: "Mariage" }, { cle: "bapteme", label: "Baptême" },
  { cle: "autre", label: "Autre" },
];
