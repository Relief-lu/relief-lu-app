const CONTACT = "relief-lu@outlook.com";

const CONTENT = {
  mentions: {
    title: "Mentions légales",
    paragraphs: [
      "Éditeur : Relief.lu — projet indépendant basé au Luxembourg, en cours de constitution en société.",
      `Contact : ${CONTACT}`,
      "Numéro d'entreprise : en cours d'enregistrement — ces mentions seront complétées dès son obtention.",
      "Hébergement du site : GitHub, Inc. (GitHub Pages).",
      "Base de données, authentification et stockage : Supabase, Inc.",
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    paragraphs: [
      "Cette politique explique quelles données Relief.lu collecte, pourquoi, et comment les faire corriger ou supprimer.",
      { heading: "1. Responsable du traitement", text: `Relief.lu, contact : ${CONTACT}.` },
      {
        heading: "2. Données collectées",
        text: "Email (liste d'attente, compte utilisateur), contenu de vos réservations (sachet, quantité, code de retrait), vos favoris, les avis que vous laissez. Pour les commerçants : nom du commerce, position approximative sur la carte, photos des sachets publiés. Si vous activez les notifications, un identifiant technique d'abonnement push est stocké (aucune information personnelle supplémentaire).",
      },
      {
        heading: "3. Pourquoi ces données",
        text: "Uniquement pour faire fonctionner Relief.lu : créer votre compte, afficher et gérer vos réservations, vos favoris, vos avis, et vous notifier des nouveaux sachets chez les commerçants suivis.",
      },
      {
        heading: "4. Avec qui elles sont partagées",
        text: "Avec les prestataires techniques nécessaires au fonctionnement du service : Supabase (base de données, authentification, stockage des photos), et les services de notification push de votre navigateur (Google, Mozilla ou Apple selon le cas) pour l'acheminement technique des notifications. Aucune donnée n'est vendue ni utilisée à des fins publicitaires.",
      },
      { heading: "5. Durée de conservation", text: "Vos données sont conservées tant que votre compte est actif. Vous pouvez en demander la suppression à tout moment." },
      { heading: "6. Vos droits", text: `Vous pouvez demander l'accès, la correction, la suppression ou l'export de vos données à tout moment en écrivant à ${CONTACT}.` },
      {
        heading: "7. Sécurité",
        text: "L'accès aux données est protégé par des règles techniques (chaque utilisateur ne peut voir/modifier que ses propres réservations, favoris et sachets) et le site est servi en HTTPS.",
      },
    ],
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    paragraphs: [
      "Ce document encadre l'utilisation de Relief.lu. Il s'agit d'un texte rédigé pour ce type de plateforme, à faire valider par un professionnel du droit avant une exploitation à grande échelle.",
      {
        heading: "1. Objet",
        text: "Relief.lu met en relation des commerçants (boulangeries, restaurants, épiceries, traiteurs...) proposant des invendus alimentaires à prix réduit, et des utilisateurs souhaitant les réserver et les récupérer sur place. Relief.lu n'est ni producteur, ni vendeur, ni acheteur des produits proposés : la plateforme fournit uniquement les outils de mise en relation et de réservation.",
      },
      { heading: "2. Inscription", text: "L'inscription se fait par email, sans mot de passe (lien de connexion). Chaque utilisateur garantit l'exactitude des informations fournies et est responsable de l'utilisation de son compte." },
      {
        heading: "3. Sachets et réservations",
        text: "Le commerçant est seul responsable du contenu de ses annonces (description, quantité, prix, créneau de retrait) et garantit être en droit de vendre les denrées proposées, dans le respect de la réglementation applicable en matière d'hygiène et de sécurité alimentaire. L'utilisateur s'engage à récupérer sa réservation dans le créneau indiqué ; en cas de non-retrait répété, Relief.lu se réserve le droit de suspendre le compte concerné.",
      },
      {
        heading: "4. Prix et paiement",
        text: "Le prix affiché est fixé librement par le commerçant. À ce stade, Relief.lu ne traite aucun paiement : celui-ci s'effectue directement entre l'utilisateur et le commerçant, sur place, au moment du retrait.",
      },
      {
        heading: "5. Responsabilité",
        text: "Relief.lu agit en tant qu'intermédiaire technique et n'est pas partie à la transaction conclue entre le commerçant et l'utilisateur. Relief.lu ne garantit pas la qualité, la fraîcheur ou l'innocuité des produits proposés — cette responsabilité incombe exclusivement au commerçant, seul habilité à vendre des denrées alimentaires conformément à la réglementation en vigueur.",
      },
      { heading: "6. Compte et résiliation", text: "Tout utilisateur peut cesser d'utiliser Relief.lu à tout moment en nous contactant. Relief.lu se réserve le droit de suspendre ou supprimer un compte en cas d'usage abusif, frauduleux ou contraire aux présentes conditions." },
      { heading: "7. Modification des CGU", text: "Relief.lu peut modifier les présentes conditions à tout moment ; les utilisateurs seront informés des changements significatifs." },
      { heading: "8. Droit applicable", text: "Les présentes conditions sont soumises au droit luxembourgeois. Tout litige relatif à l'utilisation de la plateforme relève des tribunaux compétents du Grand-Duché de Luxembourg, sauf disposition légale impérative contraire." },
      { heading: "9. Contact", text: `Pour toute question : ${CONTACT}.` },
    ],
  },
  cookies: {
    title: "Cookies",
    paragraphs: [
      "Ce site utilise uniquement des cookies et espaces de stockage techniques, nécessaires à son fonctionnement (garder votre connexion, mémoriser votre langue, votre position pour trier par distance).",
      "Aucun cookie de mesure d'audience ou de publicité n'est utilisé.",
      "En continuant à naviguer sur Relief.lu, vous acceptez cette utilisation strictement technique.",
    ],
  },
};

export default function LegalModal({ type, onClose }) {
  const content = CONTENT[type];
  if (!content) return null;

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: "80vh", overflowY: "auto" }}>
        <button className="close" onClick={onClose}>
          ✕
        </button>
        <h2>{content.title}</h2>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {content.paragraphs.map((p, i) =>
            typeof p === "string" ? (
              <p key={i} className="desc">
                {p}
              </p>
            ) : (
              <div key={i} style={{ marginTop: 14 }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{p.heading}</p>
                {p.text && <p className="desc">{p.text}</p>}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
