import { supabase } from "./supabase";

// Envoie un lien de connexion par email — pas de mot de passe à gérer.
// Utilisé pour les commerçants comme pour les acheteurs (même mécanisme).
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  if (error) throw error;
}

// Alternative au clic sur le lien : saisir le code reçu par email. Utile en
// PWA installée (le lien ouvre parfois un navigateur externe sans la même session).
export async function verifyOtpCode(email, token) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

export async function logout() {
  await supabase.auth.signOut();
}
