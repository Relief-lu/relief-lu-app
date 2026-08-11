-- Relief.lu — migration v6 : notes détaillées par catégorie (Collecte,
-- Qualité, Variété, Quantité), laissées par le client au moment de son avis
-- (voir ReviewForm.jsx) — affichées sur la page détail du sachet.
-- Les sections "Emballages" et "Ingrédients & Allergènes" de la page détail
-- utilisent un texte générique fixe, pas de données stockées : ce ne sont
-- pas des infos que le commerçant doit renseigner à chaque sachet.

alter table reviews add column if not exists rating_collecte int check (rating_collecte between 1 and 5);
alter table reviews add column if not exists rating_qualite int check (rating_qualite between 1 and 5);
alter table reviews add column if not exists rating_variete int check (rating_variete between 1 and 5);
alter table reviews add column if not exists rating_quantite int check (rating_quantite between 1 and 5);
