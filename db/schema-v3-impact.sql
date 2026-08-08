-- Relief.lu — migration v3 : compteur d'impact public
-- (à exécuter après schema-v2-tgtg.sql)
--
-- Les réservations sont protégées par RLS (chacun ne voit que les siennes),
-- donc un simple count() depuis le client ne donnerait que le total de
-- l'utilisateur courant. Cette fonction expose uniquement l'agrégat global
-- (aucune ligne individuelle) pour la bannière d'impact publique.

create or replace function get_impact_stats()
returns table(bags_saved bigint) as $$
begin
  return query select count(*) from reservations where status != 'cancelled';
end;
$$ language plpgsql security definer;

grant execute on function get_impact_stats() to anon, authenticated;
