import { EventEmitter } from 'events';

// Global singleton EventEmitter across Next.js API route invocations
class TicketEventHub extends EventEmitter {
  constructor() {
    super();
    // Allow up to 100 concurrent SSE subscribers per node
    this.setMaxListeners(100);
  }

  emitTicketEvent(eventType: 'ticket.created' | 'ticket.updated' | 'ticket.archived' | 'ticket.escalated', data: any) {
    this.emit('ticket_event', {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __ticketEventHub: TicketEventHub | undefined;
}

export const eventHub: TicketEventHub =
  global.__ticketEventHub || (global.__ticketEventHub = new TicketEventHub());
