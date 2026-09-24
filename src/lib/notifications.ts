export interface NotificationEvent {
  event: 'ticket.created' | 'ticket.updated' | 'ticket.archived' | 'ticket.escalated';
  ticket_id: string;
  customer_name?: string;
  subject?: string;
  status?: string;
  priority?: string;
  details?: string;
  timestamp: string;
}

const dispatchLogs: NotificationEvent[] = [];

/**
 * Dispatches an outbound webhook event asynchronously.
 * Supports generic HTTP webhooks, Slack incoming webhooks, and Discord webhooks.
 * Non-blocking: failures are logged without blocking caller API response.
 */
export async function dispatchNotification(event: NotificationEvent): Promise<void> {
  // Record in in-memory dispatch log buffer (capped at 100 entries)
  dispatchLogs.unshift(event);
  if (dispatchLogs.length > 100) dispatchLogs.pop();

  const webhookUrl = process.env.WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    // If no external URL configured in environment, event is recorded in local log buffer
    return;
  }

  try {
    const isSlack = webhookUrl.includes('slack.com') || webhookUrl.includes('discord.com');
    const body = isSlack
      ? JSON.stringify({
          text: `[ProHop CRM] ${event.event.toUpperCase()} - Ticket ${event.ticket_id}: ${event.subject || ''} (${event.priority || 'Normal'} Priority, Status: ${event.status || 'Open'})`,
        })
      : JSON.stringify(event);

    // Fire non-blocking fetch with short timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ProHop-CRM-Notifier/1.0',
      },
      body,
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) console.warn(`Webhook responded with status ${res.status}`);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.warn('Webhook dispatch failed (non-blocking):', err.message);
      });
  } catch (err: any) {
    console.warn('Error scheduling notification dispatch:', err.message);
  }
}

export function getNotificationLogs(): NotificationEvent[] {
  return [...dispatchLogs];
}
