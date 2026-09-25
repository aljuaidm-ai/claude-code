import type { Card } from './cards';
import type { RuleSet } from './rules';
import type { GameEvent, GameState, GoOutRequest, HandResult, Meld, Phase, Team } from './state';

/**
 * What one seat is allowed to see. Other hands and the stock order are never included,
 * so a client (or a bot) built on this view cannot cheat.
 */
export interface PlayerView {
  seat: number;
  rules: RuleSet;
  hand: Card[];
  handCounts: number[];
  stockCount: number;
  pileTop: Card | null;
  pileCount: number;
  pileFrozenAll: boolean;
  melds: [Meld[], Meld[]];
  red3s: [Card[], Card[]];
  scores: [number, number];
  turn: number;
  phase: Phase;
  drawn: number[];
  meldedThisTurn: boolean;
  meldedBefore: boolean[];
  goOut: GoOutRequest | null;
  handNumber: number;
  log: GameEvent[];
  history: HandResult[];
  winner: Team | 'tie' | null;
}

export function viewFor(s: GameState, seat: number): PlayerView {
  return structuredClone({
    seat,
    rules: s.rules,
    hand: s.hands[seat] ?? [],
    handCounts: s.hands.map((h) => h.length),
    stockCount: s.stock.length,
    pileTop: s.pile[s.pile.length - 1] ?? null,
    pileCount: s.pile.length,
    pileFrozenAll: s.pileFrozenAll,
    melds: s.melds,
    red3s: s.red3s,
    scores: s.scores,
    turn: s.turn,
    phase: s.phase,
    drawn: s.turn === seat ? s.drawn : [],
    meldedThisTurn: s.meldedThisTurn,
    meldedBefore: s.meldedBefore,
    goOut: s.goOut,
    handNumber: s.hand,
    log: s.log,
    history: s.history,
    winner: s.winner,
  });
}
