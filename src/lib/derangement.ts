export interface MatchPair<T> {
  giver: T;
  receiver: T;
}

/**
 * Generates a Secret Santa assignment using a Fisher-Yates cyclic permutation.
 * 
 * Algorithm:
 * 1. Validates N >= 2 (throws an Error otherwise).
 * 2. Creates a shallow copy of the participants array and shuffles it using Fisher-Yates (Durstenfeld).
 * 3. Applies a cyclic shift: participant at index i gives to participant at index (i + 1) % N.
 * 
 * Mathematical Guarantee:
 * Since N >= 2, (i + 1) % N != i for all i in [0, N - 1].
 * This guarantees:
 * - Exactly zero self-pairings (no one gives to themselves) in O(N) time with no infinite retry loops.
 * - Every participant is a giver exactly once and a receiver exactly once (a single Hamiltonian cycle).
 */
export function generateCyclicDerangement<T>(participants: T[]): MatchPair<T>[] {
  if (!participants || participants.length < 2) {
    throw new Error('Secret Santa requires at least 2 participants for cyclic derangement.');
  }

  const n = participants.length;
  const shuffled = [...participants];

  // Fisher-Yates shuffle
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Cyclic derangement shift: shuffled[i] -> shuffled[(i + 1) % n]
  const matches: MatchPair<T>[] = [];
  for (let i = 0; i < n; i++) {
    matches.push({
      giver: shuffled[i],
      receiver: shuffled[(i + 1) % n],
    });
  }

  return matches;
}
