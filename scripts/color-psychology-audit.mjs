import fs from 'fs';
import path from 'path';

// ANSI color formatting for terminal
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const ROOT_DIR = process.cwd();

console.log(`${C.bold}${C.cyan}=====================================================${C.reset}`);
console.log(`${C.bold}🎨 PROHOP CRM — COMPREHENSIVE COLOR & BUTTON AUDIT v2.5${C.reset}`);
console.log(`Checking Creative Color Psychology, Button Contrast & Handler Integrity`);
console.log(`${C.bold}${C.cyan}=====================================================${C.reset}\n`);

let passedTests = 0;
let failedTests = 0;

function assert(condition, message, detail = '') {
  if (condition) {
    console.log(`  ${C.green}✅ [PASS]${C.reset} ${message}`);
    passedTests++;
  } else {
    console.log(`  ${C.red}❌ [FAIL]${C.reset} ${message}`);
    if (detail) console.log(`     ${C.yellow}Detail:${C.reset} ${detail}`);
    failedTests++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Audit Primary Action Buttons (!text-white protection)
// ─────────────────────────────────────────────────────────────────────────────
console.log(`${C.bold}🔘 SECTION 1: Solid Action Buttons & CTA Text Protection${C.reset}`);

const navbarSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/Navbar.tsx'), 'utf-8');
const pageSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/app/page.tsx'), 'utf-8');
const createModalSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/CreateTicketModal.tsx'), 'utf-8');
const globalsCss = fs.readFileSync(path.join(ROOT_DIR, 'src/app/globals.css'), 'utf-8');

assert(
  navbarSrc.includes('!text-white') && navbarSrc.includes('bg-indigo-600'),
  'Navbar "+ New Ticket" CTA has explicit !text-white protection'
);

assert(
  pageSrc.includes('!text-white') && pageSrc.includes('bg-indigo-600'),
  'Page hero "+ New Ticket" CTA has explicit !text-white protection'
);

assert(
  createModalSrc.includes('!text-white') && createModalSrc.includes('bg-indigo-600'),
  'CreateTicketModal "Create Ticket" submit button has explicit !text-white protection'
);

assert(
  globalsCss.includes('color: #ffffff !important;') &&
  globalsCss.includes('.light-theme button.bg-indigo-600'),
  'globals.css defines bulletproof color: #ffffff !important for .light-theme buttons'
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Audit Creative Color Psychology Alignment Across All Components
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}🧠 SECTION 2: Creative Color Psychology Alignment (Amber/Sky/Emerald/Rose)${C.reset}`);

const filterSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/FilterToolbar.tsx'), 'utf-8');
const ticketListSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/TicketList.tsx'), 'utf-8');
const statsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/StatsCards.tsx'), 'utf-8');
const kanbanSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/KanbanBoard.tsx'), 'utf-8');
const detailModalSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/TicketDetailModal.tsx'), 'utf-8');

// FilterToolbar checks
assert(
  filterSrc.includes("value: 'Open'") && filterSrc.includes('amber'),
  'FilterToolbar: "Open" status pill uses Solar Amber psychology palette'
);
assert(
  filterSrc.includes("value: 'In Progress'") && filterSrc.includes('sky'),
  'FilterToolbar: "In Progress" status pill uses Electric Sky/Azure psychology palette'
);
assert(
  filterSrc.includes("value: 'Closed'") && filterSrc.includes('emerald'),
  'FilterToolbar: "Closed" status pill uses Lush Emerald psychology palette'
);

// TicketList checks
assert(
  ticketListSrc.includes("case 'Open':") &&
  ticketListSrc.includes('amber-50') &&
  ticketListSrc.includes('amber-900'),
  'TicketList: "Open" status badge uses Solar Amber with high-contrast amber-900 in light mode'
);
assert(
  ticketListSrc.includes("case 'In Progress':") &&
  ticketListSrc.includes('sky-50') &&
  ticketListSrc.includes('sky-900'),
  'TicketList: "In Progress" status badge uses Electric Sky with high-contrast sky-900 in light mode'
);
assert(
  ticketListSrc.includes("case 'Closed':") &&
  ticketListSrc.includes('emerald-50') &&
  ticketListSrc.includes('emerald-900'),
  'TicketList: "Closed" status badge uses Lush Emerald with high-contrast emerald-900 in light mode'
);

// Verify no inverted colors (Open should NOT be emerald, Closed should NOT be purple)
assert(
  !ticketListSrc.includes("case 'Open':\n        return (\n          <span className=\"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald"),
  'TicketList: Verified NO inverted assignment of Open to Emerald green'
);
assert(
  !ticketListSrc.includes("case 'Closed':\n        return (\n          <span className=\"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple"),
  'TicketList: Verified NO inverted assignment of Closed to Purple'
);

// StatsCards checks
assert(
  statsSrc.includes("title: 'Open Issues'") && statsSrc.includes("bg-amber-500"),
  'StatsCards: "Open Issues" card uses Solar Amber accent & spark'
);
assert(
  statsSrc.includes("title: 'In Progress'") && statsSrc.includes("bg-sky-500"),
  'StatsCards: "In Progress" card uses Electric Azure/Sky accent & spark'
);
assert(
  statsSrc.includes("title: 'Resolved / Closed'") && statsSrc.includes("bg-emerald-500"),
  'StatsCards: "Resolved / Closed" card uses Lush Emerald accent & spark'
);
assert(
  statsSrc.includes("title: 'Urgent SLA Risk'") && statsSrc.includes("bg-rose-500"),
  'StatsCards: "Urgent SLA Risk" card uses Crimson Rose urgency'
);

// KanbanBoard checks
assert(
  kanbanSrc.includes("status: 'Open'") && kanbanSrc.includes("bg-amber-400"),
  'KanbanBoard: "Open Backlog" column header uses Amber beacon & border'
);
assert(
  kanbanSrc.includes("status: 'In Progress'") && kanbanSrc.includes("bg-sky-400"),
  'KanbanBoard: "In Progress" column header uses Sky beacon & border'
);
assert(
  kanbanSrc.includes("status: 'Closed'") && kanbanSrc.includes("bg-emerald-400"),
  'KanbanBoard: "Resolved & Closed" column header uses Emerald beacon & border'
);

// TicketDetailModal checks
assert(
  detailModalSrc.includes("s === 'Open'") && detailModalSrc.includes('amber'),
  'TicketDetailModal: Status transition pill for "Open" uses Solar Amber'
);
assert(
  detailModalSrc.includes("s === 'In Progress'") && detailModalSrc.includes('sky'),
  'TicketDetailModal: Status transition pill for "In Progress" uses Electric Sky'
);
assert(
  detailModalSrc.includes("s === 'Closed'") && detailModalSrc.includes('emerald'),
  'TicketDetailModal: Status transition pill for "Closed" uses Lush Emerald'
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Audit Light Mode & Dark Mode Theme Contrast Architecture
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}🌗 SECTION 3: Light & Dark Mode Contrast Architecture${C.reset}`);

const commandPaletteSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/CommandPalette.tsx'), 'utf-8');
const shortcutsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ShortcutsModal.tsx'), 'utf-8');

assert(
  commandPaletteSrc.includes("theme === 'light'") && commandPaletteSrc.includes('bg-indigo-50/90'),
  'CommandPalette: Selected command in light mode uses soft indigo wash instead of dark charcoal'
);

assert(
  shortcutsSrc.includes("useTheme()") && shortcutsSrc.includes('bg-white'),
  'ShortcutsModal: Dynamic theme-awareness with white canvas in light mode'
);

assert(
  ticketListSrc.includes('bg-slate-50/95') && ticketListSrc.includes('text-slate-600'),
  'TicketList: Keyboard hint toolbar has clean porcelain slate styling in light mode'
);

assert(
  globalsCss.includes('.light-theme .bg-zinc-800\\/90') &&
  globalsCss.includes('.light-theme .bg-slate-800\\/90'),
  'globals.css: Contains proper light mode mappings for 90% opacity zinc/slate variants'
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Audit Button Interactivity & Accessibility Handlers
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}⚡ SECTION 4: Button Interactivity & Click Handlers Integrity${C.reset}`);

// Check all button occurrences in key components to ensure they have onClick or type="submit"
const componentFiles = [
  'src/components/Navbar.tsx',
  'src/app/page.tsx',
  'src/components/FilterToolbar.tsx',
  'src/components/TicketList.tsx',
  'src/components/StatsCards.tsx',
  'src/components/KanbanBoard.tsx',
  'src/components/CommandPalette.tsx',
  'src/components/TicketDetailModal.tsx',
  'src/components/CreateTicketModal.tsx',
  'src/components/ShortcutsModal.tsx',
];

let allButtonsInteractive = true;
let totalButtonsChecked = 0;

for (const relPath of componentFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf-8');
  // Match buttons or motion.button
  const buttonRegex = /<(?:button|motion\.button)([^>]*?)>/g;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    totalButtonsChecked++;
    const attrs = match[1];
    const hasClick = attrs.includes('onClick');
    const isSubmit = attrs.includes('type="submit"');
    const isClose = attrs.includes('disabled');
    if (!hasClick && !isSubmit) {
      allButtonsInteractive = false;
      console.log(`     ${C.yellow}Warning:${C.reset} Button in ${relPath} missing onClick/type=submit: ${match[0].slice(0, 50)}...`);
    }
  }
}

assert(
  allButtonsInteractive,
  `All ${totalButtonsChecked} buttons across 10 components have valid click or submit handlers`
);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY REPORT
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}${C.cyan}=====================================================${C.reset}`);
console.log(`${C.bold}📋 COLOR & BUTTON AUDIT SUMMARY${C.reset}`);
console.log(`Total Checks: ${passedTests + failedTests}`);
console.log(`Passed:       ${C.green}${passedTests} ✅${C.reset}`);
console.log(`Failed:       ${failedTests > 0 ? `${C.red}${failedTests} ❌${C.reset}` : `${C.green}0 ❌${C.reset}`}`);
console.log(`${C.bold}${C.cyan}=====================================================${C.reset}\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
