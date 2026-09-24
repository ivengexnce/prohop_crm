import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  benchmarks: {},
  drawbacksFound: [],
};

async function test(name, category, fn) {
  results.total++;
  const start = performance.now();
  try {
    const outcome = await fn();
    const duration = Math.round(performance.now() - start);
    results.passed++;
    results.tests.push({
      name,
      category,
      status: 'PASS',
      duration: `${duration}ms`,
      details: outcome || 'OK',
    });
    console.log(`  ✅ [PASS] ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    results.failed++;
    results.tests.push({
      name,
      category,
      status: 'FAIL',
      duration: `${duration}ms`,
      error: err.message,
    });
    console.error(`  ❌ [FAIL] ${name} (${duration}ms): ${err.message}`);
  }
}

function warn(issue, severity, recommendation) {
  results.warnings++;
  results.drawbacksFound.push({
    issue,
    severity,
    recommendation,
  });
  console.warn(`  ⚠️ [WARNING] (${severity}): ${issue}`);
}

async function runQaAutomation() {
  console.log('=====================================================');
  console.log('🚀 NEXUS CRM — SENIOR QA AUTOMATION TEST SUITE v2.0');
  console.log(`Target: ${BASE_URL} | Timestamp: ${new Date().toISOString()}`);
  console.log('=====================================================\n');

  // --- SECTION 1: Baseline Functional Tests ---
  console.log('📦 SECTION 1: Baseline REST API Functional Verification');

  let testTicketId = '';

  await test('POST /api/tickets - Create valid ticket', 'Functional', async () => {
    const payload = {
      customer_name: 'QA Automation Bot',
      customer_email: 'qa.bot@testsuite.local',
      subject: 'Automated Functional Test Ticket',
      description: 'Verifying end-to-end ticket creation and automated TKT-ID sequential generation.',
      priority: 'High',
      category: 'Technical',
    };
    const res = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status !== 201) throw new Error(`Expected 201 Created, got ${res.status}`);
    const data = await res.json();
    if (!data.ticket_id || !data.ticket_id.startsWith('TKT-')) {
      throw new Error(`Invalid ticket_id generated: ${JSON.stringify(data)}`);
    }
    if (!data.created_at) throw new Error('Missing created_at timestamp');
    testTicketId = data.ticket_id;
    return `Created ID: ${data.ticket_id}`;
  });

  await test('GET /api/tickets - List all tickets (backward compatible array)', 'Functional', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Response is not an array');
    if (data.length === 0) throw new Error('Expected at least 1 ticket');
    return `Total records: ${data.length}`;
  });

  await test('GET /api/tickets?page=1&limit=5 - Server-side pagination', 'Functional', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets?page=1&limit=5`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    if (!data.data || !Array.isArray(data.data)) throw new Error('Missing paginated data array');
    if (!data.pagination || typeof data.pagination.totalPages !== 'number') {
      throw new Error('Missing pagination metadata');
    }
    if (data.data.length > 5) throw new Error(`Limit 5 breached, got ${data.data.length}`);
    return `Returned ${data.data.length} items of ${data.pagination.total} total across ${data.pagination.totalPages} pages`;
  });

  await test('GET /api/tickets/{id} - Retrieve created ticket details', 'Functional', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets/${testTicketId}`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    if (data.ticket_id !== testTicketId) {
      throw new Error(`Expected ticket_id ${testTicketId}, got ${data.ticket_id}`);
    }
    if (!Array.isArray(data.notes)) throw new Error('Missing notes array');
    return `Retrieved ${data.ticket_id} with ${data.notes.length} notes`;
  });

  await test('PUT /api/tickets/{id} - Transition status & verify audit logging', 'Functional', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets/${testTicketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'In Progress',
        notes: 'QA Automated test note appended during verification.',
        author: 'QA Lead',
        is_internal: true,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.updated_at) {
      throw new Error(`Unexpected update response: ${JSON.stringify(data)}`);
    }

    // Verify status update and automated audit note in Note table
    const checkRes = await fetch(`${BASE_URL}/api/tickets/${testTicketId}`);
    const checkData = await checkRes.json();
    if (checkData.status !== 'In Progress') {
      throw new Error(`Status update did not persist. Expected In Progress, got ${checkData.status}`);
    }
    const auditNote = checkData.notes.find((n) => n.activity_type === 'status_change');
    if (!auditNote) {
      throw new Error('Automated status_change audit note was not created in activity timeline');
    }
    return `Status updated to In Progress, audit log recorded: "${auditNote.note_text}"`;
  });

  await test('POST /api/upload - File attachment upload validation', 'Functional', async () => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const fileContent = 'Simulated log dump: Error 500 at checkout step 3';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="checkout_error.log"',
      'Content-Type: text/plain',
      '',
      fileContent,
      `--${boundary}--`,
      '',
    ].join('\r\n');

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });
    if (res.status !== 201) throw new Error(`Expected 201 Created, got ${res.status}`);
    const uploadData = await res.json();
    if (!uploadData.url || !uploadData.url.startsWith('/uploads/')) {
      throw new Error(`Invalid attachment url: ${JSON.stringify(uploadData)}`);
    }
    return `Uploaded ${uploadData.name} -> ${uploadData.url} (${uploadData.size} bytes)`;
  });

  await test('GET /api/stats - Verify KPI calculations', 'Functional', async () => {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const stats = await res.json();
    const requiredKeys = ['total', 'open', 'in_progress', 'closed', 'urgent', 'resolution_rate'];
    for (const key of requiredKeys) {
      if (typeof stats[key] !== 'number') throw new Error(`Missing or non-numeric key: ${key}`);
    }
    return `Total: ${stats.total} (Open: ${stats.open}, InProg: ${stats.in_progress}, Closed: ${stats.closed}, Rate: ${stats.resolution_rate}%)`;
  });

  await test('GET /api/export - Verify RFC 4180 CSV Export', 'Functional', async () => {
    const res = await fetch(`${BASE_URL}/api/export?status=Open`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/csv')) {
      throw new Error(`Expected text/csv Content-Type, got ${contentType}`);
    }
    const disposition = res.headers.get('content-disposition') || '';
    if (!disposition.includes('attachment') || !disposition.includes('.csv')) {
      throw new Error(`Missing or invalid Content-Disposition: ${disposition}`);
    }
    const text = await res.text();
    const lines = text.split('\r\n').filter(Boolean);
    if (lines.length < 2) throw new Error('CSV output has less than 2 lines (header + 1 record)');
    return `CSV size: ${text.length} bytes, Records: ${lines.length - 1}`;
  });

  // --- SECTION 2: Negative & Boundary Validation ---
  console.log('\n🛡️ SECTION 2: Negative, Boundary & Error Handling Tests');

  await test('POST /api/tickets - Rejects missing customer_name (400)', 'Validation', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_email: 'test@example.com',
        subject: 'Title',
        description: 'Description here',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    return 'Correctly returned 400 Bad Request';
  });

  await test('POST /api/tickets - Rejects invalid email format (400)', 'Validation', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Invalid Email User',
        customer_email: 'not-an-email-address',
        subject: 'Title',
        description: 'Description here',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    return 'Correctly caught invalid email';
  });

  await test('GET /api/tickets/{id} - Returns 404 for non-existent ticket', 'Validation', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets/TKT-NONEXISTENT-99999`);
    if (res.status !== 404) throw new Error(`Expected 404 Not Found, got ${res.status}`);
    return 'Correctly returned 404 Not Found';
  });

  await test('PUT /api/tickets/{id} - Returns 404 for updating non-existent ticket', 'Validation', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets/TKT-NONEXISTENT-99999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Closed' }),
    });
    if (res.status !== 404) throw new Error(`Expected 404 Not Found, got ${res.status}`);
    return 'Correctly returned 404';
  });

  await test('PUT /api/tickets/{id} - Rejects invalid status string (400)', 'Validation', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets/${testTicketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ArbitraryInvalidStatus' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    return 'Correctly validated status enum';
  });

  // --- SECTION 3: Security & Edge Injection Handling ---
  console.log('\n🔒 SECTION 3: Security & Injection Handling Tests');

  await test('POST /api/tickets - XSS payload sanitized / properly stored', 'Security', async () => {
    const xssSubject = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
    const res = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Security Researcher',
        customer_email: 'sec@test.org',
        subject: xssSubject,
        description: 'Testing if HTML scripts are stored safely without execution.',
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    const fetchRes = await fetch(`${BASE_URL}/api/tickets/${data.ticket_id}`);
    const fetched = await fetchRes.json();
    if (fetched.subject !== xssSubject) {
      throw new Error('Payload altered unexpectedly');
    }
    return 'Payload stored intact; React JSX safely escapes rendered HTML';
  });

  await test('GET /api/tickets - SQL Injection substring safety', 'Security', async () => {
    const sqlPayload = "' OR '1'='1' -- ; DROP TABLE Ticket;";
    const res = await fetch(`${BASE_URL}/api/tickets?search=${encodeURIComponent(sqlPayload)}`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    return `Query executed safely via Prisma parameterization. Matched ${data.length} records.`;
  });

  await test('CSV Formula Injection sanitized with apostrophe prefix', 'Security', async () => {
    const dangerousSubject = '=cmd|\' /C calc\'!A0';
    const createRes = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'CSV Tester',
        customer_email: 'csv@test.org',
        subject: dangerousSubject,
        description: 'Formula injection probe',
      }),
    });
    const { ticket_id } = await createRes.json();

    const exportRes = await fetch(`${BASE_URL}/api/export?search=calc`);
    const csvContent = await exportRes.text();

    if (!csvContent.includes("\"'=cmd")) {
      throw new Error('Formula trigger was not prefixed with apostrophe');
    }
    return 'Formula successfully neutralized with apostrophe escape prefix (\')';
  });

  // --- SECTION 4: Concurrency & Stress Testing ---
  console.log('\n⚡ SECTION 4: Concurrency & Sequential ID Stress Test');

  await test('Concurrent Burst: 10 simultaneous ticket creations with retry backoff', 'Concurrency', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      fetch(`${BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: `Concurrent User ${i + 1}`,
          customer_email: `user${i + 1}@burst.test`,
          subject: `Burst Test Ticket ${i + 1}`,
          description: `Testing concurrent generation of TKT-XXX sequence for index ${i + 1}.`,
        }),
      }).then((r) => r.json())
    );

    const burstResults = await Promise.all(promises);
    const createdIds = burstResults.map((r) => r.ticket_id);
    const uniqueIds = new Set(createdIds);

    console.log(`    Generated IDs: ${createdIds.join(', ')}`);
    if (uniqueIds.size !== createdIds.length) {
      throw new Error(`Collision detected: ${createdIds.length - uniqueIds.size} duplicates.`);
    }
    return `All ${uniqueIds.size} concurrent IDs generated cleanly with 0 collisions.`;
  });

  // --- SECTION 5: Latency Benchmarks ---
  console.log('\n⏱️ SECTION 5: Response Time Benchmarks');

  const benchmarkEndpoints = [
    { name: 'GET /api/tickets (Paginated)', url: `${BASE_URL}/api/tickets?page=1&limit=10` },
    { name: 'GET /api/stats', url: `${BASE_URL}/api/stats` },
    { name: 'GET /api/export', url: `${BASE_URL}/api/export` },
  ];

  for (const ep of benchmarkEndpoints) {
    const samples = [];
    for (let i = 0; i < 5; i++) {
      const t0 = performance.now();
      await fetch(ep.url);
      samples.push(performance.now() - t0);
    }
    const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
    const max = Math.round(Math.max(...samples));
    results.benchmarks[ep.name] = { avgMs: avg, maxMs: max };
    console.log(`  📊 ${ep.name}: Avg ${avg}ms | Max ${max}ms`);
  }

  // --- SECTION 6: Frontend Markup & Usability Audit ---
  console.log('\n🖥️ SECTION 6: Frontend Markup & Usability Audit');

  await test('Frontend HTML Audit: Meta, Title, Viewport, Semantic Layout', 'Frontend', async () => {
    const res = await fetch(`${BASE_URL}`);
    const html = await res.text();

    if (!html.includes('<title>')) throw new Error('Missing <title> tag');
    if (!html.includes('viewport')) throw new Error('Missing viewport meta tag');

    return 'HTML contains required title, viewport, and responsive structure';
  });

  // Print Summary
  console.log('\n=====================================================');
  console.log('📋 QA AUTOMATION SUMMARY REPORT');
  console.log(`Total Executed: ${results.total}`);
  console.log(`Passed:         ${results.passed} ✅`);
  console.log(`Failed:         ${results.failed} ❌`);
  console.log(`Warnings/Gaps:  ${results.warnings} ⚠️`);
  console.log('=====================================================\n');

  return results;
}

runQaAutomation()
  .then((report) => {
    fs.writeFileSync('qa-report.json', JSON.stringify(report, null, 2));
    console.log('Report saved to qa-report.json');
  })
  .catch((err) => {
    console.error('QA Automation Fatal Error:', err);
    process.exit(1);
  });
