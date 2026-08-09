import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { sendMagicLink, getErrorMessage } from "../lib/auth";

// Formulaire de connexion par magic link, réutilisé partout où un compte
// consommateur est requis (réservation, historique, favoris).
export default function AuthPrompt({ title, description, view }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);

  async function handleSend() {
    try {
      await sendMagicLink(email.trim(), view);
      setMsg({ type: "success", text: t("account.linkSent") });
    } catch (err) {
      setMsg({ type: "error", text: getErrorMessage(err) });
    }
  }

  return (
    <div>
      <h2>{title || t("account.loginTitle")}</h2>
      <p className="desc">{description || t("account.loginDesc")}</p>
      <div className="field">
        <label>{t("account.emailLabel")}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.lu" />
      </div>
      <button className="btn" onClick={handleSend}>
        {t("account.sendLink")}
      </button>
      {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
    </div>
  );
}
