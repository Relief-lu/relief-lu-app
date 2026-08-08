import { useEffect, useState } from "react";
import { LangProvider } from "./lib/i18n.jsx";
import { getCurrentUser, onAuthChange } from "./lib/auth";
import Header from "./components/Header.jsx";
import PublicView from "./components/PublicView.jsx";
import MerchantView from "./components/MerchantView.jsx";
import AccountView from "./components/AccountView.jsx";

export default function App() {
  const [view, setView] = useState("public");
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    getCurrentUser().then(setUser);
    const {
      data: { subscription },
    } = onAuthChange(setUser);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <LangProvider>
      <div className="wrap">
        <Header view={view} user={user} onNavigate={setView} />
        {view === "public" && <PublicView user={user} />}
        {view === "merchant" && <MerchantView user={user} />}
        {view === "account" && <AccountView user={user} />}
      </div>
    </LangProvider>
  );
}
