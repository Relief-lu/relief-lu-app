import { useEffect, useState } from "react";
import { LangProvider } from "./lib/i18n.jsx";
import { getCurrentUser, onAuthChange } from "./lib/auth";
import Header from "./components/Header.jsx";
import PublicView from "./components/PublicView.jsx";
import MerchantView from "./components/MerchantView.jsx";
import AccountView from "./components/AccountView.jsx";
import FavoritesView from "./components/FavoritesView.jsx";
import LegalModal from "./components/LegalModal.jsx";

export default function App() {
  const [view, setView] = useState("public");
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [legalModal, setLegalModal] = useState(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const {
      data: { subscription },
    } = onAuthChange(setUser);
    return () => subscription.unsubscribe();
  }, []);

  // Ouvre directement un document légal via un lien partageable, ex: app.html?legal=cgu
  useEffect(() => {
    const legal = new URLSearchParams(window.location.search).get("legal");
    if (legal) setLegalModal(legal);
  }, []);

  return (
    <LangProvider>
      <div className="wrap">
        <Header view={view} user={user} onNavigate={setView} />
        {view === "public" && <PublicView user={user} />}
        {view === "merchant" && <MerchantView user={user} />}
        {view === "account" && <AccountView user={user} />}
        {view === "favorites" && <FavoritesView user={user} />}

        <footer style={{ display: "flex", gap: 16, padding: "30px 0", fontSize: 13, opacity: 0.7 }}>
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
        </footer>
      </div>

      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </LangProvider>
  );
}
