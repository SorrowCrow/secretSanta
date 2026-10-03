import type { Participant, Session } from '@prisma/client';

export interface PublicParticipant {
  id: string;
  name: string;
  surname: string;
  joinedAt: Date;
}

export interface PublicSession {
  id: string;
  title: string;
  budget: string | null;
  exchangeDate: string | null;
  status: string;
  isPasswordProtected: boolean;
  participantCount: number;
  participants: PublicParticipant[];
  createdAt: Date;
}

/**
 * Sanitizes a Participant record for public consumption.
 * Strictly strips sensitive details (email, wishlist, hobbies).
 */
export function sanitizeParticipant(
  participant: Pick<Participant, 'id' | 'name' | 'surname' | 'joinedAt'>
): PublicParticipant {
  return {
    id: participant.id,
    name: participant.name,
    surname: participant.surname,
    joinedAt: participant.joinedAt,
  };
}

/**
 * Sanitizes an array of Participant records.
 */
export function sanitizeParticipantList(
  participants: Pick<Participant, 'id' | 'name' | 'surname' | 'joinedAt'>[]
): PublicParticipant[] {
  return participants.map(sanitizeParticipant);
}

/**
 * Sanitizes a Session record for public views.
 * Never leaks passwordHash, adminKeyHash, or participant emails.
 */
export function sanitizeSession(
  session: Pick<
    Session,
    'id' | 'title' | 'budget' | 'exchangeDate' | 'status' | 'createdAt'
  > & {
    passwordHash?: string | null;
    participants?: Pick<Participant, 'id' | 'name' | 'surname' | 'joinedAt'>[];
  },
  participants?: Pick<Participant, 'id' | 'name' | 'surname' | 'joinedAt'>[]
): PublicSession {
  const roster = participants ?? session.participants ?? [];

  return {
    id: session.id,
    title: session.title,
    budget: session.budget,
    exchangeDate: session.exchangeDate,
    status: session.status,
    isPasswordProtected: Boolean(session.passwordHash),
    participantCount: roster.length,
    participants: roster.map(sanitizeParticipant),
    createdAt: session.createdAt,
  };
}
