import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eventHub } from '@/lib/events';
import { dispatchNotification } from '@/lib/notifications';

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

    // Response payload with multi-tenant and archival fields
    const responsePayload = {
      ticket_id: ticket.ticket_id,
      organization_id: ticket.organization_id,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      attachment_url: ticket.attachment_url,
      attachment_name: ticket.attachment_name,
      is_archived: ticket.is_archived,
      deleted_at: ticket.deleted_at ? ticket.deleted_at.toISOString() : null,
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
      is_archived,
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

    if (typeof is_archived === 'boolean') {
      updateData.is_archived = is_archived;
      updateData.deleted_at = is_archived ? new Date() : null;
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

    // Real-Time Event Notification (SSE)
    eventHub.emitTicketEvent('ticket.updated', {
      ticket_id,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      is_archived: updatedTicket.is_archived,
      updated_at: updatedTicket.updated_at.toISOString(),
    });

    // Outbound Webhook Dispatch
    dispatchNotification({
      event: 'ticket.updated',
      ticket_id,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      details: isStatusChanged ? `Status transitioned from ${existing.status} to ${status}` : 'Ticket updated',
      timestamp: updatedTicket.updated_at.toISOString(),
    });

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

// DELETE /api/tickets/[ticket_id] - Soft Delete / Data Archival
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await context.params;

    const existing = await prisma.ticket.findUnique({
      where: { ticket_id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: `Ticket ${ticket_id} not found.` },
        { status: 404 }
      );
    }

    // Soft delete: set is_archived = true and deleted_at = now()
    const now = new Date();
    await prisma.ticket.update({
      where: { ticket_id },
      data: {
        is_archived: true,
        deleted_at: now,
      },
    });

    // Append system audit record
    await prisma.note.create({
      data: {
        ticket_id,
        note_text: 'Ticket was soft-deleted / archived for data retention compliance.',
        author: 'System Audit',
        is_internal: true,
        activity_type: 'system',
      },
    });

    // Emit real-time event
    eventHub.emitTicketEvent('ticket.archived', {
      ticket_id,
      archived_at: now.toISOString(),
    });

    // Dispatch webhook
    dispatchNotification({
      event: 'ticket.archived',
      ticket_id,
      details: 'Ticket archived / soft-deleted',
      timestamp: now.toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Ticket ${ticket_id} has been safely archived.`,
        deleted_at: now.toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error archiving ticket:', error);
    return NextResponse.json(
      { error: 'Failed to archive ticket', details: error.message },
      { status: 500 }
    );
  }
}
