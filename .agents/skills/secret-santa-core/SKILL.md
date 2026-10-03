---
name: secret-santa-core
description: Core guidelines for Secret Santa session management, strict email privacy, and derangement gift matching algorithms.
---

# Secret Santa Core Domain Skill

## 1. Domain Lifecycle & State Machine
Every Secret Santa event follows a strict state progression:
1. **OPEN**:
   - Host initializes session (title, budget limit, exchange date, optional session password, host admin key).
   - Participants can join via link (`/secretSanta/session/[id]`).
   - Roster displays participant count and list of names (First Name + Last Initial or Surname).
2. **LOCKED / DRAWN**:
   - Host triggers matching with their admin key/password.
   - Matching derangement algorithm runs atomically.
   - Status changes to `LOCKED`.
   - All entry inputs disable permanently. Banner shows: "Submissions have ended".
   - Match results are dispatched strictly to each recipient's email.
   - Match pairs are stored securely or dispatched directly.

## 2. Critical Email Security & Privacy Rules
- **NEVER** expose the `email` column in public session responses (`/api/sessions/[id]`).
- The public roster MUST return only: `id`, `name`, `surname`, `joinedAt`.
- Passwords (session password & host admin key) MUST be hashed (SHA-256 with salt or bcrypt) before database storage.
- Email verification / delivery must run server-side only.

## 3. Derangement Matching Algorithm
- In a Secret Santa exchange of $N$ people, nobody may be assigned to gift themselves: $\forall i, \text{giver}_i \ne \text{receiver}_i$.
- Algorithm:
  1. If $N < 2$, draw cannot proceed.
  2. Implement Fisher-Yates shuffle with derangement validation (or generate a random cyclic permutation: $P_0 \to P_1 \to \dots \to P_{n-1} \to P_0$ then shuffle order). Cyclic derangement guarantees 100% validity on first pass without infinite retry loops!
