import { prisma } from './prisma';

/**
 * Generates the next sequential ticket ID, e.g. TKT-001, TKT-002
 */
export async function getNextTicketId(): Promise<string> {
  // Find highest current ticket_id
  const tickets = await prisma.ticket.findMany({
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

  const nextNum = maxNum + 1;
  return `TKT-${String(nextNum).padStart(3, '0')}`;
}
