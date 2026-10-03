import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, getSessionUnlockToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { password } = body || {};

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id },
      select: { id: true, passwordHash: true },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.passwordHash) {
      return NextResponse.json({
        success: true,
        message: 'This session is not password protected',
      });
    }

    const isValid = await verifyPassword(password.trim(), session.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    const token = getSessionUnlockToken(session.id, session.passwordHash);

    const response = NextResponse.json({
      success: true,
      token,
      message: 'Exchange unlocked successfully',
    });

    // Set cookie on response for persistent access
    response.cookies.set(`santa_auth_${id}`, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error verifying session password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
