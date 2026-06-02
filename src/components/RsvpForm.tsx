import { ExternalLink, Users } from "lucide-react";

export default function RsvpForm({ formUrl }: { formUrl?: string }) {
  const hasFormUrl = Boolean(formUrl);

  return (
    <section className="content-section form-section">
      <div className="section-title">
        <Users size={20} />
        <h2>Katılım Bildirimi</h2>
      </div>
      <p className="section-copy">
        Davete katılım durumunuzu kısa form üzerinden iletebilirsiniz.
      </p>
      {hasFormUrl ? (
        <a className="submit-button external-button" href={formUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={17} />
          Katılım Formunu Aç
        </a>
      ) : (
        <button className="submit-button" type="button" disabled>
          <ExternalLink size={17} />
          Form Linki Hazırlanıyor
        </button>
      )}
    </section>
  );
}
