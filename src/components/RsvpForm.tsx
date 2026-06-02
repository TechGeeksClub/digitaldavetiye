import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, HelpCircle, Send, Users, XCircle } from "lucide-react";
import { submitRsvp } from "../api";
import type { RsvpPayload, RsvpStatus } from "../types";

const statuses: Array<{
  value: RsvpStatus;
  label: string;
  icon: typeof CheckCircle2;
}> = [
  { value: "yes", label: "Evet, Geliyorum", icon: CheckCircle2 },
  { value: "no", label: "Maalesef Gelemiyorum", icon: XCircle },
  { value: "maybe", label: "Henüz Bilmiyorum", icon: HelpCircle }
];

export default function RsvpForm({ slug }: { slug: string }) {
  const [form, setForm] = useState<RsvpPayload>({
    name: "",
    guestCount: 1,
    status: "yes",
    note: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => form.name.trim().length >= 2 && !submitting, [form.name, submitting]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await submitRsvp(slug, form);
      setMessage("Katılım bildiriminiz kaydedildi.");
      setForm({ name: "", guestCount: 1, status: "yes", note: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Katılım bildirimi kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="content-section form-section">
      <div className="section-title">
        <Users size={20} />
        <h2>Katılım Bildirimi</h2>
      </div>
      <form onSubmit={submit} className="rsvp-form">
        <label>
          <span>Ad Soyad *</span>
          <input
            value={form.name}
            onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
            placeholder="Adınız Soyadınız"
            autoComplete="name"
          />
        </label>
        <label>
          <span>Kaç kişi geliyorsunuz?</span>
          <input
            type="number"
            min={1}
            max={20}
            value={form.guestCount}
            onChange={(event) =>
              setForm((value) => ({ ...value, guestCount: Number(event.target.value) }))
            }
          />
        </label>
        <div className="status-group" aria-label="Gelecek misiniz?">
          {statuses.map((status) => {
            const Icon = status.icon;
            return (
              <button
                type="button"
                className={form.status === status.value ? "selected" : ""}
                key={status.value}
                onClick={() => setForm((value) => ({ ...value, status: status.value }))}
              >
                <Icon size={17} />
                {status.label}
              </button>
            );
          })}
        </div>
        <label>
          <span>Not ekleyin</span>
          <textarea
            value={form.note}
            onChange={(event) => setForm((value) => ({ ...value, note: event.target.value }))}
            placeholder="Mesajınız..."
            rows={4}
          />
        </label>
        {message ? <p className="success-message">{message}</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <button className="submit-button" type="submit" disabled={!canSubmit}>
          <Send size={17} />
          {submitting ? "Gönderiliyor..." : "Bildirimi Gönder"}
        </button>
      </form>
    </section>
  );
}
