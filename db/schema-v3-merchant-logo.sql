-- Relief.lu — migration v3 : logo du commerçant (affiché en rond sur les
-- sachets, façon TGTG). À exécuter après schema-v2-tgtg.sql.

alter table merchants add column if not exists logo_url text;
