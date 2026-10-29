# Brief projet — Taaru

**Nom :** Taaru (« taar » = beauté, élégance en wolof)
**Slogan :** Chaque commande sous contrôle, même à la Tabaski.
**Porteur :** Yafa — YAFABiz Digital (Thiès)
**Type :** SaaS mobile (PWA) pour tailleurs et couturières au Sénégal
**Objectif du jour :** un MVP codé et déployé, testable chez 3 à 5 tailleurs dès demain.

## Le problème
- Environ 60 commandes gérées **de tête** ou dans un cahier qui s'abîme.
- **Mesures perdues** : on remesure le client à chaque commande et on se trompe.
- **Acompte flou** : « Il m'a donné 10 000 ou 15 000 ? » Ça crée des disputes et de l'argent perdu.
- **Panique avant les fêtes** (Tabaski, Korité, Magal, Gamou) : le tailleur accepte trop de commandes, livre en retard
  et reçoit des appels sans arrêt.

## La solution
| Douleur | Fonction Taaru |
|---|---|
| Commandes de tête | Fiche commande avec **photo du tissu**, modèle, prix et date de livraison |
| Mesures perdues | **Fiche mesures** par client, enregistrée une fois et réutilisée |
| Acompte flou | **Paiements** (espèces, Wave, Orange Money) et **reste à payer** calculé automatiquement |
| Appels du client « c'est prêt ? » | Bouton **WhatsApp « C'est prêt »** avec le message déjà rédigé (FR ou wolof) |
| Panique Tabaski | **Mode fête** : compte à rebours, nombre de commandes comparé à la capacité, alerte de surcharge |

## Cible
Tailleur ou couturière indépendant(e), atelier de 1 à 4 personnes, à Thiès puis à Dakar. Il a un smartphone Android
et utilise WhatsApp tous les jours. Il est à l'aise avec Wave ou Orange Money, mais tape peu de texte.

## Proposition de valeur
> « Fini le cahier perdu. Tes clients, leurs mesures et leur argent au même endroit. Et ils sont prévenus sur WhatsApp en 1 clic. »

## Modèle économique (hypothèses à tester)
- **Gratuit** : jusqu'à 30 commandes actives.
- **Taaru Pro** : **3 000 FCFA/mois**, ou **7 500 FCFA** pour la saison Tabaski (3 mois, au lieu de 9 000 au mois), payé par Wave.
- Plus tard : reçu PDF à l'image de l'atelier, mini-catalogue de modèles, comptes pour les apprentis.

## Test terrain (7 jours)
| Indicateur | Objectif |
|---|---|
| Tailleurs équipés | 5 |
| Commandes saisies par tailleur | ≥ 20 |
| Temps de saisie d'une commande | < 60 s |
| Tailleurs encore actifs à J+7 | ≥ 3 sur 5 |
| Tailleurs prêts à payer | ≥ 1 |

## Stack
Next.js + TypeScript + Tailwind + shadcn/ui · Supabase (Auth, Postgres, Storage) · Vercel · liens WhatsApp `wa.me`.
