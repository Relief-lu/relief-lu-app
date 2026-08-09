import { useI18n } from "../lib/i18n.jsx";
import { logout } from "../lib/auth";
import { isRegistrationComplete } from "../lib/merchants";

export default function Header({ view, user, merchant, onNavigate }) {
  const { lang, setLang, t } = useI18n();
  const isMerchant = isRegistrationComplete(merchant);
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
            onNavigate("favorites");
          }}
        >
          {t("nav.favorites")}
        </a>
        <a
          href="#"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("account");
          }}
        >
          {t("nav.account")}
        </a>
        <a
          href="#"
          className={isMerchant ? "nav-link merchant-badge" : "nav-link"}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(view === "merchant" ? "public" : "merchant");
          }}
        >
          {isMerchant ? `🏪 ${merchant.business_name}` : t("nav.merchant")}
        </a>
        {user && (
          <button className="btn secondary small" onClick={logout}>
            {t("account.logout")}
          </button>
        )}
      </div>
    </header>
  );
}
