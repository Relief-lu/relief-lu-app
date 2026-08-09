-- Relief.lu — migration v4 : vraies infos d'inscription commerçant
-- (adresse et ville existaient déjà mais n'étaient jamais collectées côté UI).
-- À exécuter après schema-v3-merchant-logo.sql.

alter table merchants add column if not exists phone text;
alter table merchants add column if not exists registration_number text;
