import { NextRequest, NextResponse } from 'next/server';

// ─── Exported types (imported by ApiDocsModal) ─────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface EndpointDoc {
    id: string;
    method: HttpMethod;
    path: string;
    description: string;
    curl: string;
    response: string;  // Pretty-printed JSON, or a prose note for binary streams
    isLive: boolean;
}

// ─── Internal types ────────────────────────────────────────────────────────

// Matches the pagination wrapper returned by GET /api/tickets when
// ?limit or ?page is present (confirmed: shouldPaginate = true).
interface TicketListResponse {
    data: Array<{ ticket_id: string;[key: string]: unknown }>;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    };
}

interface EndpointMeta {
    id: string;
    method: HttpMethod;
    path: string;
    description: string;
    curl: string;
    // Internal path to call for a live response. Null for write operations,
    // which cannot be called safely for documentation purposes.
    livePath: string | null;
    // Fallback when livePath is null or the live call fails.
    exampleResponse: unknown;
}

// ─── Endpoint metadata ─────────────────────────────────────────────────────
// Descriptions and curl templates are static. Responses are fetched live
// where possible and fall back to these examples on error.

const ENDPOINTS: EndpointMeta[] = [
    {
        id: 'create-ticket',
        method: 'POST',
        path: '/api/tickets',
        description:
            'Create a new support ticket. Validates all required fields, enforces email format, applies rate limiting (30 requests / 60 s per IP), and auto-generates a collision-safe sequential TKT-XXX ID.',
        curl: `curl -X POST http://localhost:3000/api/tickets \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "subject": "Unable to place order",
    "description": "The checkout page is showing an error.",
    "priority": "High",
    "category": "Technical"
  }'`,
        livePath: null,
        exampleResponse: {
            ticket_id: 'TKT-009',
            created_at: '2026-09-24T10:30:00.000Z',
        },
    },

    {
        id: 'list-tickets',
        method: 'GET',
        path: '/api/tickets',
        description:
            'List tickets with optional filtering by status, priority, and category. Multi-field substring search spans customer_name, customer_email, ticket_id, subject, and description. Returns a pagination wrapper when ?page or ?limit is present; a plain array with an X-Total-Count header otherwise.',
        curl: `curl "http://localhost:3000/api/tickets?status=Open&priority=High&page=1&limit=10"`,
        // Passing ?limit makes shouldPaginate true → always returns pagination wrapper.
        livePath: '/api/tickets?limit=3&sort=newest',
        exampleResponse: {
            data: [
                {
                    ticket_id: 'TKT-001',
                    customer_name: 'John Doe',
                    customer_email: 'john@example.com',
                    subject: 'Unable to place order',
                    description: 'The checkout page is showing an error.',
                    status: 'Open',
                    priority: 'High',
                    category: 'Technical',
                    attachment_url: null,
                    attachment_name: null,
                    created_at: '2026-09-24T10:30:00.000Z',
                    updated_at: '2026-09-24T10:30:00.000Z',
                    notes_count: 2,
                },
            ],
            pagination: {
                total: 1, page: 1, limit: 3, totalPages: 1, hasMore: false,
            },
        },
    },

    {
        id: 'get-ticket',
        method: 'GET',
        path: '/api/tickets/{ticket_id}',
        description:
            'Retrieve full ticket details including customer snapshot, current status, priority, category, optional attachment, and the complete chronological notes timeline with activity_type ("comment" | "status_change" | "system") and author attribution.',
        curl: `curl http://localhost:3000/api/tickets/TKT-001`,
        // Resolved dynamically at request time — see resolveTicketDetail().
        livePath: null,
        exampleResponse: {
            ticket_id: 'TKT-001',
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            subject: 'Unable to place order',
            description: 'The checkout page is showing an error.',
            status: 'Open',
            priority: 'Medium',
            category: 'Technical',
            attachment_url: null,
            attachment_name: null,
            created_at: '2026-09-24T10:30:00.000Z',
            updated_at: '2026-09-24T10:30:00.000Z',
            notes: [
                {
                    id: 1,
                    note_text: 'Support team has started investigating.',
                    author: 'Support Agent',
                    is_internal: false,
                    activity_type: 'comment',
                    created_at: '2026-09-24T11:00:00.000Z',
                },
            ],
        },
    },

    {
        id: 'update-ticket',
        method: 'PUT',
        path: '/api/tickets/{ticket_id}',
        description:
            'Update ticket status and optionally append a collaboration note. Set is_internal: true to create a private agent note. Every status transition auto-creates a system audit log entry with activity_type "status_change".',
        curl: `curl -X PUT http://localhost:3000/api/tickets/TKT-001 \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "In Progress",
    "notes": "Support team has started investigating the issue.",
    "is_internal": false
  }'`,
        livePath: null,
        exampleResponse: {
            success: true,
            updated_at: '2026-09-24T11:00:00.000Z',
        },
    },

    {
        id: 'upload',
        method: 'POST',
        path: '/api/upload',
        description:
            'Upload a screenshot or log file attachment (max 5 MB; PNG, JPG, PDF, TXT). Returns the public path stored in Ticket.attachment_url. Pass the returned url when creating or updating a ticket.',
        curl: `curl -X POST http://localhost:3000/api/upload \\
  -F "file=@screenshot.png"`,
        livePath: null,
        exampleResponse: {
            success: true,
            url: '/uploads/1790189343_screenshot.png',
            name: 'screenshot.png',
            size: 104230,
        },
    },

    {
        id: 'stats',
        method: 'GET',
        path: '/api/stats',
        description:
            'Real-time KPI snapshot counted directly from the database: total tickets, open, in progress, closed, urgent count, and resolution rate as a percentage (closed ÷ total × 100).',
        curl: `curl http://localhost:3000/api/stats`,
        livePath: '/api/stats',
        exampleResponse: {
            total: 8,
            open: 3,
            in_progress: 3,
            closed: 2,
            urgent: 2,
            resolution_rate: 25,
        },
    },

    {
        id: 'export',
        method: 'GET',
        path: '/api/export',
        description:
            'Download filtered tickets as an RFC 4180 CSV file with formula-injection sanitisation. Accepts the same status, search, priority, and category query parameters as GET /api/tickets.',
        curl: `curl "http://localhost:3000/api/export?status=Open" -o tickets.csv`,
        livePath: null,
        exampleResponse: '[Binary CSV stream · Content-Type: text/csv; charset=utf-8]',
    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Safe internal GET — never throws; returns { data, ok }. */
async function liveGet(
    origin: string,
    path: string,
): Promise<{ data: unknown; ok: boolean }> {
    try {
        const res = await fetch(`${origin}${path}`, {
            cache: 'no-store',
            headers: { 'x-docs-internal': '1' },
        });
        if (!res.ok) return { data: null, ok: false };
        return { data: await res.json(), ok: true };
    } catch {
        return { data: null, ok: false };
    }
}

/**
 * Discover the first real ticket ID from the database, then fetch its
 * full detail response.
 *
 * GET /api/tickets?limit=1 always returns a pagination wrapper because
 * shouldPaginate = (pageParam !== null || limitParam !== null) = true.
 * There is no ambiguity about the response shape here.
 */
async function resolveTicketDetail(
    origin: string,
): Promise<{ data: unknown; ok: boolean }> {
    const list = await liveGet(origin, '/api/tickets?limit=1');

    if (!list.ok || list.data === null) {
        return { data: null, ok: false };
    }

    // The route always returns the pagination wrapper when ?limit is present.
    const wrapper = list.data as TicketListResponse;

    if (!Array.isArray(wrapper.data) || wrapper.data.length === 0) {
        return { data: null, ok: false };
    }

    const firstTicketId = wrapper.data[0]?.ticket_id;
    if (!firstTicketId) return { data: null, ok: false };

    return liveGet(origin, `/api/tickets/${firstTicketId}`);
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse<EndpointDoc[]>> {
    const origin = new URL(request.url).origin;

    const docs: EndpointDoc[] = await Promise.all(
        ENDPOINTS.map(async (ep): Promise<EndpointDoc> => {
            let response: string;
            let isLive = false;

            if (ep.id === 'get-ticket') {
                // Dynamic: discover the first real ticket ID at request time.
                const result = await resolveTicketDetail(origin);
                if (result.ok && result.data !== null) {
                    response = JSON.stringify(result.data, null, 2);
                    isLive = true;
                } else {
                    response = JSON.stringify(ep.exampleResponse, null, 2);
                }
            } else if (ep.livePath !== null) {
                const result = await liveGet(origin, ep.livePath);
                if (result.ok && result.data !== null) {
                    response = JSON.stringify(result.data, null, 2);
                    isLive = true;
                } else {
                    response = JSON.stringify(ep.exampleResponse, null, 2);
                }
            } else if (typeof ep.exampleResponse === 'string') {
                // Binary stream or prose note — emit as-is.
                response = ep.exampleResponse;
            } else {
                response = JSON.stringify(ep.exampleResponse, null, 2);
            }

            return {
                id: ep.id,
                method: ep.method,
                path: ep.path,
                description: ep.description,
                curl: ep.curl,
                response,
                isLive,
            };
        }),
    );

    return NextResponse.json(docs, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
}