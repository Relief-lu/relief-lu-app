import { useState } from "react";
import { LangProvider } from "./lib/i18n.jsx";
import Header from "./components/Header.jsx";
import PublicView from "./components/PublicView.jsx";
import MerchantView from "./components/MerchantView.jsx";

export default function App() {
  const [view, setView] = useState("public");

  return (
    <LangProvider>
      <div className="wrap">
        <Header view={view} onNavigate={setView} />
        {view === "public" ? <PublicView /> : <MerchantView />}
      </div>
    </LangProvider>
  );
}
