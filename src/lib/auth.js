import { supabase } from "./supabase";

// La vue (public/merchant/account/favorites) n'est jamais reflétée dans l'URL
// (juste un state React) — sans ça, le clic sur le lien magique recharge la
// page et retombe toujours sur la vue par défaut, même si la demande venait
// de l'espace commerçant ou de la page favoris.
const PENDING_VIEW_KEY = "relief-pending-view";

// Envoie un lien de connexion par email — pas de mot de passe à gérer.
// Utilisé pour les commerçants comme pour les acheteurs (même mécanisme).
// `view` (optionnel) : la vue à restaurer après le clic sur le lien.
export async function sendMagicLink(email, view) {
  if (view) localStorage.setItem(PENDING_VIEW_KEY, view);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  if (error) throw error;
}

export function consumePendingView() {
  const view = localStorage.getItem(PENDING_VIEW_KEY);
  localStorage.removeItem(PENDING_VIEW_KEY);
  return view;
}

// Selon la forme exacte de l'erreur renvoyée (ex: le champ est "msg" et pas
// "message" sur certaines réponses 500 de Supabase Auth), err.message peut
// être vide — sans ça, l'UI affichait littéralement "{}" à l'utilisateur.
export function getErrorMessage(err, fallback = "Une erreur est survenue, réessaie dans un instant.") {
  return err?.message || err?.msg || err?.error_description || fallback;
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
