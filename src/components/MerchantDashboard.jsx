import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadMerchantBags, publishBag, uploadBagPhoto } from "../lib/bags";

const emptyForm = {
  title: "",
  category: "boulangerie",
  desc: "",
  price: 4,
  qty: 5,
  start: "",
  end: "",
};

export default function MerchantDashboard({ user }) {
  const { t } = useI18n();
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState(null);
  const [myBags, setMyBags] = useState([]);

  async function refreshMyBags() {
    setMyBags(await loadMerchantBags(user.id));
  }

  useEffect(() => {
    refreshMyBags();
  }, [user.id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePublish() {
    setMsg(null);
    if (!form.title || !form.start || !form.end) {
      setMsg({ type: "error", text: "Titre et créneau de retrait sont obligatoires." });
      return;
    }
    try {
      let image_url = null;
      if (photo) image_url = await uploadBagPhoto(user.id, photo);

      await publishBag({
        merchant_id: user.id,
        title: form.title.trim(),
        category: form.category,
        description: form.desc.trim(),
        price_cents: Math.round(parseFloat(form.price || "0") * 100),
        quantity_total: parseInt(form.qty || "1", 10),
        quantity_left: parseInt(form.qty || "1", 10),
        pickup_start: form.start,
        pickup_end: form.end,
        image_url,
      });
      setMsg({ type: "success", text: "Sachet publié !" });
      setForm(emptyForm);
      setPhoto(null);
      refreshMyBags();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  return (
    <>
      <div className="panel">
        <h2>{t("merchant.newBag")}</h2>
        <div className="two-col">
          <div className="field">
            <label>{t("merchant.f.title")}</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Panier boulangerie du soir" />
          </div>
          <div className="field">
            <label>{t("merchant.f.category")}</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="boulangerie">Boulangerie</option>
              <option value="restaurant">Restaurant</option>
              <option value="epicerie">Épicerie</option>
              <option value="traiteur">Traiteur / cantine</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>{t("merchant.f.desc")}</label>
          <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Ce que contient le sachet, en général" />
        </div>
        <div className="two-col">
          <div className="field">
            <label>{t("merchant.f.price")}</label>
            <input type="number" min="1" step="0.5" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("merchant.f.qty")}</label>
            <input type="number" min="1" step="1" value={form.qty} onChange={(e) => set("qty", e.target.value)} />
          </div>
        </div>
        <div className="two-col">
          <div className="field">
            <label>{t("merchant.f.start")}</label>
            <input type="datetime-local" value={form.start} onChange={(e) => set("start", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("merchant.f.end")}</label>
            <input type="datetime-local" value={form.end} onChange={(e) => set("end", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t("merchant.f.photo")}</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0] || null)} />
        </div>
        <button className="btn" onClick={handlePublish}>
          {t("merchant.publish")}
        </button>
        {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
      </div>

      <div className="panel">
        <h2>{t("merchant.mine")}</h2>
        {!myBags.length ? (
          <span className="page-sub">{t("merchant.none")}</span>
        ) : (
          myBags.map((b) => (
            <div className="my-bag" key={b.id}>
              <div className="info">
                <b>{b.title}</b>
                <span>
                  {b.quantity_left}/{b.quantity_total} {t("left")} · {(b.price_cents / 100).toFixed(2)} € · {b.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
