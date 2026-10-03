import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/prisma';
import { POST as createSessionHandler } from '../src/app/api/sessions/route';
import { GET as getSessionHandler } from '../src/app/api/sessions/[id]/route';
import { POST as verifyPasswordHandler } from '../src/app/api/sessions/[id]/verify-password/route';
import { POST as joinSessionHandler } from '../src/app/api/sessions/[id]/join/route';
import { POST as drawSessionHandler } from '../src/app/api/sessions/[id]/draw/route';
import { generateSantaPoem, generateGiftIdeas } from '../src/lib/ai';

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

// Helper to deeply check that sensitive keys and values do not appear in an object
function assertNoSensitiveData(obj: any, sensitiveStrings: string[], contextName: string) {
  const jsonStr = JSON.stringify(obj);

  // Check forbidden property keys
  const forbiddenKeys = ['email', 'passwordHash', 'adminKeyHash', 'giverEmail', 'receiverEmail', 'wishlist', 'hobbies'];
  
  function checkKeys(current: any, path = '') {
    if (!current || typeof current !== 'object') return;
    for (const key of Object.keys(current)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (forbiddenKeys.includes(key)) {
        assert(false, `Privacy Guard (${contextName}): Key '${currentPath}' must NOT be in public payload`, `Found forbidden key ${key}`);
      }
      checkKeys(current[key], currentPath);
    }
  }

  checkKeys(obj);

  // Check forbidden substrings (like emails or raw passwords)
  for (const s of sensitiveStrings) {
    if (s && s.length > 3) {
      const leaked = jsonStr.toLowerCase().includes(s.toLowerCase());
      assert(!leaked, `Privacy Guard (${contextName}): Sensitive value '${s}' must NOT appear in payload JSON`, leaked ? `Value was leaked in JSON!` : undefined);
    }
  }
}

async function runTests() {
  console.log('=== TEST SUITE 2 & 3: Security, Privacy, AI Fallback, and Lifecycle ===\n');

  // Ensure clean test state without GEMINI_API_KEY
  delete process.env.GEMINI_API_KEY;
  delete process.env.RESEND_API_KEY;

  // ----------------------------------------------------
  // Test 1: Santa AI Offline Fallback Verification
  // ----------------------------------------------------
  console.log('--- Testing Santa AI Fallback (No GEMINI_API_KEY) ---');
  const poem = await generateSantaPoem('Kris', 'Clara');
  assert(
    typeof poem === 'string' && poem.length > 20,
    'AI Fallback: Generates festive poem without GEMINI_API_KEY',
    `Poem length: ${poem.length}`
  );
  assert(
    poem.includes('Kris') && poem.includes('Clara'),
    'AI Fallback: Poem includes giver and receiver names'
  );
  const poemLines = poem.split('\n').filter((l) => l.trim().length > 0);
  assert(
    poemLines.length === 4,
    'AI Fallback: Poem has exactly 4 rhyming lines',
    `Lines: ${poemLines.length}`
  );

  const gifts = await generateGiftIdeas(
    'Clara',
    'Espresso beans, Wool scarf',
    'Specialty coffee, reading winter books',
    '$30'
  );
  assert(
    Array.isArray(gifts) && gifts.length === 3,
    'AI Fallback: Generates exactly 3 gift suggestions without GEMINI_API_KEY',
    `Gift count: ${gifts.length}`
  );
  assert(
    gifts.some((g) => g.toLowerCase().includes('coffee') || g.toLowerCase().includes('espresso') || g.toLowerCase().includes('wishlist')),
    'AI Fallback: Gift ideas incorporate receiver wishlist / hobbies',
    `Gifts: ${JSON.stringify(gifts)}`
  );

  // ----------------------------------------------------
  // Test 2: Standard Session Lifecycle & Email Privacy
  // ----------------------------------------------------
  console.log('\n--- Testing Standard Session Creation & Public Roster Privacy ---');

  // Create session
  const createReq = new NextRequest('http://localhost:3000/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Secret Santa Tech Team 2026',
      budget: '$35',
      exchangeDate: '2026-12-24',
    }),
  });
  const createRes = await createSessionHandler(createReq);
  const createData = await createRes.json();

  assert(createRes.status === 201, 'Host creates session -> HTTP 201 Created');
  assert(Boolean(createData.session?.id), 'Session created with valid ID');
  assert(Boolean(createData.adminKey), 'Admin key returned to host upon creation');
  
  const sessionId = createData.session.id;
  const adminKey = createData.adminKey;

  // Verify initial status is "OPEN"
  const getInitialReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}`);
  const getInitialRes = await getSessionHandler(getInitialReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  const initialData = await getInitialRes.json();
  assert(initialData.status === 'OPEN', 'Initial session status is "OPEN"');
  assert(initialData.participantCount === 0, 'Initial participantCount is 0');
  assert(Array.isArray(initialData.participants) && initialData.participants.length === 0, 'Initial participants list is empty');

  // Join 3 participants with sensitive data (emails, wishlists, hobbies)
  const participantsData = [
    {
      name: 'Alice',
      surname: 'Smith',
      email: 'alice.smith.secret@corp.example',
      wishlist: 'Noise-canceling headphones, Mechanical keyboard',
      hobbies: 'Gaming, Sci-fi literature',
    },
    {
      name: 'Bob',
      surname: 'Jones',
      email: 'bob.jones.secret@corp.example',
      wishlist: 'Pour-over coffee kettle, French roast beans',
      hobbies: 'Coffee brewing, Hiking',
    },
    {
      name: 'Charlie',
      surname: 'Brown',
      email: 'charlie.brown.secret@corp.example',
      wishlist: 'Warm merino wool socks, Sketchbook',
      hobbies: 'Drawing, Baking sourdough',
    },
  ];

  for (const p of participantsData) {
    const joinReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify(p),
    });
    const joinRes = await joinSessionHandler(joinReq, {
      params: Promise.resolve({ id: sessionId }),
    });
    const joinData = await joinRes.json();
    assert(joinRes.status === 201, `Participant ${p.name} joins -> HTTP 201 Created`);
    assert(joinData.name === p.name, `Response contains participant name ${p.name}`);
    // Check that join response does not leak email
    assert(!joinData.email, `Join response does not include email for ${p.name}`);
  }

  // Duplicate email detection test
  console.log('\n--- Testing Duplicate Email Rejection ---');
  const duplicateReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/join`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Alice Fake',
      surname: 'Imposter',
      email: 'ALICE.SMITH.SECRET@CORP.EXAMPLE', // test case-insensitivity
    }),
  });
  const duplicateRes = await joinSessionHandler(duplicateReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  const duplicateData = await duplicateRes.json();
  assert(
    duplicateRes.status === 400,
    'Duplicate email join returns HTTP 400',
    `Status: ${duplicateRes.status}`
  );
  assert(
    duplicateData.error && duplicateData.error.includes('already registered'),
    'Duplicate email returns appropriate error message'
  );

  // Missing fields validation
  const missingEmailReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/join`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dave',
      surname: 'Miller',
      email: 'invalid-email-address',
    }),
  });
  const missingEmailRes = await joinSessionHandler(missingEmailReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  assert(missingEmailRes.status === 400, 'Invalid email format returns HTTP 400');

  // Verify GET /api/sessions/[id] Public Roster & Zero-Leakage Privacy Guard
  console.log('\n--- Testing GET /api/sessions/[id] Privacy Guard Invariants ---');
  const getRosterReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}`);
  const getRosterRes = await getSessionHandler(getRosterReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  const rosterData = await getRosterRes.json();

  assert(getRosterRes.status === 200, 'GET /api/sessions/[id] returns HTTP 200');
  assert(rosterData.participantCount === 3, 'participantCount is 3');
  assert(rosterData.participants.length === 3, 'participants list length is 3');

  // Verify that each public participant has ONLY id, name, surname, joinedAt
  for (const p of rosterData.participants) {
    const keys = Object.keys(p).sort();
    assert(
      JSON.stringify(keys) === JSON.stringify(['id', 'joinedAt', 'name', 'surname'].sort()),
      `Public participant object has ONLY [id, joinedAt, name, surname] - Got: ${keys.join(', ')}`
    );
  }

  // Deep sensitive data scan across the entire response JSON
  assertNoSensitiveData(
    rosterData,
    [
      'alice.smith.secret@corp.example',
      'bob.jones.secret@corp.example',
      'charlie.brown.secret@corp.example',
      'Noise-canceling headphones',
      'Pour-over coffee kettle',
      'Warm merino wool socks',
    ],
    'Public Session Roster'
  );

  // ----------------------------------------------------
  // Test 3: Password-Gated Session Security
  // ----------------------------------------------------
  console.log('\n--- Testing Password-Gated Session Security & Verification ---');
  const secretPassword = 'FestiveSecretPass2026!';
  const pwSessionReq = new NextRequest('http://localhost:3000/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Top Secret VIP Santa',
      password: secretPassword,
    }),
  });
  const pwSessionRes = await createSessionHandler(pwSessionReq);
  const pwSessionData = await pwSessionRes.json();
  const pwSessionId = pwSessionData.session.id;
  const pwAdminKey = pwSessionData.adminKey;

  // Add a participant to password-protected session
  await joinSessionHandler(
    new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}/join`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'VipGuest',
        surname: 'One',
        email: 'vipguest@secret.org',
        wishlist: 'Gold coin',
        hobbies: 'Collecting',
      }),
    }),
    { params: Promise.resolve({ id: pwSessionId }) }
  );

  // Unauthorized GET request to password-protected session
  const unauthGetReq = new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}`);
  const unauthGetRes = await getSessionHandler(unauthGetReq, {
    params: Promise.resolve({ id: pwSessionId }),
  });
  const unauthGetData = await unauthGetRes.json();

  assert(unauthGetData.isPasswordProtected === true, 'Session identifies as password protected');
  assert(unauthGetData.isUnlocked === false, 'Session identifies as locked for unauthorized request');
  assert(unauthGetData.participants === undefined, 'Unauthorized response does NOT include participants roster');
  assertNoSensitiveData(unauthGetData, [secretPassword, 'vipguest@secret.org', 'Gold coin'], 'Locked Session Metadata');

  // Verify Password Endpoint: Empty password
  const emptyPwReq = new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}/verify-password`, {
    method: 'POST',
    body: JSON.stringify({ password: '' }),
  });
  const emptyPwRes = await verifyPasswordHandler(emptyPwReq, {
    params: Promise.resolve({ id: pwSessionId }),
  });
  assert(emptyPwRes.status === 400, 'Empty password verification returns HTTP 400');

  // Verify Password Endpoint: Wrong password
  const wrongPwReq = new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}/verify-password`, {
    method: 'POST',
    body: JSON.stringify({ password: 'WrongPassword123' }),
  });
  const wrongPwRes = await verifyPasswordHandler(wrongPwReq, {
    params: Promise.resolve({ id: pwSessionId }),
  });
  assert(wrongPwRes.status === 401, 'Incorrect password verification returns HTTP 401');

  // Verify Password Endpoint: Correct password
  const correctPwReq = new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}/verify-password`, {
    method: 'POST',
    body: JSON.stringify({ password: secretPassword }),
  });
  const correctPwRes = await verifyPasswordHandler(correctPwReq, {
    params: Promise.resolve({ id: pwSessionId }),
  });
  const correctPwData = await correctPwRes.json();
  assert(correctPwRes.status === 200, 'Correct password verification returns HTTP 200');
  assert(Boolean(correctPwData.token), 'Unlock token returned upon correct password verification');
  
  const unlockToken = correctPwData.token;

  // Access session with unlock token header
  const tokenReq = new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}`, {
    headers: { 'x-session-token': unlockToken },
  });
  const tokenRes = await getSessionHandler(tokenReq, {
    params: Promise.resolve({ id: pwSessionId }),
  });
  const tokenData = await tokenRes.json();
  assert(tokenData.isUnlocked === true, 'Token unlocks session in GET /api/sessions/[id]');
  assert(tokenData.participants.length === 1, 'Unlocked session reveals sanitized participant count');
  assertNoSensitiveData(tokenData, ['vipguest@secret.org', secretPassword], 'Token Unlocked Session');

  // Access session with x-session-password header directly
  const pwHeaderReq = new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}`, {
    headers: { 'x-session-password': secretPassword },
  });
  const pwHeaderRes = await getSessionHandler(pwHeaderReq, {
    params: Promise.resolve({ id: pwSessionId }),
  });
  const pwHeaderData = await pwHeaderRes.json();
  assert(pwHeaderData.isUnlocked === true, 'x-session-password header directly unlocks session');

  // ----------------------------------------------------
  // Test 4: Host Admin Key Enforcement & Draw Execution
  // ----------------------------------------------------
  console.log('\n--- Testing Host Admin Key Enforcement on Draw Endpoint ---');

  // Missing admin key
  const missingAdminReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/draw`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  const missingAdminRes = await drawSessionHandler(missingAdminReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  assert(missingAdminRes.status === 401, 'Draw without adminKey returns HTTP 401');

  // Invalid admin key
  const invalidAdminReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/draw`, {
    method: 'POST',
    body: JSON.stringify({ adminKey: 'completely-wrong-key' }),
  });
  const invalidAdminRes = await drawSessionHandler(invalidAdminReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  assert(invalidAdminRes.status === 401, 'Draw with invalid adminKey returns HTTP 401');

  // Trigger draw with minimum participants requirement (< 2 participants on another session)
  const drawTooFewReq = new NextRequest(`http://localhost:3000/api/sessions/${pwSessionId}/draw`, {
    method: 'POST',
    body: JSON.stringify({ adminKey: pwAdminKey }),
  });
  const drawTooFewRes = await drawSessionHandler(drawTooFewReq, {
    params: Promise.resolve({ id: pwSessionId }),
  });
  assert(drawTooFewRes.status === 400, 'Draw with < 2 participants returns HTTP 400');

  // Valid Draw Execution on the 3-participant session
  console.log('\n--- Testing Legitimate Draw Execution & Post-Draw State Invariants ---');
  const validDrawReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/draw`, {
    method: 'POST',
    body: JSON.stringify({ adminKey }),
  });
  const validDrawRes = await drawSessionHandler(validDrawReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  const validDrawData = await validDrawRes.json();

  assert(validDrawRes.status === 200, 'Legitimate draw execution returns HTTP 200 OK');
  assert(validDrawData.success === true, 'Draw response indicates success: true');
  assert(validDrawData.matchesDrawn === 3, 'Draw response confirms 3 matches drawn');
  assert(validDrawData.status === 'LOCKED', 'Draw response confirms status flipped to LOCKED');

  // Verify in Database: Session is LOCKED
  const updatedDbSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      matches: {
        include: {
          giver: true,
          receiver: true,
        },
      },
    },
  });

  assert(updatedDbSession?.status === 'LOCKED', 'Database session status is strictly LOCKED');
  assert(updatedDbSession?.matches.length === 3, 'Database contains exactly 3 match records');

  // Invariant checks on generated matches
  const matchGivers = new Set<string>();
  const matchReceivers = new Set<string>();
  let zeroSelf = true;
  let allHavePoems = true;
  let allHaveGiftIdeas = true;
  let allHaveEmailTimestamp = true;

  for (const m of updatedDbSession!.matches) {
    if (m.giverId === m.receiverId) zeroSelf = false;
    matchGivers.add(m.giverId);
    matchReceivers.add(m.receiverId);
    if (!m.festivePoem || m.festivePoem.length < 10) allHavePoems = false;
    if (!m.giftIdeas || JSON.parse(m.giftIdeas).length !== 3) allHaveGiftIdeas = false;
    if (!m.emailSentAt) allHaveEmailTimestamp = false;
  }

  assert(zeroSelf, 'Database matches: strictly zero self-pairings');
  assert(matchGivers.size === 3, 'Database matches: every participant gives to exactly 1 person');
  assert(matchReceivers.size === 3, 'Database matches: every participant receives from exactly 1 person');
  assert(allHavePoems, 'Database matches: festive poem generated and stored for all matches');
  assert(allHaveGiftIdeas, 'Database matches: 3 curated gift ideas generated and stored for all matches');
  assert(allHaveEmailTimestamp, 'Database matches: mock email dispatch recorded with timestamp');

  // ----------------------------------------------------
  // Test 5: Post-Lock Invariants & State Machine
  // ----------------------------------------------------
  console.log('\n--- Testing State Machine Restrictions on LOCKED Session ---');

  // Attempting to join a LOCKED session
  const joinLockedReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/join`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Late',
      surname: 'Comer',
      email: 'latecomer@example.com',
    }),
  });
  const joinLockedRes = await joinSessionHandler(joinLockedReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  const joinLockedData = await joinLockedRes.json();

  assert(joinLockedRes.status === 400, 'Joining a LOCKED session returns HTTP 400');
  assert(
    joinLockedData.error === 'Submissions have ended',
    'Joining a LOCKED session returns "Submissions have ended"'
  );

  // Attempting to re-draw an already LOCKED session
  const redrawReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/draw`, {
    method: 'POST',
    body: JSON.stringify({ adminKey }),
  });
  const redrawRes = await drawSessionHandler(redrawReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  const redrawData = await redrawRes.json();

  assert(redrawRes.status === 400, 'Re-drawing an already LOCKED session returns HTTP 400');
  assert(
    redrawData.error && redrawData.error.includes('already taken place'),
    'Re-drawing returns appropriate error message'
  );

  // Final check: GET /api/sessions/[id] after draw
  const getFinalReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}`);
  const getFinalRes = await getSessionHandler(getFinalReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  const getFinalData = await getFinalRes.json();

  assert(getFinalData.status === 'LOCKED', 'Public GET session returns status "LOCKED"');
  assert(getFinalData.participants.length === 3, 'Public roster still contains 3 sanitized participants');
  assertNoSensitiveData(
    getFinalData,
    [
      'alice.smith.secret@corp.example',
      'bob.jones.secret@corp.example',
      'charlie.brown.secret@corp.example',
    ],
    'Final LOCKED Session Roster'
  );

  // Clean up test sessions from DB
  await prisma.session.deleteMany({
    where: { id: { in: [sessionId, pwSessionId] } },
  });
  console.log('\nCleaned up test sessions from SQLite database.');

  // Summary
  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} test(s) failed in privacy & lifecycle test suite!`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${results.length} privacy, security, AI fallback, and lifecycle tests PASSED!`);
  }
}

runTests().catch((e) => {
  console.error('Fatal error during test run:', e);
  process.exit(1);
});
