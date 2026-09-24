import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgIdParam =
      searchParams.get('org_id') ||
      request.headers.get('x-organization-id') ||
      'org_default';

    const baseWhere: any = {
      is_archived: false,
    };

    if (orgIdParam && orgIdParam !== 'all') {
      baseWhere.organization_id = orgIdParam;
    }

    const [total, open, inProgress, closed, urgent, archived] = await Promise.all([
      prisma.ticket.count({ where: baseWhere }),
      prisma.ticket.count({ where: { ...baseWhere, status: 'Open' } }),
      prisma.ticket.count({ where: { ...baseWhere, status: 'In Progress' } }),
      prisma.ticket.count({ where: { ...baseWhere, status: 'Closed' } }),
      prisma.ticket.count({
        where: { ...baseWhere, priority: 'Urgent', status: { not: 'Closed' } },
      }),
      prisma.ticket.count({
        where: {
          ...(orgIdParam && orgIdParam !== 'all' ? { organization_id: orgIdParam } : {}),
          is_archived: true,
        },
      }),
    ]);

    const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return NextResponse.json(
      {
        total,
        open,
        in_progress: inProgress,
        closed,
        urgent,
        archived,
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
