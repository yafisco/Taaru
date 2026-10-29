# CLAUDE.md — Taaru

> Taaru (« taar » = beauté, élégance en wolof) : l'app de gestion des commandes pour les tailleurs sénégalais.
> Slogan : **« Chaque commande sous contrôle, même à la Tabaski. »**

## 1. Contexte en 30 secondes
Un tailleur gère 30 à 60 commandes de tête ou dans un cahier. Il perd des mesures, oublie qui a versé quel acompte
et panique avant la Tabaski, la Korité, le Magal ou le Gamou.
Taaru lui permet de :
1. enregistrer une commande en **moins de 60 secondes** (client + photo du tissu + prix + acompte + date) ;
2. garder les **mesures d'un client une fois pour toutes** ;
3. suivre **acompte, paiements et reste à payer** ;
4. prévenir le client sur **WhatsApp en 1 clic** quand la tenue est prête (lien `wa.me`, sans API) ;
5. voir la **charge avant une fête** (mode fête + capacité par semaine).

Utilisateur unique : **le tailleur** (1 compte = 1 atelier). Il est sur un **Android d'entrée de gamme**,
avec une connexion 3G/4G instable, et il est pressé. Il n'aime pas taper du texte.

## 2. Stack (ne pas en changer sans demander)
- **Next.js** (version stable la plus récente, App Router, Server Actions) + **TypeScript strict**
- **Tailwind CSS** + **shadcn/ui** (composants dans `components/ui`)
- **Supabase** : Auth (email + mot de passe), Postgres + RLS, Storage (bucket privé `photos`)
- `@supabase/ssr` pour les clients serveur et navigateur
- **zod** + **react-hook-form** pour les formulaires
- **date-fns** (locale `fr`) pour les dates
- **browser-image-compression** pour compresser les photos avant l'upload (≤ 250 Ko, 1280 px max)
- **lucide-react** pour les icônes
- PWA : `app/manifest.ts` + icônes (installable sur l'écran d'accueil)
- Déploiement : **Vercel**

## 3. Commandes
```bash
npm run dev        # http://localhost:3000
npm run build      # doit passer sans erreur avant chaque commit
npm run lint
npx supabase gen types typescript --project-id <ID> > lib/database.types.ts
```

## 4. Structure
```
app/
  (auth)/connexion/page.tsx      # connexion : téléphone + code PIN
  (auth)/inscription/page.tsx
  (app)/layout.tsx               # barre de navigation en bas (mobile)
  (app)/page.tsx                 # tableau de bord
  (app)/commandes/page.tsx       # liste + filtres
  (app)/commandes/nouvelle/page.tsx
  (app)/commandes/[id]/page.tsx  # fiche commande
  (app)/clients/page.tsx
  (app)/clients/[id]/page.tsx    # fiche client + mesures + historique
  (app)/reglages/page.tsx
  manifest.ts
components/
  ui/                            # shadcn
  commande-card.tsx, statut-badge.tsx, montant.tsx, photo-input.tsx, mesures-form.tsx, whatsapp-button.tsx
lib/
  supabase/server.ts, supabase/client.ts, supabase/middleware.ts
  whatsapp.ts                    # normaliser les numéros + construire les liens wa.me
  format.ts                      # formatFCFA, formatDate
  mesures.ts                     # champs de mesures homme / femme
  database.types.ts              # généré
supabase/schema.sql              # source de vérité de la base
docs/                            # brief + cahier des charges
```

## 5. Règles métier (importantes)
- **Montants** : entiers en **FCFA**, jamais de décimales. Affichage `25 000 FCFA` (espace insécable).
  Utiliser `formatFCFA()` partout.
- **Reste à payer** = `prix_total - somme(paiements)`. Toujours le calculer (vue `v_commandes`), ne jamais le stocker.
- L'**acompte** est simplement le premier paiement saisi à la création de la commande.
- **Statuts** : `recue → coupe → couture → prete → livree` (+ `annulee`). Quand on passe à `prete`, on remplit `pret_le`
  et on propose **tout de suite** le bouton WhatsApp. Quand on passe à `livree`, on remplit `livre_le`.
- **En retard** = `date_livraison < aujourd'hui` et statut différent de `prete`, `livree` et `annulee`.
- **Téléphone** : normaliser en `221XXXXXXXXX`. On accepte `77 123 45 67`, `+221771234567` et `00221…`.
  Préfixes valides : 70, 75, 76, 77, 78.
- **Mesures** : une seule fiche par client (`mesures.client_id` est la clé primaire), en cm, stockée en JSONB.
  On la met à jour, on ne la duplique pas.
- **Photos** : chemin Storage `{atelier_id}/{commande_id}/tissu.jpg`. On les compresse avant l'upload.
  On les affiche avec des **URL signées** (bucket privé).
- **Connexion** : le tailleur se connecte avec son **numéro + un code PIN de 6 chiffres**. Techniquement, c'est
  l'auth email de Supabase avec un email technique `221XXXXXXXXX@taaru.app`. La confirmation par email est **désactivée**
  dans Supabase. On ne montre jamais cet email à l'utilisateur.

## 6. UX : à respecter
- **Mobile d'abord** (360 px). Gros boutons (au moins 44 px), une action principale par écran.
- Bouton flottant **« + Commande »** visible partout.
- Formulaires courts : clavier numérique (`inputMode="numeric"`) pour les montants et les numéros,
  `capture="environment"` pour la photo.
- Montants rapides : boutons `5 000`, `10 000`, `25 000` à côté du champ.
- Langue de l'interface : **français simple**. Messages WhatsApp en **français ou wolof** (réglage).
- États vides utiles (« Aucune commande. Ajoute la première en 1 minute »).
- Pas de jargon : on écrit « Reste à payer », pas « Solde débiteur ».

## 7. Conventions de code
- Composants serveur par défaut. `"use client"` seulement si c'est nécessaire (formulaires, caméra).
- Mutations = **Server Actions** dans `app/(app)/**/actions.ts`, validées avec zod, suivies de `revalidatePath`.
- Ne jamais faire confiance à `atelier_id` envoyé par le client : la RLS + `default auth.uid()` s'en chargent.
- Noms de tables et de colonnes **en français, en snake_case** (voir le schéma). Code TS en camelCase.
- Pas de `any`. Types issus de `lib/database.types.ts`.
- Petits commits, un par fonctionnalité, message en français : `feat: fiche mesures client`.

## 8. Hors périmètre du MVP (ne pas coder)
WhatsApp Cloud API, SMS, comptes multiples ou apprentis, paiement en ligne, stock de tissus, comptabilité,
application native, mode hors-ligne complet.

## 9. Définition de « terminé »
- `npm run build` passe sans erreur.
- Le parcours fonctionne sur mobile (DevTools 360 px) : inscription → nouvelle commande avec photo → paiement
  → statut prêt → WhatsApp → livrée.
- La RLS est vérifiée : un 2ᵉ compte ne voit aucune donnée du 1ᵉʳ.
