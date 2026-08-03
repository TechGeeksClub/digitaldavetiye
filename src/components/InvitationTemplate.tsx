import {
  BedDouble,
  CalendarDays,
  Clock,
  Heart,
  MapPin,
  Music2,
  Navigation,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useCountdown } from "../hooks/useCountdown";
import type { Invitation } from "../types";
import { createCalendarUrl, formatLongDate } from "../utils";
import MediaUploadSection from "./MediaUploadSection";

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
  const [musicOn, setMusicOn] = useState(false);

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
        <section
          className={`hero-section ${invitation.heroChildhoodImageUrl ? "has-timeline" : ""}`}
        >
          <div className="hero-media" aria-hidden="true">
            <img
              className={`hero-photo hero-photo-current ${
                invitation.heroChildhoodImageUrl ? "is-animated" : ""
              }`}
              src={invitation.heroImageUrl}
              alt=""
            />
            {invitation.heroChildhoodImageUrl ? (
              <img
                className="hero-photo hero-photo-childhood"
                src={invitation.heroChildhoodImageUrl}
                alt=""
              />
            ) : null}
          </div>
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
          {invitation.schedule?.length ? (
            <div className="schedule-card">
              <h3>Günün Programı</h3>
              <ol>
                {invitation.schedule.map((item) => (
                  <li key={`${item.time}-${item.title}`}>
                    <time>{item.time}</time>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
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

        {invitation.accommodations?.length ? (
          <section className="content-section accommodation-section">
            <div className="section-title">
              <BedDouble size={20} />
              <h2>Konaklayabileceğiniz Konumlar</h2>
            </div>
            <div className="accommodation-list">
              {invitation.accommodations.map((accommodation) => (
                <div className="accommodation-row" key={accommodation.name}>
                  <strong>{accommodation.name}</strong>
                  <a
                    className="location-icon-link"
                    href={accommodation.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${accommodation.name} konumunu aç`}
                    title={`${accommodation.name} konumunu aç`}
                  >
                    <Navigation size={19} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        ) : null}

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

        {invitation.mediaUploadEnabled ? (
          <MediaUploadSection uploadUrl={invitation.mediaUploadUrl} />
        ) : null}

        <footer className="invite-footer">
          <span>Duygu & Safa · 15 Ağustos 2026</span>
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
