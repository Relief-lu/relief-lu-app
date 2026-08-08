# Relief.lu — état du projet (handoff)

Contexte rapide : plateforme anti-gaspillage alimentaire pour le Luxembourg
(façon Too Good To Go), positionnement social/pouvoir d'achat plutôt que
climat — voir la mission dans `index.html`. Projet mené en parallèle de
Tatuca (location d'objets, Arlon/Luxembourg).

## Stack

- Frontend : HTML/CSS/JS vanilla, aucune étape de build. Déploiement prévu
  sur Netlify (même pattern que Tatuca).
- Backend : Supabase — **projet séparé de celui de Tatuca**, volontairement,
  pour ne pas mélanger les données des deux entreprises.
- Auth commerçants : Supabase Auth, magic link par email (pas de mot de passe).

## Fichiers

- `index.html` — page d'atterrissage / pré-lancement, capture d'emails
  (table `waitlist`), branchée sur Supabase.
- `app.html` — l'application complète : parcours public (liste des sachets,
  réservation, code de retrait) + espace commerçant (connexion, publication
  de sachets avec photo). Multilingue FR/DE/EN (dictionnaire `I18N` en haut
  du script, facile à étendre en LU).
- `supabase-setup.sql` — crée la table `waitlist` (à exécuter en premier).
- `schema-app.sql` — crée `merchants`, `bags`, `reservations`, la fonction
  `reserve_bag` (réservation atomique, empêche la survente via un verrou de
  ligne), et le bucket de stockage `bag-photos`.
- `manifest.json`, `sw.js`, `icon-*.png` — rendent le site installable en PWA.

## Fait et testé

- Inscription à la waitlist (`index.html`) : testée en conditions réelles,
  fonctionne (email visible dans la table `waitlist`).

## Fait mais PAS encore testé en conditions réelles

- Tout `app.html` : parcours de réservation, connexion commerçant par
  magic link, publication de sachet avec upload photo. Le code est
  cohérent et les policies RLS sont écrites, mais rien n'a été exécuté
  dans un vrai navigateur contre le vrai projet Supabase. À tester
  intégralement avant de faire confiance au flux.

## Pas fait du tout — à ne pas oublier

- **Paiement réel** : volontairement absent. Nécessite une entité légale
  vérifiée (SARL-S) avant tout compte Stripe/processeur — voir avec un
  professionnel une fois la société constituée.
- **Pages légales** (CGU, politique de confidentialité) — obligatoires
  avant toute collecte réelle de données (RGPD), à faire avant un
  lancement public, pas juste un test interne.
- **Confirmation par email** de la réservation — le code de retrait
  ne s'affiche qu'à l'écran une fois, rien n'est renvoyé si l'utilisateur
  ferme la fenêtre.
- **Traduction du contenu utilisateur** — seule l'interface (boutons,
  labels) est traduite FR/DE/EN. Les titres/descriptions de sachets créés
  par les commerçants restent dans la langue où ils les ont écrits.

## Séquence business (rappel, pas un détail technique)

1. Pilote manuel avec le premier traiteur (invendus du soir, vente en
   interne, sans app) — c'est ça qui doit produire les premiers vrais
   chiffres.
2. Une fois validé : réplication via le réseau professionnel (autres
   cabinets, banques) pour le volet entreprises.
3. `app.html` devient pertinent pour le volet grand public (Volet 2),
   une fois qu'il y a une vraie preuve de concept à montrer aux
   commerçants publics (Cactus, boulangeries, etc.).
