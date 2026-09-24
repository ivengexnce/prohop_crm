import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search')?.trim();
    const archivedParam = searchParams.get('archived');
    const orgIdParam =
      searchParams.get('org_id') ||
      request.headers.get('x-organization-id') ||
      'org_default';

    const where: any = {};

    if (orgIdParam && orgIdParam !== 'all') {
      where.organization_id = orgIdParam;
    }

    if (archivedParam === 'true') {
      where.is_archived = true;
    } else if (archivedParam !== 'all') {
      where.is_archived = false;
    }

    if (statusParam && statusParam.toLowerCase() !== 'all') {
      where.status = { equals: statusParam };
    }
    if (searchParam) {
      where.OR = [
        { customer_name: { contains: searchParam } },
        { customer_email: { contains: searchParam } },
        { ticket_id: { contains: searchParam } },
        { subject: { contains: searchParam } },
        { description: { contains: searchParam } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { notes: true } },
      },
    });

    const headers = [
      'Ticket ID',
      'Organization ID',
      'Customer Name',
      'Customer Email',
      'Subject',
      'Status',
      'Priority',
      'Category',
      'Is Archived',
      'Notes Count',
      'Created At',
      'Updated At',
      'Description',
    ];

    const escapeCsv = (str: string | number | boolean | undefined | null) => {
      if (str === null || str === undefined) return '""';
      let val = String(str);
      // Neutralize CSV formula injection (DDE attacks)
      if (/^[=+\-@\t\r]/.test(val)) {
        val = `'${val}`;
      }
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = tickets.map((t) =>
      [
        escapeCsv(t.ticket_id),
        escapeCsv(t.organization_id),
        escapeCsv(t.customer_name),
        escapeCsv(t.customer_email),
        escapeCsv(t.subject),
        escapeCsv(t.status),
        escapeCsv(t.priority),
        escapeCsv(t.category),
        escapeCsv(t.is_archived),
        escapeCsv(t._count.notes),
        escapeCsv(t.created_at.toISOString()),
        escapeCsv(t.updated_at.toISOString()),
        escapeCsv(t.description),
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const timestamp = new Date().toISOString().split('T')[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="prohop_tickets_export_${timestamp}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { error: 'Failed to export tickets', details: error.message },
      { status: 500 }
    );
  }
}
