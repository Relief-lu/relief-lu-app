import { useEffect, useState } from "react";
import { LangProvider } from "./lib/i18n.jsx";
import { getCurrentUser, onAuthChange, consumePendingView } from "./lib/auth";
import Header from "./components/Header.jsx";
import PublicView from "./components/PublicView.jsx";
import MerchantView from "./components/MerchantView.jsx";
import AccountView from "./components/AccountView.jsx";
import FavoritesView from "./components/FavoritesView.jsx";
import LegalModal from "./components/LegalModal.jsx";
import SocialLinks from "./components/SocialLinks.jsx";

export default function App() {
  const [view, setView] = useState("public");
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [legalModal, setLegalModal] = useState(null);
  const [pendingReserveBagId, setPendingReserveBagId] = useState(null);

  useEffect(() => {
    // Restaure la vue d'où la demande de lien magique est partie (espace
    // commerçant, favoris, compte, ou "reserve:<id>" pour rouvrir la modale
    // de réservation du sachet précis) — sinon on retombe sur "public" après
    // le clic, puisque la vue n'est qu'un state React, pas dans l'URL.
    function handleUser(u) {
      setUser(u);
      if (u) {
        const pendingView = consumePendingView();
        if (pendingView?.startsWith("reserve:")) {
          setView("public");
          setPendingReserveBagId(pendingView.slice("reserve:".length));
        } else if (pendingView) {
          setView(pendingView);
        }
      }
    }
    getCurrentUser().then(handleUser);
    const {
      data: { subscription },
    } = onAuthChange(handleUser);
    return () => subscription.unsubscribe();
  }, []);

  // Ouvre directement un document légal via un lien partageable, ex: app.html?legal=cgu
  useEffect(() => {
    const legal = new URLSearchParams(window.location.search).get("legal");
    if (legal) setLegalModal(legal);
  }, []);

  // Ouvre directement une vue via un lien partageable, ex: app.html?view=merchant
  // (utilisé par le lien "Espace commerçant" de la landing page).
  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view");
    if (requestedView) setView(requestedView);
  }, []);

  return (
    <LangProvider>
      <div className="wrap">
        <Header view={view} user={user} onNavigate={setView} />
        {view === "public" && (
          <PublicView user={user} pendingReserveBagId={pendingReserveBagId} onPendingReserveHandled={() => setPendingReserveBagId(null)} />
        )}
        {view === "merchant" && <MerchantView user={user} onOpenLegal={setLegalModal} />}
        {view === "account" && <AccountView user={user} />}
        {view === "favorites" && <FavoritesView user={user} />}

        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, padding: "30px 0" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, opacity: 0.7 }}>
            <button className="btn secondary small" onClick={() => setLegalModal("mentions")}>
              Mentions légales
            </button>
            <button className="btn secondary small" onClick={() => setLegalModal("cgu")}>
              CGU
            </button>
            <button className="btn secondary small" onClick={() => setLegalModal("confidentialite")}>
              Confidentialité
            </button>
            <button className="btn secondary small" onClick={() => setLegalModal("cookies")}>
              Cookies
            </button>
          </div>
          <SocialLinks />
        </footer>
      </div>

      {legalModal && (
        <LegalModal
          type={legalModal}
          onClose={() => {
            setLegalModal(null);
            // Nettoie ?legal=... de l'URL — sinon un rechargement (ou la réouverture
            // de la PWA) rouvrirait la modale automatiquement, et le bouton "retour"
            // du navigateur ne ramènerait jamais à la page précédente.
            const url = new URL(window.location.href);
            url.searchParams.delete("legal");
            window.history.replaceState({}, "", url);
          }}
        />
      )}
    </LangProvider>
  );
}
