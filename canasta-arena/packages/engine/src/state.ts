import type { Card, Rank } from './cards';
import type { RuleSet } from './rules';

export type Team = 0 | 1;

export interface Meld {
  readonly id: string;
  /** Natural rank of the meld; '3' only for a black-3 meld made while going out. */
  readonly rank: Rank;
  cards: Card[];
}

export type Phase = 'draw' | 'play' | 'handOver' | 'gameOver';

export interface GoOutRequest {
  asker: number;
  status: 'pending' | 'yes' | 'no';
}

/**
 * Game events. The server sends these codes to clients and each client writes them
 * out in its player's own language (see PLAN §6.5).
 */
export type GameEvent =
  | { e: 'deal'; hand: number; dealer: number }
  | { e: 'red3'; seat: number }
  | { e: 'draw'; seat: number; n: number }
  | { e: 'takePile'; seat: number; n: number }
  | { e: 'meld'; seat: number; cards: number }
  | { e: 'canasta'; seat: number; rank: Rank; natural: boolean }
  | { e: 'discard'; seat: number; card: Card }
  | { e: 'ask'; seat: number }
  | { e: 'answer'; seat: number; yes: boolean }
  | { e: 'goOut'; seat: number; concealed: boolean }
  | { e: 'stockOut' };

export interface TeamHandScore {
  meldPoints: number;
  canastaBonus: number;
  naturalCanastas: number;
  mixedCanastas: number;
  red3: number;
  goingOut: number;
  handPenalty: number;
  total: number;
}

export interface HandResult {
  hand: number;
  outSeat: number | null;
  concealed: boolean;
  teams: [TeamHandScore, TeamHandScore];
  scoresAfter: [number, number];
}

export interface GameState {
  rules: RuleSet;
  seed: number;
  hand: number;
  dealer: number;
  hands: Card[][];
  stock: Card[];
  pile: Card[];
  /** R5.2(b) — a wild card or red 3 went into the pile; frozen for everyone until taken. */
  pileFrozenAll: boolean;
  melds: [Meld[], Meld[]];
  red3s: [Card[], Card[]];
  scores: [number, number];
  turn: number;
  phase: Phase;
  /** Card ids drawn this turn (for highlighting). */
  drawn: number[];
  meldedThisTurn: boolean;
  /** R7.4 — whether each player melded in an earlier turn of this hand. */
  meldedBefore: boolean[];
  goOut: GoOutRequest | null;
  nextMeldId: number;
  log: GameEvent[];
  history: HandResult[];
  winner: Team | 'tie' | null;
}

export const teamOf = (seat: number): Team => (seat % 2) as Team;
export const partnerOf = (seat: number): number => (seat + 2) % 4;
export const canastaCount = (melds: readonly Meld[]): number => melds.filter((m) => m.cards.length >= 7).length;
