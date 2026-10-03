import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id: sessionId, participantId } = await params;

    // Retrieve adminKey from header or JSON body
    let adminKey = req.headers.get('x-admin-key');
    if (!adminKey) {
      const body = await req.json().catch(() => ({}));
      adminKey = body?.adminKey;
    }

    if (!adminKey || typeof adminKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Admin key is required to remove participants' },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Secret Santa exchange not found' },
        { status: 404 }
      );
    }

    if (session.status === 'LOCKED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Submissions have ended. Cannot remove participants from a locked exchange.',
        },
        { status: 400 }
      );
    }

    // Verify host admin authorization
    const isAuthorized = await verifyPassword(adminKey.trim(), session.adminKeyHash);
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin key. Only the host can remove participants.',
        },
        { status: 401 }
      );
    }

    // Verify participant belongs to this session
    const participant = await prisma.participant.findFirst({
      where: {
        id: participantId,
        sessionId,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found in this exchange' },
        { status: 404 }
      );
    }

    // Delete participant
    await prisma.participant.delete({
      where: { id: participantId },
    });

    return NextResponse.json({
      success: true,
      message: 'Participant removed successfully',
      participantId,
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
}
