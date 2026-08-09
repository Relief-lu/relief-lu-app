import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    // Le flux PKCE (par défaut) exige que le "code verifier" stocké au moment
    // de la demande de lien magique soit encore présent dans le navigateur qui
    // ouvre le lien — ce qui échoue silencieusement si le lien est ouvert
    // depuis un autre contexte (ex: le navigateur intégré d'une appli email
    // sur mobile, différent du navigateur où le lien a été demandé). Le flux
    // implicite envoie directement les jetons de session dans l'URL, donc
    // n'importe quel navigateur qui ouvre le lien peut établir la session.
    flowType: "implicit",
  },
});
