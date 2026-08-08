import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getImpactStats } from "../lib/impact";

export default function ImpactBanner() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getImpactStats().then(setStats).catch(() => {});
  }, []);

  if (!stats || !stats.bagsSaved) return null;

  return (
    <div className="impact-banner">
      <div className="item">
        <b>{stats.bagsSaved}</b>
        <span>{t("impact.bagsSaved")}</span>
      </div>
      <div className="item">
        <b>{stats.co2SavedKg} kg</b>
        <span>{t("impact.co2Saved")}</span>
      </div>
    </div>
  );
}
