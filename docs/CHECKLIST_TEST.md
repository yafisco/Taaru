# Checklist de test manuel : Taaru sur mobile

À faire sur un **vrai téléphone Android** (idéalement d'entrée de gamme), avec l'URL Vercel.
Sur ordinateur, à défaut : Chrome > DevTools > mode mobile **360 px**, et réseau **« Slow 4G »**.

Prévois **2 numéros** (le tien et celui d'un proche) pour l'étape 9.

---

## 1. Installation (PWA)
- [ ] Ouvrir l'URL dans Chrome : la page de connexion s'affiche, barre du haut vert pétrole
- [ ] Menu ⋮ > « Ajouter à l'écran d'accueil » (ou « Installer l'application »)
- [ ] L'icône « t » blanc sur fond vert apparaît sur l'écran d'accueil
- [ ] Ouvrir depuis l'icône : plein écran, sans barre d'adresse

## 2. Inscription et connexion
- [ ] Créer un atelier : nom, numéro `77 123 45 67`, PIN à 6 chiffres
- [ ] Un numéro invalide (`12 345`) affiche « Numéro invalide »
- [ ] Un PIN de 5 chiffres affiche « Le code PIN doit avoir 6 chiffres »
- [ ] Après inscription, on arrive sur l'accueil
- [ ] Réglages > Se déconnecter, puis se reconnecter avec le même numéro et PIN
- [ ] Un mauvais PIN affiche « Numéro ou code PIN incorrect »
- [ ] Réinscrire le même numéro affiche « Ce numéro a déjà un compte »

## 3. Clients et mesures
- [ ] Clients > Ajouter : nom, téléphone, genre. On arrive sur sa fiche
- [ ] Le bouton **Appeler** ouvre le composeur, **WhatsApp** ouvre la discussion
- [ ] Saisir des mesures (essayer `104,5` avec une virgule), Enregistrer : toast « Mesures enregistrées »
- [ ] Recharger la page : les mesures sont toujours là
- [ ] Passer de Homme à Femme : les champs changent (Longueur robe, etc.)
- [ ] Liste des clients : chercher par nom **sans accent** (« ndeye » trouve « Ndèye ») et par numéro

## 4. Nouvelle commande ⏱ (chronomètre : objectif < 60 s)
- [ ] Bouton doré **+ Commande** : le formulaire s'ouvre
- [ ] Client : en chercher un existant, puis tester « Nouveau client » sans quitter la page
- [ ] **Photo du tissu** : l'appareil photo arrière s'ouvre. Après la photo : « Envoi… » puis « Photo enregistrée »
- [ ] Mode avion pendant l'envoi : « La photo n'est pas partie » + bouton Réessayer qui marche une fois le réseau revenu
- [ ] Modèle : toucher une puce (« Grand boubou »)
- [ ] Prix `35000`, puce acompte `10 000`, mode **Wave** : « Reste à payer 25 000 FCFA »
- [ ] Livraison : puce « +7 jours », événement « Tabaski »
- [ ] **Enregistrer** : fiche commande + toast + bouton « Envoyer le reçu »
- [ ] Le reçu WhatsApp contient le numéro de commande, la date et le reste
- [ ] **Temps total noté : ____ s**

## 5. Fiche commande
- [ ] La photo s'affiche en grand, un appui l'ouvre en plein écran
- [ ] « Étape suivante » : Reçue → Coupe → Couture → Prête
- [ ] En passant à **Prête** : la fenêtre « C'est prêt ! » propose « Prévenir sur WhatsApp »
- [ ] Le message est en **wolof** si la langue est réglée sur Wolof (étape 7)
- [ ] « Revenir à … » annule une étape
- [ ] **+ Paiement** de 5 000 : le reste baisse. Un montant plus grand que le reste est refusé
- [ ] Supprimer ce paiement (corbeille) : le reste remonte
- [ ] **Relancer** ouvre WhatsApp avec le montant restant
- [ ] **Marquer livrée** alors qu'il reste de l'argent : demande de confirmation
- [ ] Annuler une autre commande, puis la réactiver : elle repart de « Reçue »

## 6. Liste et accueil
- [ ] Commandes : onglets En cours / Prêtes / Livrées avec les bons nombres
- [ ] Miniatures des tissus visibles (commandes créées après l'étape 6)
- [ ] Une commande avec une date de livraison passée apparaît **en rouge, en haut**
- [ ] Accueil : les 4 tuiles sont justes, « Encaissé ce mois » = total des paiements du mois
- [ ] Une commande annulée ne compte pas dans « Reste à encaisser »

## 7. Réglages et mode fête
- [ ] Changer le nom de l'atelier : il change sur l'accueil
- [ ] Langue des messages : Wolof
- [ ] Tenues par semaine : `2`. Fête : Tabaski, date dans 3 semaines
- [ ] Accueil : carte « Tabaski dans 21 jours » avec la barre de remplissage
- [ ] Créer des commandes « Tabaski » jusqu'à dépasser la capacité : alerte rouge **« Tu es complet »**

## 8. Réseau lent
- [ ] Réseau « Slow 4G » (DevTools) ou 3G réelle : chaque page affiche d'abord un squelette gris, puis le contenu
- [ ] Double appui rapide sur « Enregistrer » ou « Étape suivante » : pas de doublon

## 9. Sécurité : 2 comptes (RLS)
Avec le **2ᵉ numéro**, sur un autre téléphone ou en navigation privée :
- [ ] Créer un 2ᵉ atelier
- [ ] Accueil, Clients et Commandes sont **vides** : aucune donnée du 1ᵉʳ atelier
- [ ] Copier l'URL d'une fiche client du 1ᵉʳ compte (`/clients/…`) et l'ouvrir avec le 2ᵉ : **page introuvable**
- [ ] Pareil avec une fiche commande (`/commandes/…`) : **page introuvable**
- [ ] Les photos du 1ᵉʳ compte ne s'affichent pas (lien de photo copié : erreur)

---

**Résultat :** ____ / 9 sections OK. Problèmes notés :

1.
2.
3.
