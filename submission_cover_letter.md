# Customer Support Ticketing CRM System — Submission Cover Letter

**Candidate**: Senior Full-Stack Engineer  
**Role**: Senior Full-Stack Developer (12+ Years Experience)  
**Project**: Customer Support Ticketing CRM System (NexusCRM)  
**Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, SQLite  

---

## 1. Technical Approach

### Frontend Architecture
- **Framework**: Next.js 15 App Router with React 19.
- **Styling & Design System**: Tailwind CSS configured with a sleek dark slate enterprise theme. Custom scrollbars, status badges (emerald for Open, amber for In Progress, purple for Closed, red flame for Urgent), and responsive layout ensuring seamless UX across mobile, tablet, and widescreen monitors.
- **State Management & Interactivity**: Client-side state managed with React hooks (`useState`, `useEffect`, `useCallback`, `useTransition`), debounced search synchronization, optimistic UI updates, and an in-memory Toast notification system.
- **Modals & Drawers**: Dedicated accessible modals for Ticket Creation (with live validation and 1-click sample fill), Ticket Detail & Notes Timeline, and an in-app interactive REST API documentation viewer.

### Backend & API Architecture
- **Route Handlers**: Next.js App Router API Route Handlers (`src/app/api/...`), completely adhering to the REST API specifications:
  - `POST /api/tickets`: Validates customer info, issues sequential `TKT-XXX` IDs, and records initial status.
  - `GET /api/tickets`: Supports multi-field substring queries across `customer_name`, `customer_email`, `ticket_id`, `subject`, and `description`, plus filtering by status, priority, category, and sort orders.
  - `GET /api/tickets/[ticket_id]`: Returns detailed ticket data including associated notes array.
  - `PUT /api/tickets/[ticket_id]`: Handles status transitions and appends collaboration notes to the Notes table.
  - `GET /api/stats`: Real-time KPI aggregation for total tickets, open issues, in progress, resolved, urgent SLA alerts, and resolution rate.
  - `GET /api/export`: Generates standard RFC 4180 CSV streams with appropriate `Content-Disposition` attachment headers for instant file download.
  - `POST /api/seed`: 1-click database reset and re-population for evaluators.

### Database Architecture
- **ORM**: Prisma ORM 6.4 with a relational schema connecting `Ticket` and `Note` via foreign key `ticket_id` with cascading deletion.
- **Engine**: SQLite (`dev.db`). Chosen intentionally so any evaluator can clone the repo and run the full stack locally with zero database provisioning, cloud credentials, or setup friction, while remaining 100% portable to PostgreSQL (Supabase, Neon, Railway) via Prisma's datasource configuration.

### Deployment Approach
- Designed for rapid deployment to **Railway**, **Vercel**, or **Render**. The project includes build optimization (`npm run build`), automatic Prisma client generation (`postinstall: prisma generate`), database push scripts, and clean separation between environment configs.

---

## 2. Key Features I am Most Proud Of

1. **Executive KPI Dashboard with Clickable Card Filters**:
   Rather than static numbers, each KPI card (Total, Open, In Progress, Closed, Urgent) is interactive. Clicking on "Open Issues" or "Urgent Attention" immediately filters the ticket table to that subset.
2. **Dynamic Real-Time Multi-Field Search & SLA Tracking**:
   The search bar debounces input and matches across 5 fields simultaneously. Combined with automatic SLA calculation, support teams can instantly pinpoint high-urgency or breached tickets.
3. **Collaboration & Note Threading (Public vs Internal)**:
   Beyond simple comments, the system distinguishes between customer-facing responses and private internal investigation logs (`is_internal: true`), complete with author badges and relative timestamps.
4. **Evaluator-First Experience**:
   Features like "Fill Demo Sample" on ticket creation, an in-app "API Endpoints" cURL explorer, and a "Reset Demo Data" button ensure that reviewers can evaluate all flows without manual setup or data entry fatigue.
5. **RFC 4180 CSV Data Export**:
   Managers can apply any combination of search and status filters and click "Export CSV" to immediately download an escaped, properly formatted CSV spreadsheet.

---

## 3. Major Technical Challenges & Solutions

### Challenge 1: Sequential Human-Friendly Ticket IDs with Concurrency Safety
- *Problem*: Evaluators expect recognizable IDs like `TKT-001`, `TKT-002` rather than raw numeric primary keys or unreadable UUIDs.
- *Solution*: Implemented `getNextTicketId()` helper in `src/lib/ticket-id.ts` that safely inspects existing sequential identifiers, parses numeric components, and auto-pads numbers (`TKT-001`), ensuring deterministic identifier assignment across tickets.

### Challenge 2: Synchronizing Complex Multi-Criteria Filtering with Debounced Search
- *Problem*: Combining live substring text search with status tabs, priority dropdowns, and category selectors can trigger race conditions or redundant network traffic.
- *Solution*: Implemented a 300ms debounce buffer on `searchQuery` paired with `useCallback` on `fetchTickets`. When any filter changes, query parameters are dynamically composed into a clean `URLSearchParams` string, delivering fluid 60fps search responsiveness.

### Challenge 3: Next.js 15 Route Handler Asynchronous Dynamic Context
- *Problem*: In Next.js 15, dynamic route params in route handlers are asynchronous Promises (`context.params: Promise<{ ticket_id: string }>`).
- *Solution*: Awaited the params object (`const { ticket_id } = await context.params;`) across all `[ticket_id]` route handlers to ensure full compatibility with the latest Next.js runtime.

---

## 4. Future Improvements (With Additional Development Time)

If allocated additional sprint cycles, I would implement:
1. **Real-time WebSockets / SSE**: Push notifications when another agent updates a ticket or posts a note in real-time.
2. **Customer Portal Authentication**: Role-based access control (RBAC) separating Support Agents, Support Leads, and Customers using NextAuth.js or Clerk.
3. **AI-Powered Ticket Triage**: Integrating Gemini API to automatically summarize lengthy customer issues, suggest resolution responses, and categorize tickets upon arrival.
4. **Email Ingestion (Inbound Webhooks)**: Ingesting incoming customer emails via SendGrid / Postmark inbound webhooks to auto-generate tickets directly from inbox inquiries.
5. **Automated SLA Escalation Rules**: Cron-triggered notifications escalating tickets that remain untouched after 12 hours.

---

## 5. Submission Links

- **Live Application**: `https://<your-deployed-domain>.up.railway.app` *(or Vercel / Render URL)*
- **GitHub Repository**: `https://github.com/<your-username>/crm`
- **Demo Video Walkthrough**: `https://youtu.be/<your-demo-video-id>`
