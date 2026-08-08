import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getMerchantStats } from "../lib/merchantStats";

export default function MerchantStats({ merchantId, refreshKey }) {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getMerchantStats(merchantId).then(setStats);
  }, [merchantId, refreshKey]);

  if (!stats) return null;

  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-value">{stats.bagsPublished}</div>
        <div className="stat-label">{t("stats.bagsPublished")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.totalReservations}</div>
        <div className="stat-label">{t("stats.totalReservations")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.noShowRate}%</div>
        <div className="stat-label">{t("stats.noShowRate")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.estimatedRevenue.toFixed(2)} €</div>
        <div className="stat-label">{t("stats.estimatedRevenue")}</div>
      </div>
    </div>
  );
}
