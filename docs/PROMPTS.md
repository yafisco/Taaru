# Prompts Claude Code — Taaru (à coller dans l'ordre)

Avant de commencer :
1. Crée le projet : `npx create-next-app@latest taaru --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*"`
2. Copie dans le dossier `taaru/` : `CLAUDE.md`, `.env.example`, `supabase/`, `docs/` et `starter/lib/*` vers `lib/`.
3. Crée un projet sur supabase.com, ouvre **SQL Editor**, colle `supabase/schema.sql` puis clique sur **Run**.
4. Dans Supabase, va dans **Authentication > Providers > Email** et **décoche « Confirm email »**.
5. Copie `.env.example` en `.env.local` et remplis l'URL et la clé anon.
6. Lance `claude` dans le dossier.

---

### Étape 0 — Prise en main (5 min)
```
Lis CLAUDE.md, docs/BRIEF.md et supabase/schema.sql. Résume en 5 lignes ce qu'on construit,
puis propose le plan des étapes du jour. N'écris pas encore de code.
```

### Étape 1 — Installation (20 min)
```
Installe @supabase/ssr @supabase/supabase-js zod react-hook-form @hookform/resolvers date-fns
browser-image-compression lucide-react. Initialise shadcn/ui (style par défaut, couleur de base neutre)
et ajoute : button input label card badge sheet dialog select textarea tabs sonner skeleton.
Crée lib/supabase/server.ts, lib/supabase/client.ts et un middleware.ts qui protège toutes les routes
sauf /connexion et /inscription. Thème : couleur principale #0F5257 (vert pétrole), accent #E3A008 (or).
Vérifie que npm run build passe.
```

### Étape 2 — Connexion téléphone + PIN (40 min)
```
Crée /inscription (nom de l'atelier, téléphone, code PIN à 6 chiffres) et /connexion (téléphone + PIN).
Utilise normaliserTelephone() de lib/whatsapp.ts. Côté Supabase : signUp/signInWithPassword avec
l'email technique `${tel}@taaru.app` et le PIN comme mot de passe. Passe nom_atelier et telephone dans
options.data pour que le trigger crée l'atelier. Messages d'erreur simples en français.
Écrans mobile-first, gros champs, inputMode="numeric".
```

### Étape 3 — Layout + clients + mesures (1 h)
```
Crée le layout (app) avec une barre de navigation en bas : Accueil, Commandes, Clients, Réglages,
et un bouton flottant « + Commande ».
Page /clients : recherche par nom ou téléphone, liste, bouton pour ajouter un client (sheet).
Page /clients/[id] : infos, bouton WhatsApp, fiche mesures éditable (lib/mesures.ts, champs selon le genre,
inputs numériques en cm, enregistrement en upsert dans la table mesures) et historique des commandes.
Utilise des Server Actions + zod.
```

### Étape 4 — Nouvelle commande en moins de 60 s (1 h 30)
```
Page /commandes/nouvelle en un seul écran, de haut en bas :
1) Client : recherche instantanée ou « Nouveau client » (nom + téléphone en ligne)
2) Photo du tissu : <input type="file" accept="image/*" capture="environment">, aperçu,
   compression avec browser-image-compression (maxSizeMB 0.25, maxWidthOrHeight 1280),
   upload dans le bucket photos à {atelier_id}/{commande_id}/tissu.jpg
3) Modèle : puces cliquables de MODELES_COURANTS + champ libre
4) Prix total + Acompte (montants rapides 5 000 / 10 000 / 25 000) + mode (Espèces/Wave/Orange Money)
5) Date de livraison (raccourcis +3 j, +7 j, +14 j) + Événement (EVENEMENTS)
Bouton « Enregistrer ». Crée la commande, puis le paiement d'acompte s'il est > 0.
Ensuite, redirige vers la fiche avec un toast et propose le message WhatsApp « recu ».
```

### Étape 5 — Fiche commande + paiements + statuts (1 h)
```
Page /commandes/[id] (lecture depuis la vue v_commandes) : photo du tissu en grand (URL signée),
client, modèle, date, badge de délai (delaiLivraison), barre de progression des statuts (ORDRE_STATUTS)
avec un bouton « Étape suivante ».
Bloc argent : prix, total payé, RESTE À PAYER en gros, liste des paiements, bouton « + Paiement ».
Quand le statut passe à « prete », remplis pret_le et ouvre un dialog avec le bouton
« Prévenir sur WhatsApp » (lienWhatsApp type « pret », langue de l'atelier).
Ajoute aussi un bouton « Relancer le paiement » si reste > 0, et « Marquer livrée ».
```

### Étape 6 — Liste + tableau de bord + mode fête (1 h)
```
/commandes : onglets En cours | Prêtes | Livrées, recherche, tri par date de livraison,
commandes en retard en rouge en haut. Carte compacte : photo miniature, client, modèle, délai, reste.
/ (accueil) : 4 tuiles (En cours, Prêtes à récupérer, À livrer dans 7 j, En retard),
argent : total encaissé ce mois + total restant à encaisser.
Mode fête : si ateliers.fete_date est renseignée, affiche le compte à rebours, le nombre de commandes
pour cet événement et le nombre de semaines restantes × capacite_semaine, avec une alerte rouge
« Tu es complet » si on dépasse.
/reglages : nom de l'atelier, langue des messages (FR/Wolof), capacité par semaine, fête + date, déconnexion.
```

### Étape 7 — PWA + déploiement (30 min)
```
Ajoute app/manifest.ts (name « Taaru », short_name « Taaru », theme_color #0F5257, display standalone)
et des icônes 192/512 générées simplement (lettre « t » blanche sur fond #0F5257).
Vérifie npm run build, puis prépare le déploiement Vercel (variables d'environnement à renseigner).
Fais une checklist de test manuel sur mobile, du parcours complet jusqu'à la vérification de la RLS avec 2 comptes.
```

---

### Prompts utiles en cas de souci
```
npm run build échoue. Lis l'erreur, explique la cause en 2 lignes et corrige-la sans changer la stack.
```
```
Relis le code de l'étape <N> selon CLAUDE.md : sécurité (RLS, atelier_id), UX mobile, montants FCFA.
Liste les problèmes, puis corrige-les.
```
