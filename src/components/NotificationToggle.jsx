import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { isPushSupported, getCurrentSubscription, subscribeToPush, unsubscribeFromPush } from "../lib/push";

export default function NotificationToggle({ user }) {
  const { t } = useI18n();
  const [subscribed, setSubscribed] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!isPushSupported()) return;
    getCurrentSubscription().then((sub) => setSubscribed(!!sub));
  }, []);

  if (!user || !isPushSupported()) return null;

  async function handleToggle() {
    setMsg(null);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        await subscribeToPush(user.id);
        setSubscribed(true);
      }
    } catch {
      setMsg(t("push.error"));
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <button className="btn secondary small" onClick={handleToggle}>
        {subscribed ? t("push.disable") : t("push.enable")}
      </button>
      {msg && <p className="error-msg">{msg}</p>}
    </div>
  );
}
