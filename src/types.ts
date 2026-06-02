export type RsvpStatus = "yes" | "no" | "maybe";

export interface Invitation {
  slug: string;
  templateId: string;
  headline: string;
  message: string;
  couple: {
    bride: string;
    groom: string;
  };
  eventDate: string;
  eventTime: string;
  venue: {
    name: string;
    address: string;
    mapsUrl: string;
  };
  heroImageUrl: string;
  hashtag: string;
  rsvpEnabled: boolean;
  rsvpFormUrl?: string;
  mediaUploadEnabled: boolean;
  mediaUploadUrl?: string;
  gallery: string[];
  events: InvitationEvent[];
  travelGuide: {
    title: string;
    sections: Array<{
      title: string;
      items: string[];
    }>;
  };
}

export interface InvitationEvent {
  title: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  dressCode?: string;
  note?: string;
  mapsUrl: string;
}

export interface MediaUpload {
  id: number;
  originalName: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
  createdAt?: string;
}

export interface RsvpPayload {
  name: string;
  guestCount: number;
  status: RsvpStatus;
  note: string;
}
