import { prisma } from '../src/lib/prisma';

const BASE_URL = 'http://localhost:3088';
const BASE_PATH = '/secretSanta';

interface TestResult {
  passed: boolean;
  name: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (!condition) {
    results.push({ passed: false, name, details });
    console.error(`❌ FAIL: ${name} ${details ? '- ' + details : ''}`);
  } else {
    results.push({ passed: true, name });
    console.log(`✅ PASS: ${name}`);
  }
}

async function runE2E() {
  console.log('=== TEST SUITE 4: Next.js Production Build, BasePath & Live HTTP E2E ===\n');

  // Wait for server to be responsive
  let ready = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${BASE_PATH}`);
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  assert(ready, 'Next.js server is alive and responding at basePath /secretSanta');

  // 1. Verify root `/` without basePath returns 404
  const rootRes = await fetch(`${BASE_URL}/`);
  assert(rootRes.status === 404, 'Root path / without basePath returns HTTP 404');

  // 2. Verify GET /secretSanta returns 200 and loads HTML with static assets
  const homeRes = await fetch(`${BASE_URL}${BASE_PATH}`);
  assert(homeRes.status === 200, 'GET /secretSanta returns HTTP 200 OK');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('Secret Santa') || homeHtml.includes('Holiday'), 'GET /secretSanta returns Secret Santa HTML page');

  // Extract a static JS script chunk from the HTML to verify asset loading
  const scriptMatch = homeHtml.match(/\/secretSanta\/_next\/static\/chunks\/[a-zA-Z0-9_\-.]+\.js/);
  assert(Boolean(scriptMatch), 'HTML links to static asset chunks with /secretSanta prefix');
  if (scriptMatch) {
    const chunkUrl = `${BASE_URL}${scriptMatch[0]}`;
    const chunkRes = await fetch(chunkUrl);
    assert(chunkRes.status === 200, `Static JS chunk ${scriptMatch[0]} returns HTTP 200 OK`);
    const contentType = chunkRes.headers.get('content-type') || '';
    assert(
      contentType.includes('javascript') || contentType.includes('application/octet-stream'),
      `Static JS chunk has valid JavaScript content-type (${contentType})`
    );
  }

  // 3. Verify POST /secretSanta/api/sessions (Create Session over HTTP)
  console.log('\n--- Live HTTP API Session Creation ---');
  const createRes = await fetch(`${BASE_URL}${BASE_PATH}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'E2E Production Live Exchange',
      budget: '$50',
      exchangeDate: '2026-12-25',
    }),
  });
  assert(createRes.status === 201, 'POST /secretSanta/api/sessions returns HTTP 201 Created');
  const createData = await createRes.json();
  assert(Boolean(createData.session?.id), 'Created session ID returned over HTTP');
  assert(Boolean(createData.adminKey), 'Admin key returned over HTTP');

  const sessionId = createData.session.id;
  const adminKey = createData.adminKey;

  // 4. Verify GET /secretSanta/session/[id] (Session UI Page over HTTP)
  const sessionPageRes = await fetch(`${BASE_URL}${BASE_PATH}/session/${sessionId}`);
  assert(sessionPageRes.status === 200, `GET /secretSanta/session/${sessionId} returns HTTP 200 OK`);
  const sessionPageHtml = await sessionPageRes.text();
  assert(
    sessionPageHtml.includes('<!DOCTYPE html>') || sessionPageHtml.includes('<html'),
    'Session UI page serves valid HTML document'
  );

  // 5. Verify Join Participants over HTTP
  console.log('\n--- Live HTTP Join Participants ---');
  const participants = [
    { name: 'Rudolph', surname: 'Reindeer', email: 'rudolph@northpole.live', wishlist: 'Carrots', hobbies: 'Flying in snow' },
    { name: 'Hermey', surname: 'Elf', email: 'hermey@northpole.live', wishlist: 'Dental tools', hobbies: 'Dentistry' },
    { name: 'Yukon', surname: 'Cornelius', email: 'yukon@northpole.live', wishlist: 'Pickaxe', hobbies: 'Prospecting gold' },
  ];

  for (const p of participants) {
    const joinRes = await fetch(`${BASE_URL}${BASE_PATH}/api/sessions/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    assert(joinRes.status === 201, `Join ${p.name} over HTTP returns HTTP 201 Created`);
    const joinData = await joinRes.json();
    assert(!joinData.email, `Join HTTP response does NOT include email for ${p.name}`);
  }

  // 6. Verify Public Roster Endpoint over HTTP
  console.log('\n--- Live HTTP GET /api/sessions/[id] Privacy & Integrity ---');
  const getRosterRes = await fetch(`${BASE_URL}${BASE_PATH}/api/sessions/${sessionId}`);
  assert(getRosterRes.status === 200, 'GET /secretSanta/api/sessions/[id] returns HTTP 200');
  const rosterData = await getRosterRes.json();
  const rosterJsonStr = JSON.stringify(rosterData);

  assert(rosterData.participantCount === 3, 'HTTP roster participantCount is 3');
  assert(rosterData.participants.length === 3, 'HTTP roster participants array has 3 entries');

  // Strict check that no participant emails are leaked anywhere on the wire
  for (const p of participants) {
    assert(
      !rosterJsonStr.includes(p.email),
      `Zero leakage: Email '${p.email}' is completely absent from live HTTP response`
    );
  }
  assert(!rosterJsonStr.includes('passwordHash'), 'Zero leakage: passwordHash is absent');
  assert(!rosterJsonStr.includes('adminKeyHash'), 'Zero leakage: adminKeyHash is absent');

  // 7. Verify Live HTTP Draw Endpoint with Host Admin Key
  console.log('\n--- Live HTTP Draw Execution with Admin Key ---');
  const drawRes = await fetch(`${BASE_URL}${BASE_PATH}/api/sessions/${sessionId}/draw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminKey }),
  });
  assert(drawRes.status === 200, 'POST /secretSanta/api/sessions/[id]/draw returns HTTP 200 OK');
  const drawData = await drawRes.json();
  assert(drawData.success === true, 'Draw HTTP response indicates success: true');
  assert(drawData.status === 'LOCKED', 'Draw HTTP response confirms status is LOCKED');
  assert(drawData.matchesDrawn === 3, 'Draw HTTP response confirms 3 matches drawn');

  // 8. Verify State Lock: Disallowing Join after draw over HTTP
  const postLockJoin = await fetch(`${BASE_URL}${BASE_PATH}/api/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Late',
      surname: 'Elf',
      email: 'lateelf@northpole.live',
    }),
  });
  assert(postLockJoin.status === 400, 'POST join after draw over HTTP returns HTTP 400');
  const postLockData = await postLockJoin.json();
  assert(postLockData.error === 'Submissions have ended', 'Error message matches "Submissions have ended"');

  // Clean up
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
  console.log('\nCleaned up E2E live session from database.');

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} E2E test(s) failed!`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${results.length} Next.js basePath & live HTTP E2E tests PASSED!`);
  }
}

runE2E().catch((e) => {
  console.error('Fatal E2E error:', e);
  process.exit(1);
});
