import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Link2, QrCode } from "lucide-react";
import { fetchInvitation } from "./api";
import InvitationTemplate from "./components/InvitationTemplate";
import type { Invitation } from "./types";

const defaultSlug = "ayse-mehmet";

function getPathParts() {
  return window.location.pathname.split("/").filter(Boolean);
}

function buildPublicUrl(slug: string) {
  return `${window.location.origin}/d/${slug}`;
}

function HomePage() {
  const inviteUrl = buildPublicUrl(defaultSlug);

  return (
    <main className="landing-page">
      <section className="landing-panel">
        <span className="eyebrow">Lokal Davetiye MVP</span>
        <h1>Ayşe & Mehmet davetiyesi hazır.</h1>
        <p>
          QR kod veya link davetiyeyi doğrudan açar. Katılım bildirimi ve medya
          yükleme lokal backend'e kaydedilir.
        </p>
        <div className="qr-card">
          <QRCodeSVG value={inviteUrl} size={176} level="H" includeMargin />
        </div>
        <div className="landing-actions">
          <a className="primary-link" href={`/d/${defaultSlug}`}>
            <Link2 size={18} />
            Davetiyeyi aç
          </a>
          <a className="secondary-link" href={`/qr/${defaultSlug}`}>
            <QrCode size={18} />
            QR ekranı
          </a>
        </div>
        <code>{inviteUrl}</code>
      </section>
    </main>
  );
}

function QrPage({ slug }: { slug: string }) {
  const inviteUrl = buildPublicUrl(slug);

  return (
    <main className="landing-page">
      <section className="landing-panel">
        <span className="eyebrow">QR Davetiye Linki</span>
        <h1>QR kodu okutunca davetiye açılır.</h1>
        <div className="qr-card qr-card-large">
          <QRCodeSVG value={inviteUrl} size={240} level="H" includeMargin />
        </div>
        <a className="primary-link" href={`/d/${slug}`}>
          Davetiyeye git
          <ArrowRight size={18} />
        </a>
        <code>{inviteUrl}</code>
      </section>
    </main>
  );
}

function InvitationPage({ slug }: { slug: string }) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    fetchInvitation(slug)
      .then((data) => {
        if (!ignore) {
          setInvitation(data);
          document.title = `${data.couple.bride} & ${data.couple.groom} Davetiyesi`;
        }
      })
      .catch((err: Error) => {
        if (!ignore) {
          setError(err.message);
        }
      });
    return () => {
      ignore = true;
    };
  }, [slug]);

  if (error) {
    return (
      <main className="landing-page">
        <section className="landing-panel">
          <span className="eyebrow">Davetiye bulunamadı</span>
          <h1>{error}</h1>
          <a className="primary-link" href="/">
            Ana sayfaya dön
          </a>
        </section>
      </main>
    );
  }

  if (!invitation) {
    return (
      <main className="loading-page">
        <span>Davetiye yükleniyor...</span>
      </main>
    );
  }

  return <InvitationTemplate invitation={invitation} />;
}

export default function App() {
  const parts = useMemo(() => getPathParts(), []);
  const [route, slug] = parts;

  if (route === "d" && slug) {
    return <InvitationPage slug={decodeURIComponent(slug)} />;
  }

  if (route === "qr" && slug) {
    return <QrPage slug={decodeURIComponent(slug)} />;
  }

  return <HomePage />;
}
