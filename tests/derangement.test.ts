import { generateCyclicDerangement } from '../src/lib/derangement';

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

console.log('=== TEST SUITE 1: Cyclic Derangement Edge Cases & Mathematics ===\n');

// 1. Edge Case: N = 0
try {
  generateCyclicDerangement([]);
  assert(false, 'N=0 throws error', 'Did not throw');
} catch (e: any) {
  assert(
    e.message.includes('at least 2 participants'),
    'N=0 throws error',
    `Threw expected error: ${e.message}`
  );
}

// 2. Edge Case: N = 1
try {
  generateCyclicDerangement(['Alice']);
  assert(false, 'N=1 throws error', 'Did not throw');
} catch (e: any) {
  assert(
    e.message.includes('at least 2 participants'),
    'N=1 throws error',
    `Threw expected error: ${e.message}`
  );
}

// 3. Iteration testing for N = [2, 3, 5, 10, 50, 100] across 1,000 iterations each
const testSizes = [2, 3, 5, 10, 50, 100];
const ITERATIONS = 1000;

for (const n of testSizes) {
  const participants = Array.from({ length: n }, (_, i) => `User_${i}`);
  let zeroSelfPairings = true;
  let allGiversUnique = true;
  let allReceiversUnique = true;
  let isBijective = true;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const matches = generateCyclicDerangement(participants);

    if (matches.length !== n) {
      assert(false, `N=${n} matches length matches participant count`, `Got length ${matches.length}`);
      break;
    }

    const givers = new Set<string>();
    const receivers = new Set<string>();

    for (const match of matches) {
      // Zero self pairings check
      if (match.giver === match.receiver) {
        zeroSelfPairings = false;
      }
      givers.add(match.giver);
      receivers.add(match.receiver);
    }

    if (givers.size !== n) allGiversUnique = false;
    if (receivers.size !== n) allReceiversUnique = false;
  }

  assert(
    zeroSelfPairings,
    `N=${n}: Zero self-pairings across ${ITERATIONS} iterations`,
    `giver !== receiver strictly verified`
  );
  assert(
    allGiversUnique && allReceiversUnique,
    `N=${n}: Bijective permutation across ${ITERATIONS} iterations`,
    `Every person gives to exactly 1 person, receives from exactly 1 person`
  );
}

// 4. Uniformity / Distribution checks
// For N = 4 participants [A, B, C, D], each person can give to 3 other people with theoretical probability 1/3 (33.33%).
// With 30,000 iterations, expected count per pair (A->B, A->C, A->D) is 10,000.
// We verify that the empirical frequencies do not deviate significantly (e.g. within 5% or Chi-Square p > 0.01).
console.log('\n--- Running Uniformity & Distribution Verification ---');
const distParticipants = ['P0', 'P1', 'P2', 'P3'];
const distIter = 30000;
const pairCounts: Record<string, number> = {};

for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    if (i !== j) {
      pairCounts[`P${i}->P${j}`] = 0;
    }
  }
}

for (let iter = 0; iter < distIter; iter++) {
  const matches = generateCyclicDerangement(distParticipants);
  for (const m of matches) {
    const key = `${m.giver}->${m.receiver}`;
    pairCounts[key] = (pairCounts[key] || 0) + 1;
  }
}

console.log('Pair distribution for N=4 across 30,000 runs (Expected: ~10,000 each):');
const expected = distIter / 3;
let maxDeviation = 0;
let chiSquare = 0;

for (const [pair, count] of Object.entries(pairCounts)) {
  const dev = Math.abs(count - expected) / expected;
  if (dev > maxDeviation) maxDeviation = dev;
  chiSquare += Math.pow(count - expected, 2) / expected;
  console.log(`  ${pair}: ${count} (deviation: ${(dev * 100).toFixed(2)}%)`);
}

// Degrees of freedom for 12 possible directed edges with fixed marginals
console.log(`Chi-Square value: ${chiSquare.toFixed(2)}, Max deviation: ${(maxDeviation * 100).toFixed(2)}%`);
assert(
  maxDeviation < 0.05,
  'Uniformity: Empirical distribution within 5% of uniform expectation',
  `Max deviation was ${(maxDeviation * 100).toFixed(2)}%`
);

const failed = results.filter((r) => !r.passed);
if (failed.length > 0) {
  console.error(`\n❌ ${failed.length} test(s) failed in derangement test suite!`);
  process.exit(1);
} else {
  console.log(`\n🎉 All ${results.length} derangement tests PASSED!`);
}
