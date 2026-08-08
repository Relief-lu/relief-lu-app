import { useEffect } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { ensureMerchantRow } from "../lib/merchants";
import MerchantAuth from "./MerchantAuth.jsx";
import MerchantDashboard from "./MerchantDashboard.jsx";

export default function MerchantView({ user }) {
  const { t } = useI18n();

  useEffect(() => {
    if (user) ensureMerchantRow(user);
  }, [user]);

  return (
    <div>
      <h1 className="page-title">{t("merchant.title")}</h1>
      {user ? <MerchantDashboard user={user} /> : <MerchantAuth />}
    </div>
  );
}
