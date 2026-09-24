import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eventHub } from '@/lib/events';
import { dispatchNotification } from '@/lib/notifications';

// POST /api/tickets/[ticket_id]/restore
export async function POST(
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

    // Restore ticket
    const updated = await prisma.ticket.update({
      where: { ticket_id },
      data: {
        is_archived: false,
        deleted_at: null,
      },
    });

    // Record audit event
    await prisma.note.create({
      data: {
        ticket_id,
        note_text: 'Ticket was restored from archive.',
        author: 'System Audit',
        is_internal: true,
        activity_type: 'system',
      },
    });

    // Real-Time event & Webhook
    eventHub.emitTicketEvent('ticket.updated', {
      ticket_id,
      is_archived: false,
      restored: true,
    });

    dispatchNotification({
      event: 'ticket.updated',
      ticket_id,
      details: 'Ticket restored from archive',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Ticket ${ticket_id} has been restored successfully.`,
        ticket_id: updated.ticket_id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error restoring ticket:', error);
    return NextResponse.json(
      { error: 'Failed to restore ticket', details: error.message },
      { status: 500 }
    );
  }
}
