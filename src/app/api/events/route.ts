import { NextRequest } from 'next/server';
import { eventHub } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`)
      );

      // Event listener for real-time ticket mutations
      const listener = (event: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Client disconnected
          eventHub.off('ticket_event', listener);
        }
      };

      eventHub.on('ticket_event', listener);

      // Keepalive heartbeat ping every 25 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
          eventHub.off('ticket_event', listener);
        }
      }, 25000);

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        eventHub.off('ticket_event', listener);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
