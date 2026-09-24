import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNextTicketId } from '@/lib/ticket-id';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { eventHub } from '@/lib/events';
import { dispatchNotification } from '@/lib/notifications';

// GET /api/tickets?status=Open&search=john&priority=High&category=Billing&page=1&limit=20&archived=false
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search')?.trim();
    const priorityParam = searchParams.get('priority');
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort') || 'newest';
    const archivedParam = searchParams.get('archived'); // 'true' | 'all' | default 'false'
    const orgIdParam =
      searchParams.get('org_id') ||
      request.headers.get('x-organization-id') ||
      'org_default';

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const shouldPaginate = pageParam !== null || limitParam !== null;

    const where: any = {};

    // Multi-tenant organization scoping (unless 'all' specified for superadmin)
    if (orgIdParam && orgIdParam !== 'all') {
      where.organization_id = orgIdParam;
    }

    // Soft-delete data archival scoping: exclude archived tickets by default
    if (archivedParam === 'true') {
      where.is_archived = true;
    } else if (archivedParam !== 'all') {
      where.is_archived = false;
    }

    // Filter by status (unless 'all' or empty)
    if (statusParam && statusParam.toLowerCase() !== 'all') {
      where.status = {
        equals: statusParam,
      };
    }

    // Filter by priority
    if (priorityParam && priorityParam.toLowerCase() !== 'all') {
      where.priority = {
        equals: priorityParam,
      };
    }

    // Filter by category
    if (categoryParam && categoryParam.toLowerCase() !== 'all') {
      where.category = {
        equals: categoryParam,
      };
    }

    // Dynamic search across Customer Name, Ticket ID, Customer Email, Issue Description, Subject
    if (searchParam) {
      where.OR = [
        { customer_name: { contains: searchParam } },
        { customer_email: { contains: searchParam } },
        { ticket_id: { contains: searchParam } },
        { subject: { contains: searchParam } },
        { description: { contains: searchParam } },
      ];
    }

    // Order by
    let orderBy: any = { created_at: 'desc' };
    if (sortParam === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sortParam === 'priority') {
      orderBy = { priority: 'desc' };
    }

    const total = await prisma.ticket.count({ where });

    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '20', 10)));
    const skip = (page - 1) * limit;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy,
      skip: shouldPaginate ? skip : undefined,
      take: shouldPaginate ? limit : undefined,
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    // Format response compliant with spec + rich helper fields
    const formatted = tickets.map((t) => ({
      ticket_id: t.ticket_id,
      organization_id: t.organization_id,
      customer_name: t.customer_name,
      customer_email: t.customer_email,
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      category: t.category,
      attachment_url: t.attachment_url,
      attachment_name: t.attachment_name,
      is_archived: t.is_archived,
      deleted_at: t.deleted_at ? t.deleted_at.toISOString() : null,
      created_at: t.created_at.toISOString(),
      updated_at: t.updated_at.toISOString(),
      notes_count: t._count.notes,
    }));

    if (shouldPaginate) {
      return NextResponse.json(
        {
          data: formatted,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
          },
        },
        { status: 200 }
      );
    }

    // Backwards-compatible array response with total count header
    return NextResponse.json(formatted, {
      status: 200,
      headers: {
        'X-Total-Count': String(total),
      },
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tickets', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/tickets
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`ticket_create_${clientIp}`, 100, 60);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Submission rate limit exceeded. Please wait ${rateCheck.resetInSeconds} seconds before creating another ticket.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetInSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const {
      customer_name,
      customer_email,
      subject,
      description,
      priority = 'Medium',
      category = 'General',
      attachment_url = null,
      attachment_name = null,
      organization_id = request.headers.get('x-organization-id') || 'org_default',
    } = body;

    // Strict Validation: ensure string type and non-whitespace content
    if (
      !customer_name || typeof customer_name !== 'string' || !customer_name.trim() ||
      !customer_email || typeof customer_email !== 'string' || !customer_email.trim() ||
      !subject || typeof subject !== 'string' || !subject.trim() ||
      !description || typeof description !== 'string' || !description.trim()
    ) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message:
            'customer_name, customer_email, subject, and description are all required non-empty fields.',
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Please provide a valid email address.',
        },
        { status: 400 }
      );
    }

    // Auto-generate monotonic, collision-free Ticket ID via atomic Sequence transaction
    const ticket_id = await getNextTicketId();
    const newTicket = await prisma.ticket.create({
      data: {
        ticket_id,
        organization_id: (organization_id || 'org_default').trim(),
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        subject: subject.trim(),
        description: description.trim(),
        status: 'Open',
        priority: priority || 'Medium',
        category: category || 'General',
        attachment_url: attachment_url || null,
        attachment_name: attachment_name || null,
      },
    });

    // Real-Time Event Notification (SSE stream to connected browser agents)
    eventHub.emitTicketEvent('ticket.created', {
      ticket_id: newTicket.ticket_id,
      customer_name: newTicket.customer_name,
      subject: newTicket.subject,
      priority: newTicket.priority,
      status: newTicket.status,
      created_at: newTicket.created_at.toISOString(),
    });

    // Outbound Webhook Dispatch (non-blocking)
    dispatchNotification({
      event: 'ticket.created',
      ticket_id: newTicket.ticket_id,
      customer_name: newTicket.customer_name,
      subject: newTicket.subject,
      priority: newTicket.priority,
      status: newTicket.status,
      timestamp: newTicket.created_at.toISOString(),
    });

    // Return exact response format specified in prompt:
    // { "ticket_id": "TKT-001", "created_at": "2026-09-23T10:30:00" }
    return NextResponse.json(
      {
        ticket_id: newTicket.ticket_id,
        created_at: newTicket.created_at.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket', details: error.message },
      { status: 500 }
    );
  }
}
