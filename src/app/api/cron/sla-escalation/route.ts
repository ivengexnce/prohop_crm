import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eventHub } from '@/lib/events';
import { dispatchNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleSlaEscalation(request);
}

export async function POST(request: NextRequest) {
  return handleSlaEscalation(request);
}

async function handleSlaEscalation(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const tokenParam = request.nextUrl.searchParams.get('token');

    // If CRON_SECRET is configured, enforce bearer verification
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && tokenParam !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid cron token' }, { status: 401 });
    }

    // Configurable threshold in hours (default: 20 hours)
    const hoursParam = request.nextUrl.searchParams.get('hours');
    const thresholdHours = hoursParam ? parseFloat(hoursParam) : 20;
    const cutoffDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

    // Query non-closed, non-archived tickets approaching or past threshold not already Urgent
    const atRiskTickets = await prisma.ticket.findMany({
      where: {
        status: { not: 'Closed' },
        is_archived: false,
        priority: { not: 'Urgent' },
        created_at: { lt: cutoffDate },
      },
      select: {
        id: true,
        ticket_id: true,
        customer_name: true,
        subject: true,
        priority: true,
        status: true,
        created_at: true,
      },
    });

    const escalatedTickets: string[] = [];

    for (const ticket of atRiskTickets) {
      // 1. Elevate priority to Urgent
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { priority: 'Urgent' },
      });

      // 2. Append system audit note
      await prisma.note.create({
        data: {
          ticket_id: ticket.ticket_id,
          note_text: `🚨 Automated SLA Escalation: Ticket exceeded SLA warning threshold (${thresholdHours}h) without resolution. Priority automatically elevated to Urgent.`,
          author: 'Automated SLA Daemon',
          is_internal: true,
          activity_type: 'sla_escalation',
        },
      });

      escalatedTickets.push(ticket.ticket_id);

      // 3. Emit real-time event across connected SSE sessions
      eventHub.emitTicketEvent('ticket.escalated', {
        ticket_id: ticket.ticket_id,
        subject: ticket.subject,
        old_priority: ticket.priority,
        new_priority: 'Urgent',
      });

      // 4. Dispatch outbound webhook
      dispatchNotification({
        event: 'ticket.escalated',
        ticket_id: ticket.ticket_id,
        customer_name: ticket.customer_name,
        subject: ticket.subject,
        priority: 'Urgent',
        status: ticket.status,
        details: `Ticket automatically escalated to Urgent after ${thresholdHours}h without resolution.`,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      threshold_hours: thresholdHours,
      cutoff_date: cutoffDate.toISOString(),
      scanned_count: atRiskTickets.length,
      escalated_count: escalatedTickets.length,
      escalated_tickets: escalatedTickets,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error executing SLA escalation cron:', error);
    return NextResponse.json(
      { error: 'Failed to execute SLA escalation', details: error.message },
      { status: 500 }
    );
  }
}
