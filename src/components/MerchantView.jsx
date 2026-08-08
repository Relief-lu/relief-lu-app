import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getCurrentUser, onAuthChange } from "../lib/auth";
import { ensureMerchantRow } from "../lib/merchants";
import MerchantAuth from "./MerchantAuth.jsx";
import MerchantDashboard from "./MerchantDashboard.jsx";

export default function MerchantView() {
  const { t } = useI18n();
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    async function check() {
      const u = await getCurrentUser();
      if (u) await ensureMerchantRow(u);
      setUser(u);
    }
    check();
    const {
      data: { subscription },
    } = onAuthChange(check);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <h1 className="page-title">{t("merchant.title")}</h1>
      {user === undefined ? null : user ? <MerchantDashboard user={user} /> : <MerchantAuth />}
    </div>
  );
}
