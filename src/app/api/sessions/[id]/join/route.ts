import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, surname, email, wishlist, hobbies } = body || {};

    const session = await prisma.session.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Exchange not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Submissions have ended' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!surname || typeof surname !== 'string' || !surname.trim()) {
      return NextResponse.json(
        { success: false, error: 'Last name is required' },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== 'string' ||
      !email.trim() ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate participant email in this session
    const existing = await prisma.participant.findFirst({
      where: {
        sessionId: id,
        email: normalizedEmail,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'This email is already registered in this Secret Santa exchange',
        },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.create({
      data: {
        sessionId: id,
        name: name.trim(),
        surname: surname.trim(),
        email: normalizedEmail,
        wishlist:
          typeof wishlist === 'string' && wishlist.trim() ? wishlist.trim() : null,
        hobbies:
          typeof hobbies === 'string' && hobbies.trim() ? hobbies.trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: participant.id,
        name: participant.name,
        surname: participant.surname,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join Secret Santa exchange' },
      { status: 500 }
    );
  }
}
