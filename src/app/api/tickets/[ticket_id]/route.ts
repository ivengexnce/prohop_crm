import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tickets/[ticket_id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await context.params;

    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id },
      include: {
        notes: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Not Found', message: `Ticket with ID ${ticket_id} was not found.` },
        { status: 404 }
      );
    }

    // Exact structure specified in prompt + rich fields
    const responsePayload = {
      ticket_id: ticket.ticket_id,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      attachment_url: ticket.attachment_url,
      attachment_name: ticket.attachment_name,
      created_at: ticket.created_at.toISOString(),
      updated_at: ticket.updated_at.toISOString(),
      notes: ticket.notes.map((n) => ({
        id: n.id,
        note_text: n.note_text,
        author: n.author,
        is_internal: n.is_internal,
        activity_type: n.activity_type || 'comment',
        created_at: n.created_at.toISOString(),
      })),
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ticket', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/tickets/[ticket_id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await context.params;
    const body = await request.json();
    const {
      status,
      notes,
      priority,
      category,
      author = 'Support Agent',
      is_internal = false,
      attachment_url,
      attachment_name,
    } = body;

    // Check if ticket exists
    const existing = await prisma.ticket.findUnique({
      where: { ticket_id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: `Ticket ${ticket_id} not found.` },
        { status: 404 }
      );
    }

    const updateData: any = {};
    const isStatusChanged = status && status !== existing.status;

    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Invalid status',
            message: `Status must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (priority) {
      updateData.priority = priority;
    }

    if (category) {
      updateData.category = category;
    }

    if (attachment_url !== undefined) {
      updateData.attachment_url = attachment_url;
      updateData.attachment_name = attachment_name || 'attachment';
    }

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { ticket_id },
      data: updateData,
    });

    // Audit Logging: If status changed, record an automated audit event in the Note timeline
    if (isStatusChanged) {
      await prisma.note.create({
        data: {
          ticket_id,
          note_text: `Status changed from "${existing.status}" to "${status}"`,
          author: author || 'System Audit',
          is_internal: true,
          activity_type: 'status_change',
        },
      });
    }

    // If manual notes text is provided, insert a new note in the Notes table
    if (notes && typeof notes === 'string' && notes.trim().length > 0) {
      await prisma.note.create({
        data: {
          ticket_id,
          note_text: notes.trim(),
          author: author || 'Support Agent',
          is_internal: Boolean(is_internal),
          activity_type: 'comment',
        },
      });
    }

    // Return exact response format specified in prompt:
    // { "success": true, "updated_at": "2026-09-23T11:00:00" }
    return NextResponse.json(
      {
        success: true,
        updated_at: updatedTicket.updated_at.toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket', details: error.message },
      { status: 500 }
    );
  }
}
