import { useI18n } from "../lib/i18n.jsx";
import { isRegistrationComplete } from "../lib/merchants";
import MerchantAuth from "./MerchantAuth.jsx";
import MerchantRegistrationForm from "./MerchantRegistrationForm.jsx";
import MerchantDashboard from "./MerchantDashboard.jsx";

export default function MerchantView({ user, merchant, onMerchantChanged, onOpenLegal }) {
  const { t } = useI18n();

  if (!user) return <MerchantAuth onOpenLegal={onOpenLegal} />;
  if (merchant === undefined) return null;

  return (
    <div>
      <h1 className="page-title">{t("merchant.title")}</h1>
      {isRegistrationComplete(merchant) ? (
        <MerchantDashboard user={user} merchant={merchant} onMerchantChanged={onMerchantChanged} />
      ) : (
        <MerchantRegistrationForm user={user} merchant={merchant} onDone={onMerchantChanged} />
      )}
    </div>
  );
}
