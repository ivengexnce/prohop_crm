# 3–5 Minute Demo Video Walkthrough Script

**Video Title**: Customer Support Ticketing CRM System (NexusCRM) — Architecture & Live Demo  
**Target Duration**: 3 to 5 minutes  
**Presenter**: Senior Full-Stack Engineer  

---

### Segment 1: Introduction & System Overview (0:00 – 0:45)
- **Visual**: Screen recording showing browser on `http://localhost:3000` (or live deployed URL). The dark-themed dashboard with KPI cards and sample tickets is visible.
- **Narration**:
  > "Hello everyone! Today I'm presenting NexusCRM, a full-stack Customer Support Ticketing System built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Prisma ORM with SQLite.
  > This application is engineered to handle end-to-end customer support workflows: ticket submission, dynamic triage, status lifecycles, and team collaboration notes."
- **Actions**:
  - Point mouse cursor to the top header showing "NexusCRM v1.0 Pro" and "SQLite DB Active".
  - Hover over the 5 executive KPI cards at the top (Total Tickets, Open Issues, In Progress, Resolved, Urgent Attention).

---

### Segment 2: Interactive Filtering & Live Search (0:45 – 1:30)
- **Visual**: Interaction with the filter toolbar.
- **Narration**:
  > "Let's first explore ticket discovery. At the top, we have an executive dashboard showing live ticket counts. Clicking on 'Open Issues' immediately filters the table down to open tickets.
  > We can also filter by priority—such as Urgent or High—or by category like Billing, Technical, or Feature Requests.
  > Notice the dynamic search bar. As I type 'webhook', the system debounces the input and performs a substring search across customer name, email, ticket ID, and issue descriptions in real-time."
- **Actions**:
  - Click on "Open Issues" card -> Observe status tab switch to "Open" and list filter.
  - Click on "Urgent Attention" card -> Observe priority filter to "Urgent".
  - Click "Reset" button -> Observe full list restored.
  - In search input, type "webhook" -> Watch `TKT-002` appear. Clear the search input.

---

### Segment 3: Ticket Creation Workflow (1:30 – 2:15)
- **Visual**: Open the Create Ticket Modal and submit a new ticket.
- **Narration**:
  > "Now, let's create a new customer ticket. Clicking 'Create Ticket' opens our modal dialog. Notice the client-side validation: if I try to submit empty fields, inline error prompts guide the user.
  > For evaluator convenience, there's a 'Fill Demo Sample' button that populates realistic customer data with one click.
  > Let's submit this ticket. The system assigns a sequential unique ticket ID—TKT-009—records the creation timestamp, displays a success toast notification, and updates our live table and KPI metrics immediately."
- **Actions**:
  - Click "+ New Ticket" button.
  - Click "Create Ticket" without filling -> Show validation messages.
  - Click "Fill Demo Sample" -> Form fills with Rachel Zane / SSO issue.
  - Click "Create Ticket" -> Watch toast appear, modal close, and new ticket `TKT-009` listed at top.

---

### Segment 4: Ticket Details, Status Workflow & Notes Collaboration (2:15 – 3:15)
- **Visual**: Open Ticket Detail modal for `TKT-001` or `TKT-009`.
- **Narration**:
  > "Clicking on any ticket row opens its comprehensive detail view. Here we see the customer profile with one-click email link, full issue description, created timestamp, and our automated 24-hour SLA tracker.
  > As a support agent, I can transition the status directly. Let's change this ticket from 'Open' to 'Set In Progress'.
  > Below, we have an activity timeline displaying previous correspondence and investigation notes. Support agents can post customer updates or toggle 'Internal Team Note' for private investigation logs.
  > Let's post an investigation note: 'Inspected payment gateway logs; credentials verified.' As soon as we click 'Post Note', it is written to the database and appears in the timeline."
- **Actions**:
  - Click ticket `TKT-001`.
  - Click "Set In Progress" button -> Toast confirms status update.
  - Type note in textarea, check "Internal Team Note", click "Post Note" -> Note appears in timeline with amber "Internal Note" badge.
  - Click "Close".

---

### Segment 5: Standout Features & Code Architecture (3:15 – 4:15)
- **Visual**: Show CSV export, API reference modal, and VS Code code editor.
- **Narration**:
  > "A few standout features designed for real-world support teams:
  > First, support leads can click 'Export CSV' to download standard RFC 4180 CSV files of filtered tickets at any time.
  > Second, we've integrated an in-app 'API Endpoints' modal that provides cURL commands and schemas for every REST API endpoint, allowing anyone to verify endpoints from terminal in seconds.
  > Third, if an evaluator ever wants a clean slate, clicking 'Reset Demo Data' restores 8 realistic sample tickets and conversation threads.
  > Under the hood, the architecture is cleanly structured: Next.js 15 App Router handles server-rendered pages and dynamic API route handlers. Prisma ORM connects to an SQLite database with relational models for Tickets and Notes."
- **Actions**:
  - Click "Export CSV" -> Show download indicator / downloaded file.
  - Click "API Endpoints" in header -> Show modal with cURL snippets.
  - Briefly switch to terminal or VS Code -> Show clean folder structure (`/src/app/api`, `/prisma`, `test-api.mjs`).

---

### Segment 6: Conclusion (4:15 – 4:45)
- **Visual**: Return to CRM dashboard.
- **Narration**:
  > "All core requirements—Create, List, Search, Filter, View, Status Update, Notes, Database, and REST APIs—are fully functional, tested, and production-ready.
  > Full setup instructions, API documentation, and test scripts are provided in the repository's README. Thank you for your time and review!"
- **Actions**:
  - Final pan of the dashboard. Fade to end.
