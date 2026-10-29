# Déploiement de Taaru sur Vercel

## 1. Avant de déployer

- [ ] `npm run build` passe sans erreur en local
- [ ] Le code est poussé sur GitHub (`git push`)
- [ ] Le schéma Supabase est à jour (`supabase/schema.sql` exécuté)
- [ ] Dans Supabase, **Authentication > Providers > Email** : « Confirm email » est **décoché**

## 2. Créer le projet Vercel

1. Va sur [vercel.com/new](https://vercel.com/new) et connecte ton compte GitHub.
2. Importe le dépôt **yafisco/Taaru**.
3. Framework : **Next.js** (détecté automatiquement). Root Directory : laisse vide (la racine du dépôt).
4. Avant de cliquer sur **Deploy**, ouvre **Environment Variables** et ajoute :

| Nom | Valeur | Où la trouver |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rvfkmekajaxbcpqdwkol.supabase.co` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ta clé `sb_publishable_…` | Supabase > Project Settings > API Keys |
| `NEXT_PUBLIC_APP_URL` | `https://<ton-projet>.vercel.app` | l'URL donnée par Vercel (pas encore utilisée par le code, à remplir pour plus tard) |

Coche les 3 environnements (Production, Preview, Development).

5. Clique sur **Deploy**. Compte 2 à 3 minutes.

> Ne mets **jamais** la clé `service_role` (ou `sb_secret_…`) dans Vercel avec le préfixe `NEXT_PUBLIC_` :
> elle contourne la RLS et serait visible par tout le monde dans le navigateur.

## 3. Région

`vercel.json` fixe la région des fonctions à **`dub1` (Dublin)**, à côté de la base Supabase (`eu-west-1`, Irlande).
Sans ça, Vercel utilise Washington par défaut et chaque page ferait plusieurs allers-retours transatlantiques.

## 4. Après le premier déploiement

- [ ] Dans Supabase, **Authentication > URL Configuration** : mets l'URL Vercel dans **Site URL**.
  (Pas indispensable aujourd'hui, car aucun email n'est envoyé, mais ça évite des surprises plus tard.)
- [ ] Ouvre l'URL sur ton téléphone et suis `docs/CHECKLIST_TEST.md`.
- [ ] Chaque `git push` sur `main` redéploie automatiquement.

## 5. Nom de domaine (plus tard)

Vercel > Project > Settings > Domains. Un domaine comme `taaru.sn` ou `app.taaru.sn` se branche en 5 minutes
(un enregistrement DNS à ajouter chez le registraire).
