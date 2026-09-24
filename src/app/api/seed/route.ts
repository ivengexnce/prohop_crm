import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete existing notes and tickets
    await prisma.note.deleteMany({});
    await prisma.ticket.deleteMany({});

    const sampleTickets = [
      {
        ticket_id: 'TKT-001',
        customer_name: 'Sophia Martinez',
        customer_email: 'sophia.m@enterprise.io',
        subject: 'Unable to process checkout payment with corporate Visa',
        description: 'During checkout on step 3 (Payment Information), the page hangs with a loading spinner after entering card details. Received 500 error code in browser devtools.',
        status: 'Open',
        priority: 'Urgent',
        category: 'Billing',
        created_at: new Date(Date.now() - 1000 * 60 * 45),
        notes: [
          {
            note_text: 'Issue logged via web portal. Automated payment gateway health check reported intermittent latency on EU stripe connector.',
            author: 'System Monitor',
            is_internal: true,
            created_at: new Date(Date.now() - 1000 * 60 * 40),
          },
        ],
      },
      {
        ticket_id: 'TKT-002',
        customer_name: 'David Kim',
        customer_email: 'david.kim@techstart.co',
        subject: 'API Webhook signatures failing validation after v2.4 upgrade',
        description: 'Since 08:00 UTC today, all incoming payload signatures sent by your webhooks fail HMAC SHA-256 verification against our shared secret key.',
        status: 'In Progress',
        priority: 'High',
        category: 'Technical',
        created_at: new Date(Date.now() - 1000 * 60 * 180),
        notes: [
          {
            note_text: 'Senior engineer assigned. Verified that the v2.4 deployment changed payload serialization to compact JSON.',
            author: 'Alex Vance (Tier 3)',
            is_internal: true,
            created_at: new Date(Date.now() - 1000 * 60 * 120),
          },
          {
            note_text: 'Hello David, our engineering team identified that whitespace trimming in webhook payload serialization caused this mismatch. A hotfix patch is being deployed.',
            author: 'Sarah Jenkins (Support Lead)',
            is_internal: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60),
          },
        ],
      },
      {
        ticket_id: 'TKT-003',
        customer_name: 'Elena Rostova',
        customer_email: 'elena@novadesign.org',
        subject: 'Request for custom team role permissions (Viewer + Export)',
        description: 'We need our financial auditors to view all project reports and export analytics without having permissions to modify client data or create campaigns.',
        status: 'Open',
        priority: 'Medium',
        category: 'Feature Request',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6),
        notes: [
          {
            note_text: 'Ticket tagged for Q4 Product Roadmap review under Custom RBAC milestone.',
            author: 'Product Liaison',
            is_internal: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5),
          },
        ],
      },
      {
        ticket_id: 'TKT-004',
        customer_name: 'Marcus Brody',
        customer_email: 'm.brody@globallogistics.com',
        subject: 'Password reset email link expired immediately upon receipt',
        description: 'Triggered password reset 3 times. Every time the email arrives 10 minutes later and clicking the link shows "Reset token has expired".',
        status: 'Closed',
        priority: 'High',
        category: 'Account',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
        notes: [
          {
            note_text: 'Investigated email delivery latency. Customer company mail filter greylisting caused 12-minute delay against 10-minute token TTL.',
            author: 'DevOps Team',
            is_internal: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 22),
          },
          {
            note_text: 'Extended password reset token validity to 60 minutes and verified Marcus successfully authenticated and regained account access.',
            author: 'Sarah Jenkins (Support Lead)',
            is_internal: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 20),
          },
        ],
      },
      {
        ticket_id: 'TKT-005',
        customer_name: 'Chloe Tremblay',
        customer_email: 'chloe.t@montreal-saas.ca',
        subject: 'Invoice PDF generation missing VAT registration number',
        description: 'Our monthly invoice for August does not display our verified Canadian GST/HST registration number. Our accounting team requires this for tax deduction.',
        status: 'In Progress',
        priority: 'Medium',
        category: 'Billing',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12),
        notes: [
          {
            note_text: 'Verified tax ID is correctly present in Stripe Customer metadata. Regeneration of August invoice PDF underway.',
            author: 'Billing Operations',
            is_internal: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 4),
          },
        ],
      },
      {
        ticket_id: 'TKT-006',
        customer_name: 'Liam O\'Connor',
        customer_email: 'liam@celticcloud.ie',
        subject: 'CSV export failing on datasets larger than 10,000 rows',
        description: 'When filtering records for the entire year and clicking "Export CSV", the request times out after 30 seconds with gateway timeout 504.',
        status: 'Open',
        priority: 'High',
        category: 'Technical',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 18),
        notes: [],
      },
      {
        ticket_id: 'TKT-007',
        customer_name: 'Ananya Patel',
        customer_email: 'ananya.p@zenithfin.com',
        subject: 'Two-factor SMS verification code not delivering to Indian telecom carriers',
        description: 'Users on Airtel and Jio networks are not receiving the 6-digit SMS OTP when logging into their dashboard.',
        status: 'In Progress',
        priority: 'Urgent',
        category: 'Account',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8),
        notes: [
          {
            note_text: 'Escalated to Twilio carrier relations. DLT template registration approval required by Indian TRAI regulations.',
            author: 'Security Admin',
            is_internal: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 6),
          },
          {
            note_text: 'Offered temporary Authenticator App (TOTP) fallback method while carrier template approval is processing.',
            author: 'Alex Vance (Tier 3)',
            is_internal: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 3),
          },
        ],
      },
      {
        ticket_id: 'TKT-008',
        customer_name: 'Oliver Hansen',
        customer_email: 'oliver@nordicnord.se',
        subject: 'Inquiry regarding SAML 2.0 Okta Single Sign-On integration',
        description: 'We are expanding to 200 team members and would like to configure Okta SSO. Please send documentation and metadata endpoint URLs.',
        status: 'Closed',
        priority: 'Low',
        category: 'General',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48),
        notes: [
          {
            note_text: 'Sent Enterprise SSO configuration guide and scheduled an onboarding session with Solutions Architect.',
            author: 'Enterprise Support',
            is_internal: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 40),
          },
        ],
      },
    ];

    for (const item of sampleTickets) {
      const { notes, ...ticketData } = item;
      const ticket = await prisma.ticket.create({
        data: ticketData,
      });

      if (notes && notes.length > 0) {
        for (const note of notes) {
          await prisma.note.create({
            data: {
              ticket_id: ticket.ticket_id,
              note_text: note.note_text,
              author: note.author,
              is_internal: note.is_internal,
              created_at: note.created_at,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reset complete. Seeded ${sampleTickets.length} tickets.`,
      count: sampleTickets.length,
    });
  } catch (error: any) {
    console.error('Error resetting database seed:', error);
    return NextResponse.json(
      { error: 'Failed to reset seed data', details: error.message },
      { status: 500 }
    );
  }
}
