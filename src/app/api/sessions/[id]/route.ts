import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, getSessionUnlockToken } from '@/lib/auth';
import { sanitizeSession } from '@/lib/privacy';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Secret Santa exchange not found' },
        { status: 404 }
      );
    }

    // Check if session has password protection
    if (session.passwordHash) {
      const authCookie = req.cookies.get(`santa_auth_${id}`)?.value;
      const headerPassword = req.headers.get('x-session-password');
      const headerToken = req.headers.get('x-session-token');
      const queryPassword = req.nextUrl.searchParams.get('password');
      const queryToken = req.nextUrl.searchParams.get('token');

      const expectedToken = getSessionUnlockToken(id, session.passwordHash);

      let isUnlocked = false;

      // 1. Check token matches
      if (
        (authCookie && authCookie === expectedToken) ||
        (headerToken && headerToken === expectedToken) ||
        (queryToken && queryToken === expectedToken)
      ) {
        isUnlocked = true;
      }

      // 2. Check plain password verifications if not yet unlocked
      if (!isUnlocked && headerPassword) {
        isUnlocked = await verifyPassword(headerPassword, session.passwordHash);
      }
      if (!isUnlocked && queryPassword) {
        isUnlocked = await verifyPassword(queryPassword, session.passwordHash);
      }
      if (!isUnlocked && authCookie) {
        isUnlocked = await verifyPassword(authCookie, session.passwordHash);
      }

      if (!isUnlocked) {
        return NextResponse.json({
          success: true,
          isPasswordProtected: true,
          isUnlocked: false,
          id: session.id,
          title: session.title,
          status: session.status,
          budget: session.budget,
          exchangeDate: session.exchangeDate,
          createdAt: session.createdAt,
        });
      }
    }

    const sanitized = sanitizeSession(session, session.participants);

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      ...sanitized,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
