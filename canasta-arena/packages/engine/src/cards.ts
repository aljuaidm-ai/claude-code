export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JK';

export interface Card {
  readonly id: number;
  readonly rank: Rank;
  readonly suit: Suit | null;
}

export const SUITS: readonly Suit[] = ['S', 'H', 'D', 'C'];
export const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/** Display / sort order: 3 4 5 ... K A 2 Joker. */
export const RANK_ORDER: Record<Rank, number> = {
  '3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5, '9': 6, '10': 7,
  J: 8, Q: 9, K: 10, A: 11, '2': 12, JK: 13,
};

/** R2.1 — two 52-card decks plus four jokers. */
export function makeDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (let d = 0; d < 2; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) deck.push({ id: id++, rank, suit });
    }
  }
  for (let j = 0; j < 4; j++) deck.push({ id: id++, rank: 'JK', suit: null });
  return deck;
}

/** R2.2 */
export const isWild = (c: Card): boolean => c.rank === 'JK' || c.rank === '2';
export const isNatural = (c: Card): boolean => !isWild(c);
export const isRed3 = (c: Card): boolean => c.rank === '3' && (c.suit === 'H' || c.suit === 'D');
export const isBlack3 = (c: Card): boolean => c.rank === '3' && (c.suit === 'S' || c.suit === 'C');
export const isRedSuit = (c: Card): boolean => c.suit === 'H' || c.suit === 'D';

/** R2.3 — red 3s score only as bonuses, so they have no card value here. */
export function cardPoints(c: Card): number {
  switch (c.rank) {
    case 'JK': return 50;
    case '2': case 'A': return 20;
    case 'K': case 'Q': case 'J': case '10': case '9': case '8': return 10;
    case '3': return isRed3(c) ? 0 : 5;
    default: return 5;
  }
}

export const sumPoints = (cards: readonly Card[]): number => cards.reduce((n, c) => n + cardPoints(c), 0);

export function sortCards(cards: readonly Card[]): Card[] {
  const suitOrder: Record<string, number> = { S: 0, H: 1, C: 2, D: 3 };
  return [...cards].sort(
    (a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank] || (suitOrder[a.suit ?? 'S'] - suitOrder[b.suit ?? 'S']) || a.id - b.id,
  );
}

/** Deterministic Fisher–Yates shuffle (mulberry32), so every deal can be replayed from its seed. */
export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
