import { useI18n } from "../lib/i18n.jsx";

export default function Header({ view, onNavigate }) {
  const { lang, setLang, t } = useI18n();
  return (
    <header>
      <a
        href="#"
        className="logo"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("public");
        }}
      >
        relief<span>.lu</span>
      </a>
      <div className="head-right">
        <div className="langs">
          {["fr", "de", "en"].map((l) => (
            <button key={l} className={lang === l ? "active" : ""} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <a
          href="#"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(view === "merchant" ? "public" : "merchant");
          }}
        >
          {t("nav.merchant")}
        </a>
      </div>
    </header>
  );
}
