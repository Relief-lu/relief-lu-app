import { useI18n } from "../lib/i18n.jsx";

// Affiché quand il n'y a encore aucun sachet en ligne — évite une page vide
// sans contexte pour les premiers visiteurs de l'app (avant le lancement).
export default function MissionIntro() {
  const { t } = useI18n();
  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <h2 style={{ marginBottom: 10 }}>{t("mission.title")}</h2>
      <p className="page-sub" style={{ marginBottom: 16 }}>
        {t("mission.text")}
      </p>
      <a className="btn secondary small" href="./index.html">
        {t("mission.backToLanding")}
      </a>
    </div>
  );
}
