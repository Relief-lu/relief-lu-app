-- Relief.lu — migration v5 : prix d'origine (barré) pour afficher l'économie
-- réalisée, comme TGTG. Optionnel — si non renseigné, seul le prix réduit
-- s'affiche (comportement actuel inchangé).

alter table bags add column if not exists original_price_cents integer;
