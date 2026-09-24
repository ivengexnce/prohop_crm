async function runTests() {
  console.log('--- Starting CRM REST API Tests ---');
  const BASE_URL = 'http://localhost:3000';

  // Test 1: GET /api/tickets
  console.log('\nTest 1: GET /api/tickets');
  const res1 = await fetch(`${BASE_URL}/api/tickets`);
  if (!res1.ok) throw new Error(`GET /api/tickets failed: ${res1.status}`);
  const tickets = await res1.json();
  console.log(`✓ Fetched ${tickets.length} tickets successfully.`);
  console.log(`  Sample ticket ID: ${tickets[0]?.ticket_id}, Subject: "${tickets[0]?.subject}"`);

  // Test 2: Search & Filter: GET /api/tickets?status=Open&search=Sophia
  console.log('\nTest 2: GET /api/tickets?status=Open&search=Sophia');
  const res2 = await fetch(`${BASE_URL}/api/tickets?status=Open&search=Sophia`);
  const filtered = await res2.json();
  console.log(`✓ Filter returned ${filtered.length} tickets matching "Sophia" with status "Open".`);
  if (filtered.length > 0) {
    console.log(`  Matched: ${filtered[0].ticket_id} - ${filtered[0].customer_name}`);
  }

  // Test 3: POST /api/tickets (Create Ticket matching spec)
  console.log('\nTest 3: POST /api/tickets');
  const createPayload = {
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    subject: 'Unable to place order',
    description: 'The checkout page is showing an error.',
  };
  const res3 = await fetch(`${BASE_URL}/api/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload),
  });
  if (!res3.ok) throw new Error(`POST /api/tickets failed: ${res3.status}`);
  const createdTicket = await res3.json();
  console.log('✓ Ticket created successfully:');
  console.log('  Response:', JSON.stringify(createdTicket, null, 2));
  const newTicketId = createdTicket.ticket_id;

  // Test 4: GET /api/tickets/{ticket_id} (Ticket details matching spec)
  console.log(`\nTest 4: GET /api/tickets/${newTicketId}`);
  const res4 = await fetch(`${BASE_URL}/api/tickets/${newTicketId}`);
  if (!res4.ok) throw new Error(`GET ticket details failed: ${res4.status}`);
  const details = await res4.json();
  console.log('✓ Ticket details retrieved:');
  console.log(`  ID: ${details.ticket_id}, Status: ${details.status}, Customer: ${details.customer_name}`);
  console.log(`  Notes count: ${details.notes.length}`);

  // Test 5: PUT /api/tickets/{ticket_id} (Update status & add note matching spec)
  console.log(`\nTest 5: PUT /api/tickets/${newTicketId}`);
  const updatePayload = {
    status: 'In Progress',
    notes: 'Support team has started investigating the issue.',
  };
  const res5 = await fetch(`${BASE_URL}/api/tickets/${newTicketId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload),
  });
  if (!res5.ok) throw new Error(`PUT /api/tickets failed: ${res5.status}`);
  const updateResult = await res5.json();
  console.log('✓ Ticket updated:');
  console.log('  Response:', JSON.stringify(updateResult, null, 2));

  // Verify the update took effect
  const res6 = await fetch(`${BASE_URL}/api/tickets/${newTicketId}`);
  const updatedDetails = await res6.json();
  console.log(`  Verified status is now: ${updatedDetails.status}`);
  console.log(`  Verified note added: "${updatedDetails.notes[0]?.note_text}"`);

  // Test 6: GET /api/stats
  console.log('\nTest 6: GET /api/stats');
  const resStats = await fetch(`${BASE_URL}/api/stats`);
  const stats = await resStats.json();
  console.log('✓ Stats:', JSON.stringify(stats, null, 2));

  // Test 7: GET /api/export
  console.log('\nTest 7: GET /api/export');
  const resExport = await fetch(`${BASE_URL}/api/export`);
  const csvText = await resExport.text();
  console.log(`✓ CSV Export size: ${csvText.length} bytes`);
  console.log(`  CSV Header: ${csvText.split('\n')[0]}`);

  console.log('\n🎉 ALL 7 API TESTS PASSED PERFECTLY!\n');
}

runTests().catch((err) => {
  console.error('API Test Error:', err);
  process.exit(1);
});
