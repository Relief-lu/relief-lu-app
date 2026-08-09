import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getMerchantOrNull, isRegistrationComplete } from "../lib/merchants";
import MerchantAuth from "./MerchantAuth.jsx";
import MerchantRegistrationForm from "./MerchantRegistrationForm.jsx";
import MerchantDashboard from "./MerchantDashboard.jsx";

export default function MerchantView({ user, onOpenLegal }) {
  const { t } = useI18n();
  const [merchant, setMerchant] = useState(undefined); // undefined = loading, null = pas encore inscrit

  async function refreshMerchant() {
    setMerchant(await getMerchantOrNull(user.id));
  }

  useEffect(() => {
    if (!user) return;
    refreshMerchant();
  }, [user]);

  if (!user) return <MerchantAuth onOpenLegal={onOpenLegal} />;
  if (merchant === undefined) return null;

  return (
    <div>
      <h1 className="page-title">{t("merchant.title")}</h1>
      {isRegistrationComplete(merchant) ? (
        <MerchantDashboard user={user} />
      ) : (
        <MerchantRegistrationForm user={user} merchant={merchant} onDone={refreshMerchant} />
      )}
    </div>
  );
}
