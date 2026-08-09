import { createClient } from "@supabase/supabase-js";

// Pas de config auth spécifique — même réglage que Tatuca (flux PKCE par
// défaut), qui fonctionne de manière confirmée avec le même pattern
// magic-link. Le passage en flux implicite avait été tenté pour un autre
// bug (lien ouvert dans un contexte différent) mais n'a jamais été confirmé
// par un vrai test, et coïncide avec la panne actuelle du login — retour à
// l'état aligné sur la référence qui marche.
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
