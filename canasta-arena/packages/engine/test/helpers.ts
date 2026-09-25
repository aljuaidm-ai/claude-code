import type { Card, Rank, Suit } from '../src/cards';
import type { RuleSet } from '../src/rules';
import type { GameState, Meld } from '../src/state';

let nextId = 1000;
/** A test card. Red 3s need suit 'H' or 'D'. */
export const c = (rank: Rank, suit: Suit = 'S'): Card => ({ id: nextId++, rank, suit: rank === 'JK' ? null : suit });
export const cards = (...ranks: Rank[]): Card[] => ranks.map((r) => c(r));
export const meld = (id: string, list: Card[]): Meld => ({ id, rank: list.find((x) => x.rank !== '2' && x.rank !== 'JK')!.rank, cards: list });
export const ids = (list: Card[]) => list.map((x) => x.id);

export function makeState(rules: RuleSet, o: Partial<GameState> = {}): GameState {
  return {
    rules, seed: 1, hand: 0, dealer: rules.players - 1,
    hands: Array.from({ length: rules.players }, () => []),
    stock: Array.from({ length: 20 }, () => c('4', 'C')),
    pile: [c('9')], pileFrozenAll: false,
    melds: [[], []], red3s: [[], []], scores: [0, 0],
    turn: 0, phase: 'play', drawn: [], meldedThisTurn: false,
    meldedBefore: Array(rules.players).fill(true),
    goOut: null, nextMeldId: 100, log: [], history: [], winner: null,
    ...o,
  };
}
