import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/prisma';
import { DELETE as deleteParticipantHandler } from '../src/app/api/sessions/[id]/participants/[participantId]/route';
import { POST as createSessionHandler } from '../src/app/api/sessions/route';
import { POST as joinSessionHandler } from '../src/app/api/sessions/[id]/join/route';
import { POST as drawSessionHandler } from '../src/app/api/sessions/[id]/draw/route';
import { generateSantaPoem, generateGiftIdeas } from '../src/lib/ai';
import { buildSecretSantaEmailHtml, buildSecretSantaPlainText } from '../src/lib/email';
import { translations } from '../src/lib/i18n';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING ADMIN DELETE, RUSSIAN LOCALIZATION & EURO TESTS');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // Test 1: Currency Formatting (Euros Only)
  // ----------------------------------------------------
  console.log('--- Checking Currency Placeholders (Euros Only, No Dollars or Roubles) ---');
  const enPlaceholder = translations.en['create.budgetPlaceholder'];
  const ruPlaceholder = translations.ru['create.budgetPlaceholder'];

  assert(enPlaceholder.includes('€'), 'English budget placeholder contains €');
  assert(!enPlaceholder.includes('$') && !enPlaceholder.includes('₽'), 'English placeholder has NO $ or ₽');

  assert(ruPlaceholder.includes('€'), 'Russian budget placeholder contains €');
  assert(!ruPlaceholder.includes('$') && !ruPlaceholder.includes('₽'), 'Russian placeholder has NO $ or ₽');

  // ----------------------------------------------------
  // Test 2: Russian Poems and Gift Ideas Generation
  // ----------------------------------------------------
  console.log('\n--- Checking Russian Poem & Gift Suggestions ---');
  const ruPoem = await generateSantaPoem('Иван', 'Мария', 'ru');
  assert(ruPoem.length > 20, 'Russian poem generated with substantial length');
  assert(ruPoem.includes('Иван'), 'Russian poem contains giver name');
  assert(ruPoem.includes('Мария'), 'Russian poem contains receiver name');
  assert(/[а-яА-ЯёЁ]/.test(ruPoem), 'Russian poem contains Cyrillic characters');

  const ruGifts = await generateGiftIdeas('Мария', 'кофе, книги', 'чтение', '25 €', 'ru');
  assert(ruGifts.length === 3, 'Returns exactly 3 Russian gift suggestions');
  assert(ruGifts.some((g) => g.includes('25 €') || g.includes('кофе') || g.includes('книг')), 'Gift ideas match wishlist and euro budget');

  // ----------------------------------------------------
  // Test 3: Russian Email Generation
  // ----------------------------------------------------
  console.log('\n--- Checking Russian Email Templates ---');
  const emailHtml = buildSecretSantaEmailHtml({
    giverEmail: 'ivan@example.com',
    giverName: 'Иван',
    receiverName: 'Мария',
    receiverSurname: 'Петрова',
    receiverWishlist: 'Тёплый шарф',
    receiverHobbies: 'Рисование',
    sessionTitle: 'Новогодний Обмен 2026',
    budget: '30 €',
    exchangeDate: '2026-12-31',
    festivePoem: ruPoem,
    giftIdeas: ruGifts,
    locale: 'ru',
  });

  assert(emailHtml.includes('Жеребьёвка Тайного Санты!'), 'Email HTML contains Russian header');
  assert(emailHtml.includes('ТЫ ТАЙНЫЙ САНТА ДЛЯ'), 'Email HTML contains Russian badge');
  assert(emailHtml.includes('Мария Петрова'), 'Email HTML contains full receiver name');
  assert(emailHtml.includes('30 €'), 'Email HTML contains Euro budget');
  assert(emailHtml.includes('Секретное правило Санты'), 'Email HTML contains Russian secret rule');

  const emailPlainText = buildSecretSantaPlainText({
    giverEmail: 'ivan@example.com',
    giverName: 'Иван',
    receiverName: 'Мария',
    receiverSurname: 'Петрова',
    sessionTitle: 'Новогодний Обмен 2026',
    budget: '30 €',
    locale: 'ru',
  });

  assert(emailPlainText.includes('ИТОГИ ЖЕРЕБЬЁВКИ ТАЙНОГО САНТЫ'), 'Plain text email has Russian header');
  assert(emailPlainText.includes('ВЫ ТАЙНЫЙ САНТА ДЛЯ: Мария Петрова'), 'Plain text email has Russian match line');

  // ----------------------------------------------------
  // Test 4: Host Admin Participant Deletion
  // ----------------------------------------------------
  console.log('\n--- Checking Host Admin Participant Deletion Endpoint ---');
  const adminKey = 'super-host-secret-key-2026';

  // Create test session
  const createReq = new NextRequest('http://localhost:3000/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Admin Delete Test Room',
      budget: '25 €',
      adminKey,
    }),
  });
  const createRes = await createSessionHandler(createReq);
  const createData = await createRes.json();
  assert(createRes.status === 201, 'Test room created');
  const sessionId = createData.session.id;

  // Add 3 participants
  const p1Req = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/join`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Alice', surname: 'One', email: 'alice.del@test.org' }),
  });
  const p1Res = await joinSessionHandler(p1Req, { params: Promise.resolve({ id: sessionId }) });
  const p1Data = await p1Res.json();
  const p1Id = p1Data.id;

  const p2Req = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/join`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Bob', surname: 'Two', email: 'bob.del@test.org' }),
  });
  const p2Res = await joinSessionHandler(p2Req, { params: Promise.resolve({ id: sessionId }) });
  const p2Data = await p2Res.json();
  const p2Id = p2Data.id;

  const p3Req = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/join`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Charlie', surname: 'Three', email: 'charlie.del@test.org' }),
  });
  await joinSessionHandler(p3Req, { params: Promise.resolve({ id: sessionId }) });

  // 4a. Delete without admin key -> 401
  const noKeyReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/participants/${p2Id}`, {
    method: 'DELETE',
  });
  const noKeyRes = await deleteParticipantHandler(noKeyReq, {
    params: Promise.resolve({ id: sessionId, participantId: p2Id }),
  });
  assert(noKeyRes.status === 401, 'Delete without admin key returns 401');

  // 4b. Delete with wrong admin key -> 401
  const wrongKeyReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/participants/${p2Id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': 'wrong-key' },
  });
  const wrongKeyRes = await deleteParticipantHandler(wrongKeyReq, {
    params: Promise.resolve({ id: sessionId, participantId: p2Id }),
  });
  assert(wrongKeyRes.status === 401, 'Delete with wrong admin key returns 401');

  // 4c. Delete with non-existent participantId -> 404
  const notFoundReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/participants/fake-id-123`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey },
  });
  const notFoundRes = await deleteParticipantHandler(notFoundReq, {
    params: Promise.resolve({ id: sessionId, participantId: 'fake-id-123' }),
  });
  assert(notFoundRes.status === 404, 'Delete non-existent participant returns 404');

  // 4d. Successful deletion of participant B
  const validDelReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/participants/${p2Id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey },
  });
  const validDelRes = await deleteParticipantHandler(validDelReq, {
    params: Promise.resolve({ id: sessionId, participantId: p2Id }),
  });
  const validDelData = await validDelRes.json();
  assert(validDelRes.status === 200, 'Authorized delete returns HTTP 200');
  assert(validDelData.success === true, 'Delete response indicates success');

  // Verify DB state
  const deletedCheck = await prisma.participant.findUnique({ where: { id: p2Id } });
  assert(deletedCheck === null, 'Participant Bob is permanently removed from DB');

  const remainingParticipants = await prisma.participant.findMany({ where: { sessionId } });
  assert(remainingParticipants.length === 2, 'Session now has exactly 2 participants remaining');

  // 4e. Draw session and attempt delete on LOCKED session
  const drawReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/draw`, {
    method: 'POST',
    body: JSON.stringify({ adminKey, locale: 'ru' }),
  });
  const drawRes = await drawSessionHandler(drawReq, {
    params: Promise.resolve({ id: sessionId }),
  });
  assert(drawRes.status === 200, 'Draw completed with remaining participants');

  const lockedDelReq = new NextRequest(`http://localhost:3000/api/sessions/${sessionId}/participants/${p1Id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey },
  });
  const lockedDelRes = await deleteParticipantHandler(lockedDelReq, {
    params: Promise.resolve({ id: sessionId, participantId: p1Id }),
  });
  assert(lockedDelRes.status === 400, 'Delete on LOCKED session returns HTTP 400');

  // Clean up test data
  await prisma.match.deleteMany({ where: { sessionId } });
  await prisma.participant.deleteMany({ where: { sessionId } });
  await prisma.session.delete({ where: { id: sessionId } });

  console.log('\n🎉 ALL ADMIN DELETE, RUSSIAN AND EURO TESTS PASSED!\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
