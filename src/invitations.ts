import seed from "../data/seed-invitations.json";
import type { Invitation } from "./types";

const invitations = seed.invitations as Invitation[];

export function getInvitation(slug: string): Invitation | null {
  return invitations.find((invitation) => invitation.slug === slug) ?? null;
}
