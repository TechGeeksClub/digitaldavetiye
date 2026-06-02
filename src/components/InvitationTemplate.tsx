import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Music2,
  Navigation,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMedia } from "../api";
import { useCountdown } from "../hooks/useCountdown";
import type { Invitation, MediaUpload } from "../types";
import { createCalendarUrl, formatLongDate } from "../utils";
import MediaUploadSection from "./MediaUploadSection";
import RsvpForm from "./RsvpForm";

interface Props {
  invitation: Invitation;
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="count-box">
      <strong>{String(value).padStart(2, "0")}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function InvitationTemplate({ invitation }: Props) {
  const countdown = useCountdown(invitation.eventDate, invitation.eventTime);
  const [media, setMedia] = useState<MediaUpload[]>([]);
  const [musicOn, setMusicOn] = useState(false);

  const loadMedia = () => {
    fetchMedia(invitation.slug)
      .then(setMedia)
      .catch(() => setMedia([]));
  };

  useEffect(() => {
    loadMedia();
  }, [invitation.slug]);

  const eventTitle = `${invitation.couple.bride} & ${invitation.couple.groom}`;
  const calendarUrl = createCalendarUrl({
    title: `${eventTitle} Davetiyesi`,
    date: invitation.eventDate,
    time: invitation.eventTime,
    venueName: invitation.venue.name,
    address: invitation.venue.address,
    message: invitation.message
  });

  return (
    <div className="invite-page">
      <main className="invite-shell">
        <section className="hero-section">
          <div
            className="hero-bg"
            style={{ backgroundImage: `url("${invitation.heroImageUrl}")` }}
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <span className="hero-kicker">{invitation.headline}</span>
            <h1>
              {invitation.couple.bride}
              <span>&</span>
              {invitation.couple.groom}
            </h1>
            <p>{invitation.message}</p>
            <div className="hero-meta">
              <span>{formatLongDate(invitation.eventDate)}</span>
              <span>{invitation.eventTime}</span>
              <a href={invitation.venue.mapsUrl} target="_blank" rel="noreferrer">
                {invitation.venue.name}
              </a>
            </div>
          </div>
        </section>

        <section className="countdown-section">
          <span className="section-eyebrow">
            <Heart size={16} />
            Büyük güne kalan süre
          </span>
          {countdown.isPast ? (
            <p className="past-note">Etkinlik tarihi geldi.</p>
          ) : (
            <div className="count-grid">
              <CountBox value={countdown.days} label="Gün" />
              <CountBox value={countdown.hours} label="Saat" />
              <CountBox value={countdown.minutes} label="Dakika" />
              <CountBox value={countdown.seconds} label="Saniye" />
            </div>
          )}
        </section>

        <section className="content-section">
          <div className="section-title">
            <CalendarDays size={20} />
            <h2>Etkinlik Detayları</h2>
          </div>
          <div className="detail-card">
            <div>
              <CalendarDays size={19} />
              <span>{formatLongDate(invitation.eventDate)}</span>
            </div>
            <div>
              <Clock size={19} />
              <span>{invitation.eventTime}</span>
            </div>
            <a href={invitation.venue.mapsUrl} target="_blank" rel="noreferrer">
              <MapPin size={19} />
              <span>
                {invitation.venue.name}
                <small>{invitation.venue.address}</small>
              </span>
            </a>
          </div>
          <div className="button-row">
            <a className="gold-button" href={invitation.venue.mapsUrl} target="_blank" rel="noreferrer">
              <Navigation size={17} />
              Konuma Git
            </a>
            <a className="ghost-button" href={calendarUrl} target="_blank" rel="noreferrer">
              <CalendarDays size={17} />
              Takvime Ekle
            </a>
          </div>
        </section>

        <section className="content-section">
          <div className="section-title">
            <Sparkles size={20} />
            <h2>Etkinlikler</h2>
          </div>
          <div className="event-list">
            {invitation.events.map((event) => (
              <article className="event-card" key={`${event.title}-${event.date}`}>
                <span>{event.title}</span>
                <h3>{formatLongDate(event.date)} · {event.time}</h3>
                <dl>
                  <div>
                    <dt>Mekan</dt>
                    <dd>{event.venueName}</dd>
                  </div>
                  <div>
                    <dt>Adres</dt>
                    <dd>{event.address}</dd>
                  </div>
                  {event.dressCode ? (
                    <div>
                      <dt>Kıyafet</dt>
                      <dd>{event.dressCode}</dd>
                    </div>
                  ) : null}
                  {event.note ? (
                    <div>
                      <dt>Not</dt>
                      <dd>{event.note}</dd>
                    </div>
                  ) : null}
                </dl>
                <a href={event.mapsUrl} target="_blank" rel="noreferrer">
                  Konuma Git
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section gallery-section">
          <div className="section-title">
            <Camera size={20} />
            <h2>Görsel Galeri</h2>
          </div>
          <div className="gallery-grid">
            {invitation.gallery.map((image) => (
              <img src={image} alt="Düğün galerisi" key={image} />
            ))}
          </div>
          <div className="hashtag-card">
            <CheckCircle2 size={18} />
            <div>
              <strong>#{invitation.hashtag}</strong>
              <span>Sosyal medyada paylaştığın anıları bu etiketle bulalım.</span>
            </div>
          </div>
        </section>

        <section className="content-section travel-section">
          <h2>{invitation.travelGuide.title}</h2>
          {invitation.travelGuide.sections.map((section) => (
            <div className="travel-block" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {invitation.rsvpEnabled ? (
          <RsvpForm slug={invitation.slug} />
        ) : null}

        {invitation.mediaUploadEnabled ? (
          <MediaUploadSection slug={invitation.slug} media={media} onUploaded={loadMedia} />
        ) : null}

        <footer className="invite-footer">
          <span>Bu davetiye lokal MVP ile oluşturuldu.</span>
          <a href="/">Ana sayfaya dön</a>
        </footer>
      </main>

      <button
        className={`music-button ${musicOn ? "is-on" : ""}`}
        type="button"
        onClick={() => setMusicOn((value) => !value)}
        aria-label="Müzik durumunu değiştir"
      >
        <Music2 size={20} />
      </button>
    </div>
  );
}
