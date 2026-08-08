import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { sendMagicLink } from "../lib/auth";

export default function MerchantAuth() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);

  async function handleSend() {
    try {
      await sendMagicLink(email.trim());
      setMsg({ type: "success", text: "Lien envoyé — vérifie ta boîte mail." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  return (
    <div className="panel">
      <h2>{t("merchant.loginTitle")}</h2>
      <p className="page-sub">{t("merchant.loginDesc")}</p>
      <div className="field">
        <label>{t("merchant.emailLabel")}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@commerce.lu" />
      </div>
      <button className="btn" onClick={handleSend}>
        {t("merchant.sendLink")}
      </button>
      {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
    </div>
  );
}
