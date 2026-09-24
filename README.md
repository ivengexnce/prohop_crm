# ProHop — Enterprise Customer Support Ticketing CRM System

A full-stack, production-ready web application for managing customer support tickets, customer interaction history, issue resolution workflows, and support team collaboration.

Built by a Senior Full-Stack Engineer with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, and SQLite.

---

## 🌟 Executive Overview & Key Features

### 1. Core Ticketing Capabilities
- **Create Support Tickets (`POST /api/tickets`)**: Validated submission with customer details, issue title, category, priority, and markdown description. Automatically generates sequential ticket IDs (`TKT-001`, `TKT-002`, ...) and ISO timestamps.
- **Dynamic Ticket Listing (`GET /api/tickets`)**: Clean, responsive table showing ticket ID, customer name, email, subject, status, priority, category, created time, and activity count.
- **Real-Time Substring Search**: Debounced live search querying across Customer Name, Ticket ID, Customer Email, Subject, and Issue Description simultaneously.
- **Status Filtering**: Instant one-click filtering by `Open`, `In Progress`, `Closed`, and `All`.
- **Ticket Details & Updates (`GET / PUT /api/tickets/{ticket_id}`)**: Complete ticket inspection modal with customer snapshot, status transition actions (`Mark Open`, `Set In Progress`, `Resolve & Close`), and team collaboration timeline.
- **Activity & Internal Notes Collaboration**: Support agents can log public replies or private internal notes (`is_internal: true`) with author attribution and relative timestamps.

### 2. Senior-Level Standout Features
- **Executive KPI Dashboard**: Real-time metric cards for Total Tickets, Open Issues, In Progress, Resolved / Closed, Critical SLA alerts, and Resolution Rate. Clicking any metric card instantly filters the tickets table.
- **SLA Breach Indicators**: Computes elapsed time since ticket creation and highlights whether a ticket is within its 24-hour SLA or breached.
- **Priority & Category Taxonomies**: Multi-dimensional filtering by Priority (`Urgent`, `High`, `Medium`, `Low`) and Category (`Technical`, `Billing`, `Account`, `Feature Request`, `General`).
- **CSV Data Export (`GET /api/export`)**: Compliant RFC 4180 CSV export generating live downloads of filtered tickets for support managers.
- **1-Click Seed Data Reset (`POST /api/seed`)**: Pre-populated with 8 diverse, realistic customer support tickets and notes so evaluators can test a populated system right away.
- **Interactive REST API Modal**: Built-in terminal reference displaying live cURL commands and JSON schemas with copy-to-clipboard actions.
- **Optimistic UI & Toast Feedback**: Floating feedback alerts for ticket creation, status changes, note submissions, and clipboard copies.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Client-Side)                   │
│   • Next.js 15 App Router & React 19                   │
│   • Tailwind CSS (Modern Dark Enterprise Theme)        │
│   • Lucide React Icons & Optimistic UI State           │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
┌───────────────────────────▼────────────────────────────┐
│                API Layer (Server-Side)                 │
│   • /api/tickets          (GET, POST)                  │
│   • /api/tickets/[id]     (GET, PUT)                   │
│   • /api/stats            (GET)                        │
│   • /api/export           (GET CSV)                    │
│   • /api/seed             (POST)                       │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma Client
┌───────────────────────────▼────────────────────────────┐
│               Database Layer (ORM)                     │
│   • Prisma ORM 6.4                                     │
│   • SQLite (dev.db) — Zero-config offline execution    │
│   • Ready for PostgreSQL (Supabase / Railway / Neon)   │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Design

### `Ticket` Table
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Autoincrement | Internal numeric record ID |
| `ticket_id` | String | Unique, Indexed | Formatted sequential ID (`TKT-001`) |
| `customer_name` | String | Required | Customer full name |
| `customer_email`| String | Required | Customer email address |
| `subject` | String | Required | Issue title / headline |
| `description` | String | Required | Detailed issue description |
| `status` | String | Default: `"Open"` | `"Open"` \| `"In Progress"` \| `"Closed"` |
| `priority` | String | Default: `"Medium"` | `"Low"` \| `"Medium"` \| `"High"` \| `"Urgent"` |
| `category` | String | Default: `"General"`| `"General"` \| `"Technical"` \| `"Billing"` \| `"Account"` \| `"Feature Request"` |
| `created_at` | DateTime| Default: `now()` | Timestamp of ticket submission |
| `updated_at` | DateTime| Auto-updated | Timestamp of last modification |

### `Note` Table
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Autoincrement | Internal note ID |
| `ticket_id` | String | Foreign Key | References `Ticket.ticket_id` (Cascade delete) |
| `note_text` | String | Required | Content of comment / investigation |
| `author` | String | Default: `"Support Agent"`| Author display name |
| `is_internal` | Boolean | Default: `false` | Distinguishes internal notes from customer updates |
| `created_at` | DateTime| Default: `now()` | Timestamp of note posting |

---

## 🚀 REST API Specification

### 1. Create Ticket
- **Endpoint**: `POST /api/tickets`
- **Request Body**:
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "subject": "Unable to place order",
  "description": "The checkout page is showing an error."
}
```
- **Response** (`201 Created`):
```json
{
  "ticket_id": "TKT-001",
  "created_at": "2026-09-23T10:30:00.000Z"
}
```
- **cURL Example**:
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "subject": "Unable to place order",
    "description": "The checkout page is showing an error."
  }'
```

---

### 2. List All Tickets (with Search & Filters)
- **Endpoint**: `GET /api/tickets`
- **Query Parameters**:
  - `status`: `Open` | `In Progress` | `Closed` | `All`
  - `search`: Substring search against `customer_name`, `customer_email`, `ticket_id`, `subject`, `description`
  - `priority`: `Urgent` | `High` | `Medium` | `Low`
  - `category`: `Technical` | `Billing` | `Account` | `Feature Request`
  - `sort`: `newest` | `oldest` | `priority`
- **Response** (`200 OK`):
```json
[
  {
    "ticket_id": "TKT-001",
    "customer_name": "John Doe",
    "subject": "Unable to place order",
    "status": "Open",
    "created_at": "2026-09-23T10:30:00.000Z"
  }
]
```
- **cURL Example**:
```bash
curl "http://localhost:3000/api/tickets?status=Open&search=john"
```

---

### 3. Get Ticket Details
- **Endpoint**: `GET /api/tickets/{ticket_id}`
- **Response** (`200 OK`):
```json
{
  "ticket_id": "TKT-001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "subject": "Unable to place order",
  "description": "The checkout page is showing an error.",
  "status": "Open",
  "priority": "Medium",
  "category": "Technical",
  "created_at": "2026-09-23T10:30:00.000Z",
  "updated_at": "2026-09-23T10:30:00.000Z",
  "notes": [
    {
      "id": 1,
      "note_text": "Support team has started investigating.",
      "author": "Support Agent",
      "is_internal": false,
      "created_at": "2026-09-23T11:00:00.000Z"
    }
  ]
}
```
- **cURL Example**:
```bash
curl http://localhost:3000/api/tickets/TKT-001
```

---

### 4. Update Ticket Status & Add Notes
- **Endpoint**: `PUT /api/tickets/{ticket_id}`
- **Request Body**:
```json
{
  "status": "In Progress",
  "notes": "Support team has started investigating the issue."
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "updated_at": "2026-09-23T11:00:00.000Z"
}
```
- **cURL Example**:
```bash
curl -X PUT http://localhost:3000/api/tickets/TKT-001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "notes": "Support team has started investigating the issue."
  }'
```

---

### 5. Get Real-Time KPI Stats
- **Endpoint**: `GET /api/stats`
- **Response** (`200 OK`):
```json
{
  "total": 8,
  "open": 3,
  "in_progress": 3,
  "closed": 2,
  "urgent": 2,
  "resolution_rate": 25
}
```

---

### 6. Export Filtered Tickets to CSV
- **Endpoint**: `GET /api/export?status=Open&search=billing`
- **Response**: Binary stream with `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="crm_tickets_export_2026-09-23.csv"`.

---

## 💻 Local Setup & Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v20 / v22 / v24)
- npm 9+

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd crm
npm install
```

### 2. Configure Environment
Create `.env` from `.env.example`:
```bash
cp .env.example .env
```
*(Default `DATABASE_URL="file:./dev.db"` requires zero database configuration).*

### 3. Initialize Database & Seed
```bash
npm run db:push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the end-to-end API test suite:
```bash
node test-api.mjs
```
This script exercises:
- Fetching tickets (`GET /api/tickets`)
- Multi-field substring search & status filtering
- Ticket creation (`POST /api/tickets`)
- Ticket detail retrieval (`GET /api/tickets/[id]`)
- Ticket status updates & note insertion (`PUT /api/tickets/[id]`)
- KPI summary generation (`GET /api/stats`)
- CSV stream generation (`GET /api/export`)

---

## 🚢 Production Deployment

### Option 1: Railway (Recommended for Full-Stack Node/Next.js)
1. Push your repository to GitHub.
2. Link the repository on [Railway.app](https://railway.app).
3. Under Environment Variables, set `DATABASE_URL` (SQLite file volume or Railway PostgreSQL).
4. Build command: `npm run build`
5. Start command: `npm start`

### Option 2: Vercel (with PostgreSQL / Supabase)
1. In `prisma/schema.prisma`, change datasource provider from `"sqlite"` to `"postgresql"`.
2. Add PostgreSQL connection string `DATABASE_URL` in Vercel project settings.
3. Deploy directly via Vercel GitHub integration.

### Option 3: Render
1. Create a Web Service connected to your repository.
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npm start`

---

## 📁 Project Directory Structure

```
crm/
├── prisma/
│   ├── schema.prisma        # Database models (Ticket, Note)
│   ├── seed.ts              # 8 sample customer tickets & notes
│   └── dev.db               # SQLite database file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── export/      # GET /api/export (CSV generator)
│   │   │   ├── seed/        # POST /api/seed (1-click reset)
│   │   │   ├── stats/       # GET /api/stats (KPI metrics)
│   │   │   └── tickets/     # GET, POST /api/tickets & PUT, GET [ticket_id]
│   │   ├── globals.css      # Tailwind v4 styles & custom scrollbars
│   │   ├── layout.tsx       # Root layout & Inter font typography
│   │   └── page.tsx         # Master CRM Dashboard
│   ├── components/
│   │   ├── ApiDocsModal.tsx # Interactive cURL documentation
│   │   ├── CreateTicketModal.tsx # Validated ticket creation form
│   │   ├── FilterToolbar.tsx # Search, status pills, priority, category
│   │   ├── Navbar.tsx       # Top brand header & action buttons
│   │   ├── StatsCards.tsx   # Interactive KPI summary cards
│   │   ├── TicketDetailModal.tsx # Full ticket view & notes timeline
│   │   ├── TicketList.tsx   # Ticket table with status badges & SLA
│   │   └── Toast.tsx        # Toast notification system
│   ├── lib/
│   │   ├── date-utils.ts    # Relative time & SLA calculation
│   │   ├── prisma.ts        # Singleton Prisma client instance
│   │   └── ticket-id.ts     # Sequential TKT-XXX ID generator
│   └── types/
│       └── ticket.ts        # TypeScript interface definitions
├── .env.example             # Template environment configuration
├── package.json             # Scripts & dependencies
├── test-api.mjs             # Automated API test suite
└── README.md                # Comprehensive documentation
```

---

## ⚖️ Trade-offs & Engineering Decisions

1. **SQLite with Prisma vs External Hosted Database**:
   - *Why*: SQLite allows any evaluator to clone, install, and run the complete system in seconds with zero external database credentials, credentials expiry, or network latency.
   - *Trade-off*: SQLite requires persistent disk storage or switching to PostgreSQL for serverless edge deployments. Prisma's schema abstraction makes swapping to PostgreSQL a 1-line configuration change.

2. **Next.js Full-Stack Route Handlers vs Separate Express/FastAPI Service**:
   - *Why*: Unifies type definitions, reduces deployment complexity to a single repository, and eliminates CORS cross-origin configuration friction.
   - *Trade-off*: Monolithic bundling, though Next.js compiles API routes into independent serverless functions under the hood.

3. **Optimistic UI Updates with Server Confirmation**:
   - *Why*: Gives support agents instantaneous responsiveness when changing status or toggling filters, while verifying state through backend validation.
