import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateAdminKey } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, budget, exchangeDate, password, adminKey } = body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Exchange title is required' },
        { status: 400 }
      );
    }

    const plainAdminKey =
      typeof adminKey === 'string' && adminKey.trim().length >= 4
        ? adminKey.trim()
        : generateAdminKey();

    const adminKeyHash = await hashPassword(plainAdminKey);

    let passwordHash: string | null = null;
    if (typeof password === 'string' && password.trim().length > 0) {
      passwordHash = await hashPassword(password.trim());
    }

    const session = await prisma.session.create({
      data: {
        title: title.trim(),
        budget: typeof budget === 'string' && budget.trim() ? budget.trim() : null,
        exchangeDate:
          typeof exchangeDate === 'string' && exchangeDate.trim()
            ? exchangeDate.trim()
            : null,
        passwordHash,
        adminKeyHash,
        status: 'OPEN',
      },
    });

    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.id,
          title: session.title,
        },
        adminKey: plainAdminKey,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Secret Santa session' },
      { status: 500 }
    );
  }
}
