import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [total, open, inProgress, closed, urgent] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'Open' } }),
      prisma.ticket.count({ where: { status: 'In Progress' } }),
      prisma.ticket.count({ where: { status: 'Closed' } }),
      prisma.ticket.count({ where: { priority: 'Urgent', status: { not: 'Closed' } } }),
    ]);

    const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return NextResponse.json(
      {
        total,
        open,
        in_progress: inProgress,
        closed,
        urgent,
        resolution_rate: resolutionRate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching ticket statistics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve stats', details: error.message },
      { status: 500 }
    );
  }
}
