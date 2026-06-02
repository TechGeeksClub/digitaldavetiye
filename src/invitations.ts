import seed from "../data/seed-invitations.json";
import type { Invitation } from "./types";

const invitations = seed.invitations as Invitation[];
const legacySlugs: Record<string, string> = {
  "ayse-mehmet": "safa-duygu"
};

export function getInvitation(slug: string): Invitation | null {
  const canonicalSlug = legacySlugs[slug] ?? slug;
  return invitations.find((invitation) => invitation.slug === canonicalSlug) ?? null;
}
