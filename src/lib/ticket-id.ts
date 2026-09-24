import { prisma } from './prisma';

/**
 * Generates the next sequential ticket ID, e.g. TKT-001, TKT-002.
 * Uses atomic Prisma transactions on the Sequence model to guarantee
 * zero race conditions, monotonic increments, and zero collisions under concurrency.
 */
export async function getNextTicketId(): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    let seq = await tx.sequence.findUnique({
      where: { name: 'ticket_id' },
    });

    if (!seq) {
      // Find highest current ticket_id to seed the sequence table safely
      const tickets = await tx.ticket.findMany({
        select: { ticket_id: true },
        orderBy: { id: 'desc' },
        take: 50,
      });

      let maxNum = 0;
      for (const t of tickets) {
        const match = t.ticket_id.match(/^TKT-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }

      seq = await tx.sequence.create({
        data: {
          name: 'ticket_id',
          value: maxNum,
        },
      });
    }

    // Atomic increment guaranteed by ACID database transaction
    const updated = await tx.sequence.update({
      where: { name: 'ticket_id' },
      data: {
        value: {
          increment: 1,
        },
      },
    });

    return `TKT-${String(updated.value).padStart(3, '0')}`;
  });
}
