import type { Invitation, MediaUpload, RsvpPayload } from "./types";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "İstek tamamlanamadı.");
  }
  return payload as T;
}

export async function fetchInvitation(slug: string): Promise<Invitation> {
  const response = await fetch(`/api/invitations/${encodeURIComponent(slug)}`);
  const payload = await parseResponse<{ invitation: Invitation }>(response);
  return payload.invitation;
}

export async function submitRsvp(slug: string, rsvp: RsvpPayload) {
  const response = await fetch(`/api/invitations/${encodeURIComponent(slug)}/rsvps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rsvp)
  });
  return parseResponse(response);
}

export async function fetchMedia(slug: string): Promise<MediaUpload[]> {
  const response = await fetch(`/api/invitations/${encodeURIComponent(slug)}/media`);
  const payload = await parseResponse<{ media: MediaUpload[] }>(response);
  return payload.media;
}

export async function uploadMedia(slug: string, file: File): Promise<MediaUpload> {
  const formData = new FormData();
  formData.append("media", file);

  const response = await fetch(`/api/invitations/${encodeURIComponent(slug)}/media`, {
    method: "POST",
    body: formData
  });
  const payload = await parseResponse<{ media: MediaUpload }>(response);
  return payload.media;
}
