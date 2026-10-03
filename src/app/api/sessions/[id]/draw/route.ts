import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { generateCyclicDerangement } from '@/lib/derangement';
import { generateSantaPoem, generateGiftIdeas } from '@/lib/ai';
import { sendSecretSantaMatchEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { adminKey } = body || {};

    if (!adminKey || typeof adminKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Admin key is required to trigger the draw' },
        { status: 401 }
      );
    }

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

    if (session.status === 'LOCKED') {
      return NextResponse.json(
        {
          success: false,
          error: 'The draw has already taken place for this exchange.',
        },
        { status: 400 }
      );
    }

    // Verify host admin key
    const isAuthorized = await verifyPassword(adminKey.trim(), session.adminKeyHash);
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin key. Only the exchange host can start the draw.',
        },
        { status: 401 }
      );
    }

    const participants = session.participants;
    if (!participants || participants.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least 2 participants must join before drawing Secret Santa matches!',
        },
        { status: 400 }
      );
    }

    // Generate fair, zero-self-match cyclic derangement
    const pairs = generateCyclicDerangement(participants);

    // Concurrently process poems, AI gifts, email dispatches, and match record persistence
    await Promise.all(
      pairs.map(async ({ giver, receiver }) => {
        const [festivePoem, giftIdeas] = await Promise.all([
          generateSantaPoem(giver.name, receiver.name),
          generateGiftIdeas(
            receiver.name,
            receiver.wishlist,
            receiver.hobbies,
            session.budget
          ),
        ]);

        const emailResult = await sendSecretSantaMatchEmail({
          giverEmail: giver.email,
          giverName: giver.name,
          receiverName: receiver.name,
          receiverSurname: receiver.surname,
          receiverWishlist: receiver.wishlist,
          receiverHobbies: receiver.hobbies,
          sessionTitle: session.title,
          budget: session.budget,
          exchangeDate: session.exchangeDate,
          festivePoem,
          giftIdeas,
        });

        const emailSentAt = emailResult.success ? new Date() : null;

        await prisma.match.create({
          data: {
            sessionId: session.id,
            giverId: giver.id,
            receiverId: receiver.id,
            festivePoem,
            giftIdeas: JSON.stringify(giftIdeas),
            emailSentAt,
          },
        });
      })
    );

    // Lock session to prevent any further changes or duplicate draws
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'LOCKED' },
    });

    return NextResponse.json({
      success: true,
      matchesDrawn: pairs.length,
      status: 'LOCKED',
      message: `Ho ho ho! Secret Santa draw completed! Dispatched ${pairs.length} festive matches.`,
    });
  } catch (error) {
    console.error('Error conducting Secret Santa draw:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete the Secret Santa draw' },
      { status: 500 }
    );
  }
}
