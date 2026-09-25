import {
  type Card, cardPoints, isBlack3, isNatural, isRed3, isWild, makeDeck, shuffle, sumPoints,
} from './cards';
import { initialMeldMinimum, type RuleSet } from './rules';
import {
  canastaCount, type GameState, type HandResult, type Meld, partnerOf, type Team, type TeamHandScore, teamOf,
} from './state';

export type Action =
  | { t: 'draw' }
  | { t: 'takePile'; pair: number[]; extraMelds?: number[][] }
  | { t: 'play'; newMelds?: number[][]; additions?: { meldId: string; cards: number[] }[] }
  | { t: 'discard'; card: number }
  | { t: 'ask' }
  | { t: 'answer'; yes: boolean }
  | { t: 'endHand' }
  | { t: 'nextHand' };

export type ErrorCode =
  | 'not_your_turn' | 'wrong_phase' | 'unknown_card' | 'duplicate_card' | 'stock_empty' | 'stock_not_empty'
  | 'pile_empty' | 'pile_top_unusable' | 'pile_frozen_needs_pair' | 'pile_needs_match' | 'no_meld_to_add'
  | 'meld_too_small' | 'mixed_ranks' | 'need_two_naturals' | 'too_many_wilds' | 'threes_not_meldable'
  | 'black3_only_going_out' | 'rank_exists' | 'not_your_meld' | 'cannot_add_black3' | 'wrong_rank'
  | 'minimum_not_met' | 'need_canastas' | 'need_permission' | 'keep_one_card' | 'waiting_partner'
  | 'ask_before_melding' | 'cannot_ask' | 'must_take_pile' | 'nothing_to_play';

export type Result =
  | { ok: true; state: GameState }
  | { ok: false; code: ErrorCode; params?: Record<string, number | string> };

const fail = (code: ErrorCode, params?: Record<string, number | string>): Result => ({ ok: false, code, params });

// ---------------------------------------------------------------- setup

export function newGame(rules: RuleSet, seed: number): GameState {
  const s: GameState = {
    rules, seed, hand: 0, dealer: 0,
    hands: [], stock: [], pile: [], pileFrozenAll: false,
    melds: [[], []], red3s: [[], []], scores: [0, 0],
    turn: 0, phase: 'draw', drawn: [], meldedThisTurn: false, meldedBefore: [],
    goOut: null, nextMeldId: 1, log: [], history: [], winner: null,
  };
  deal(s);
  return s;
}

/** R3 */
function deal(s: GameState): void {
  const { players, handSize } = s.rules;
  const deck = shuffle(makeDeck(), (s.seed + s.hand * 7919) >>> 0);
  s.hands = Array.from({ length: players }, () => []);
  for (let i = 0; i < handSize; i++) for (let p = 0; p < players; p++) s.hands[p].push(deck.pop()!);
  s.stock = deck;
  s.melds = [[], []];
  s.red3s = [[], []];
  s.pile = [];
  s.pileFrozenAll = false;
  s.log = [{ e: 'deal', hand: s.hand, dealer: s.dealer }];
  // R3.2 — a wild card or red 3 as the first up-card freezes the pile; turn another on top.
  for (;;) {
    const up = s.stock.pop()!;
    s.pile.push(up);
    if (isWild(up) || isRed3(up)) { s.pileFrozenAll = true; continue; }
    break;
  }
  // R3.3 — lay down red 3s and replace them.
  for (let p = 0; p < players; p++) {
    for (;;) {
      const idx = s.hands[p].findIndex(isRed3);
      if (idx < 0) break;
      const [r3] = s.hands[p].splice(idx, 1);
      s.red3s[teamOf(p)].push(r3);
      s.log.push({ e: 'red3', seat: p });
      s.hands[p].push(s.stock.pop()!);
    }
  }
  s.turn = (s.dealer + 1) % players;
  s.phase = 'draw';
  s.drawn = [];
  s.meldedThisTurn = false;
  s.meldedBefore = Array(players).fill(false);
  s.goOut = null;
}

// ---------------------------------------------------------------- queries

export const pileTop = (s: Pick<GameState, 'pile'>): Card | null => s.pile[s.pile.length - 1] ?? null;

/** R5.2 */
export function isPileFrozenFor(s: Pick<GameState, 'pileFrozenAll' | 'melds'>, team: Team): boolean {
  return s.pileFrozenAll || s.melds[team].length === 0;
}

/** Whose input the game is waiting for: the partner answering "May I go out?", or the player on turn. */
export function actorOf(s: GameState): number | null {
  if (s.phase === 'handOver' || s.phase === 'gameOver') return null;
  if (s.goOut?.status === 'pending') return partnerOf(s.goOut.asker);
  return s.turn;
}

function hasPermission(s: GameState, seat: number): boolean {
  if (s.rules.players !== 4 || !s.rules.askPartnerToGoOut) return true;
  return s.goOut?.asker === seat && s.goOut.status === 'yes';
}

/** R7.1, R7.3 */
function goOutBlocker(s: GameState, seat: number, canastasAfter: number): ErrorCode | null {
  if (canastasAfter < s.rules.canastasToGoOut) return 'need_canastas';
  if (!hasPermission(s, seat)) return 'need_permission';
  return null;
}

/** R6.1, R6.3, R6.4 — returns null when `cards` form a legal new meld. */
export function checkNewMeld(cards: readonly Card[], rules: RuleSet, goingOut: boolean): ErrorCode | null {
  if (cards.length < 3) return 'meld_too_small';
  if (cards.every(isBlack3)) return goingOut ? null : 'black3_only_going_out';
  if (cards.some((c) => c.rank === '3')) return 'threes_not_meldable';
  const naturals = cards.filter(isNatural);
  if (new Set(naturals.map((c) => c.rank)).size > 1) return 'mixed_ranks';
  if (naturals.length < 2) return 'need_two_naturals';
  if (cards.length - naturals.length > rules.maxWildsPerMeld) return 'too_many_wilds';
  return null;
}

function checkAddition(meld: Meld, cards: readonly Card[], rules: RuleSet): ErrorCode | null {
  if (meld.rank === '3') return 'cannot_add_black3';
  for (const c of cards) if (isNatural(c) && c.rank !== meld.rank) return 'wrong_rank';
  const wilds = meld.cards.filter(isWild).length + cards.filter(isWild).length;
  if (wilds > rules.maxWildsPerMeld) return 'too_many_wilds';
  return null;
}

const meldRankOf = (cards: readonly Card[]) => cards.find(isNatural)!.rank;

/** Pull cards out of a hand by id. Returns null on an unknown or repeated id. */
function pick(hand: Card[], ids: readonly number[]): { cards: Card[] } | { error: ErrorCode } {
  const seen = new Set<number>();
  const cards: Card[] = [];
  for (const id of ids) {
    if (seen.has(id)) return { error: 'duplicate_card' };
    seen.add(id);
    const c = hand.find((x) => x.id === id);
    if (!c) return { error: 'unknown_card' };
    cards.push(c);
  }
  return { cards };
}

const removeIds = (hand: Card[], ids: ReadonlySet<number>) => hand.filter((c) => !ids.has(c.id));

// ---------------------------------------------------------------- apply

export function apply(state: GameState, seat: number, action: Action): Result {
  if (action.t === 'nextHand') return nextHand(state);
  if (action.t === 'answer') return answer(state, seat, action.yes);
  if (state.phase === 'handOver' || state.phase === 'gameOver') return fail('wrong_phase');
  if (seat !== state.turn) return fail('not_your_turn');
  if (state.goOut?.status === 'pending') return fail('waiting_partner');
  switch (action.t) {
    case 'draw': return draw(state, seat);
    case 'takePile': return takePile(state, seat, action.pair, action.extraMelds ?? []);
    case 'play': return play(state, seat, action.newMelds ?? [], action.additions ?? []);
    case 'discard': return discard(state, seat, action.card);
    case 'ask': return ask(state, seat);
    case 'endHand': return endHandByStockOut(state, seat);
  }
}

/** R4.1, R4.2, R9.1 */
function draw(state: GameState, seat: number): Result {
  if (state.phase !== 'draw') return fail('wrong_phase');
  if (state.stock.length === 0) return fail('stock_empty');
  const s = structuredClone(state);
  const team = teamOf(seat);
  s.drawn = [];
  while (s.drawn.length < s.rules.drawCount && s.stock.length > 0) {
    const c = s.stock.pop()!;
    if (isRed3(c)) {
      s.red3s[team].push(c);
      s.log.push({ e: 'red3', seat });
      if (s.stock.length === 0) { s.log.push({ e: 'stockOut' }); return { ok: true, state: finishHand(s, null) }; }
      continue;
    }
    s.hands[seat].push(c);
    s.drawn.push(c.id);
  }
  s.log.push({ e: 'draw', seat, n: s.drawn.length });
  s.phase = 'play';
  return { ok: true, state: s };
}

/** R5 */
function takePile(state: GameState, seat: number, pairIds: number[], extraIds: number[][]): Result {
  if (state.phase !== 'draw') return fail('wrong_phase');
  const top = pileTop(state);
  if (!top) return fail('pile_empty');
  if (isWild(top) || isBlack3(top)) return fail('pile_top_unusable');
  const team = teamOf(seat);
  const frozen = isPileFrozenFor(state, team);
  const teamMelded = state.melds[team].length > 0;
  const hand = state.hands[seat];

  const allIds = [...pairIds, ...extraIds.flat()];
  const picked = pick(hand, allIds);
  if ('error' in picked) return fail(picked.error);
  const pair = picked.cards.slice(0, pairIds.length);
  const existing = state.melds[team].find((m) => m.rank === top.rank);

  if (pair.length === 0) {
    // R5.4(c)
    if (frozen) return fail('pile_frozen_needs_pair');
    if (!existing) return fail('no_meld_to_add');
  } else if (frozen) {
    // R5.3
    if (pair.length < 2 || !pair.every((c) => isNatural(c) && c.rank === top.rank)) return fail('pile_frozen_needs_pair');
  } else {
    // R5.4(a)(b)
    if (!pair.some((c) => isNatural(c) && c.rank === top.rank)) return fail('pile_needs_match');
    if (pair.some((c) => isNatural(c) && c.rank !== top.rank)) return fail('wrong_rank');
    if (pair.length < 2) return fail('pile_needs_match');
  }
  const topMeldCards = [top, ...pair];
  if (existing) {
    const err = checkAddition(existing, topMeldCards, state.rules);
    if (err) return fail(err);
  } else {
    const err = checkNewMeld(topMeldCards, state.rules, false);
    if (err) return fail(err);
  }

  // Extra melds from hand, laid down together (R5.6).
  const extras: Card[][] = [];
  let offset = pairIds.length;
  const ranksUsed = new Set(state.melds[team].map((m) => m.rank));
  ranksUsed.add(top.rank);
  for (const ids of extraIds) {
    const cards = picked.cards.slice(offset, offset + ids.length);
    offset += ids.length;
    const err = checkNewMeld(cards, state.rules, false);
    if (err) return fail(err);
    const r = meldRankOf(cards);
    if (ranksUsed.has(r)) return fail('rank_exists');
    ranksUsed.add(r);
    extras.push(cards);
  }

  if (!teamMelded) {
    const need = initialMeldMinimum(state.scores[team]);
    const have = sumPoints(topMeldCards) + extras.reduce((n, m) => n + sumPoints(m), 0);
    if (have < need) return fail('minimum_not_met', { need, have });
  }

  const rest = state.pile.slice(0, -1);
  const handAfter = hand.length - allIds.length + rest.filter((c) => !isRed3(c)).length;
  const canastasAfter = projectedCanastas(state.melds[team], existing, topMeldCards, extras);
  if (handAfter < 2) {
    const block = goOutBlocker(state, seat, canastasAfter);
    if (block) return fail(handAfter === 0 ? block : 'keep_one_card');
  }

  const s = structuredClone(state);
  s.hands[seat] = removeIds(s.hands[seat], new Set(allIds));
  commitMeldCards(s, seat, topMeldCards, existing?.id);
  for (const m of extras) commitMeldCards(s, seat, m);
  for (const c of rest) {
    if (isRed3(c)) { s.red3s[team].push(c); s.log.push({ e: 'red3', seat }); } else s.hands[seat].push(c);
  }
  s.pile = [];
  s.pileFrozenAll = false;
  s.drawn = rest.filter((c) => !isRed3(c)).map((c) => c.id);
  s.meldedThisTurn = true;
  s.phase = 'play';
  s.log.push({ e: 'takePile', seat, n: state.pile.length });
  if (s.hands[seat].length === 0) return { ok: true, state: goOut(s, seat) };
  return { ok: true, state: s };
}

function projectedCanastas(melds: readonly Meld[], target: Meld | undefined, add: readonly Card[], extras: Card[][]): number {
  let n = 0;
  for (const m of melds) n += (m.cards.length + (m === target ? add.length : 0)) >= 7 ? 1 : 0;
  if (!target && add.length >= 7) n++;
  for (const m of extras) if (m.length >= 7) n++;
  return n;
}

/** Add cards to an existing meld, or create a new one. Logs canasta completions. */
function commitMeldCards(s: GameState, seat: number, cards: Card[], meldId?: string): void {
  const team = teamOf(seat);
  let meld = meldId ? s.melds[team].find((m) => m.id === meldId) : undefined;
  const before = meld?.cards.length ?? 0;
  if (meld) meld.cards.push(...cards);
  else {
    meld = { id: `m${s.nextMeldId++}`, rank: cards.every(isBlack3) ? '3' : meldRankOf(cards), cards: [...cards] };
    s.melds[team].push(meld);
  }
  s.log.push({ e: 'meld', seat, cards: cards.length });
  if (before < 7 && meld.cards.length >= 7) {
    s.log.push({ e: 'canasta', seat, rank: meld.rank, natural: meld.cards.every(isNatural) });
  }
}

/** R4.3, R6, R7 */
function play(
  state: GameState, seat: number, newIds: number[][], additions: { meldId: string; cards: number[] }[],
): Result {
  if (state.phase !== 'play') return fail('wrong_phase');
  if (newIds.length === 0 && additions.every((a) => a.cards.length === 0)) return fail('nothing_to_play');
  const team = teamOf(seat);
  const hand = state.hands[seat];
  const allIds = [...newIds.flat(), ...additions.flatMap((a) => a.cards)];
  const picked = pick(hand, allIds);
  if ('error' in picked) return fail(picked.error);

  const handAfter = hand.length - allIds.length;
  let offset = 0;
  const news: Card[][] = [];
  for (const ids of newIds) { news.push(picked.cards.slice(offset, offset + ids.length)); offset += ids.length; }
  const adds: { meld: Meld; cards: Card[] }[] = [];
  for (const a of additions) {
    const meld = state.melds[team].find((m) => m.id === a.meldId);
    if (!meld) return fail('not_your_meld');
    const cards = picked.cards.slice(offset, offset + a.cards.length);
    offset += a.cards.length;
    adds.push({ meld, cards });
  }

  // Canastas after this play, to decide whether this play can end in going out.
  let canastasAfter = 0;
  for (const m of state.melds[team]) {
    const extra = adds.filter((a) => a.meld === m).reduce((n, a) => n + a.cards.length, 0);
    if (m.cards.length + extra >= 7) canastasAfter++;
  }
  for (const m of news) if (m.length >= 7) canastasAfter++;
  const outBlock = goOutBlocker(state, seat, canastasAfter);
  const goingOut = handAfter <= 1 && outBlock === null;

  const ranks = new Set(state.melds[team].map((m) => m.rank));
  for (const cards of news) {
    const err = checkNewMeld(cards, state.rules, goingOut);
    if (err) return fail(err);
    const r = cards.every(isBlack3) ? '3' : meldRankOf(cards);
    if (ranks.has(r)) return fail('rank_exists');
    ranks.add(r);
  }
  const merged = new Map<Meld, Card[]>();
  for (const a of adds) merged.set(a.meld, [...(merged.get(a.meld) ?? []), ...a.cards]);
  for (const [meld, cards] of merged) {
    const err = checkAddition(meld, cards, state.rules);
    if (err) return fail(err);
  }

  if (state.melds[team].length === 0) {
    const concealedOut = goingOut && !state.meldedBefore[seat] && state.rules.concealedIgnoresMinimum;
    const need = initialMeldMinimum(state.scores[team]);
    const have = news.reduce((n, m) => n + sumPoints(m), 0);
    if (!concealedOut && have < need) return fail('minimum_not_met', { need, have });
  }

  if (handAfter < 2 && outBlock) return fail(handAfter === 0 ? outBlock : 'keep_one_card');

  const s = structuredClone(state);
  s.hands[seat] = removeIds(s.hands[seat], new Set(allIds));
  for (const cards of news) commitMeldCards(s, seat, cards);
  for (const [meld, cards] of merged) commitMeldCards(s, seat, cards, meld.id);
  s.meldedThisTurn = true;
  if (s.hands[seat].length === 0) return { ok: true, state: goOut(s, seat) };
  return { ok: true, state: s };
}

/** R4.4 – R4.6 */
function discard(state: GameState, seat: number, cardId: number): Result {
  if (state.phase !== 'play') return fail('wrong_phase');
  const card = state.hands[seat].find((c) => c.id === cardId);
  if (!card) return fail('unknown_card');
  if (state.hands[seat].length === 1) {
    const block = goOutBlocker(state, seat, canastaCount(state.melds[teamOf(seat)]));
    if (block) return fail(block);
  }
  const s = structuredClone(state);
  s.hands[seat] = s.hands[seat].filter((c) => c.id !== cardId);
  s.pile.push(card);
  if (isWild(card)) s.pileFrozenAll = true;
  s.log.push({ e: 'discard', seat, card });
  if (s.hands[seat].length === 0) return { ok: true, state: goOut(s, seat) };
  endTurn(s, seat);
  return { ok: true, state: s };
}

function endTurn(s: GameState, seat: number): void {
  if (s.meldedThisTurn) s.meldedBefore[seat] = true;
  s.turn = (seat + 1) % s.rules.players;
  s.phase = 'draw';
  s.drawn = [];
  s.meldedThisTurn = false;
  s.goOut = null;
}

/** R7.3 */
function ask(state: GameState, seat: number): Result {
  if (state.rules.players !== 4 || !state.rules.askPartnerToGoOut) return fail('cannot_ask');
  if (state.meldedThisTurn) return fail('ask_before_melding');
  if (state.goOut?.asker === seat) return fail('cannot_ask');
  const s = structuredClone(state);
  s.goOut = { asker: seat, status: 'pending' };
  s.log.push({ e: 'ask', seat });
  return { ok: true, state: s };
}

function answer(state: GameState, seat: number, yes: boolean): Result {
  if (state.goOut?.status !== 'pending') return fail('wrong_phase');
  if (seat !== partnerOf(state.goOut.asker)) return fail('not_your_turn');
  const s = structuredClone(state);
  s.goOut = { asker: state.goOut.asker, status: yes ? 'yes' : 'no' };
  s.log.push({ e: 'answer', seat, yes });
  return { ok: true, state: s };
}

/** R9.2 */
function endHandByStockOut(state: GameState, seat: number): Result {
  if (state.phase !== 'draw') return fail('wrong_phase');
  if (state.stock.length > 0) return fail('stock_not_empty');
  const top = pileTop(state);
  const team = teamOf(seat);
  if (top && !isWild(top) && !isBlack3(top) && !isPileFrozenFor(state, team)
      && state.melds[team].some((m) => m.rank === top.rank)) return fail('must_take_pile');
  const s = structuredClone(state);
  s.log.push({ e: 'stockOut' });
  return { ok: true, state: finishHand(s, null) };
}

function goOut(s: GameState, seat: number): GameState {
  s.log.push({ e: 'goOut', seat, concealed: !s.meldedBefore[seat] });
  return finishHand(s, seat);
}

/** R10 */
export function scoreHand(s: GameState, outSeat: number | null): [TeamHandScore, TeamHandScore] {
  const concealed = outSeat !== null && !s.meldedBefore[outSeat];
  return ([0, 1] as Team[]).map((team) => {
    const melds = s.melds[team];
    const meldPoints = melds.reduce((n, m) => n + sumPoints(m.cards), 0);
    let naturalCanastas = 0, mixedCanastas = 0;
    for (const m of melds) if (m.cards.length >= 7) (m.cards.every(isNatural) ? naturalCanastas++ : mixedCanastas++);
    const canastaBonus = naturalCanastas * 500 + mixedCanastas * 300;
    const n3 = s.red3s[team].length;
    const red3Raw = n3 === 4 ? 800 : n3 * 100;
    const red3 = melds.length > 0 ? red3Raw : -red3Raw;
    const goingOut = outSeat !== null && teamOf(outSeat) === team ? (concealed ? 200 : 100) : 0;
    let handPenalty = 0;
    s.hands.forEach((h, seat) => { if (teamOf(seat) === team) handPenalty += h.reduce((n, c) => n + cardPoints(c), 0); });
    const total = meldPoints + canastaBonus + red3 + goingOut - handPenalty;
    return { meldPoints, canastaBonus, naturalCanastas, mixedCanastas, red3, goingOut, handPenalty, total };
  }) as [TeamHandScore, TeamHandScore];
}

function finishHand(s: GameState, outSeat: number | null): GameState {
  const teams = scoreHand(s, outSeat);
  s.scores = [s.scores[0] + teams[0].total, s.scores[1] + teams[1].total];
  const result: HandResult = {
    hand: s.hand, outSeat, concealed: outSeat !== null && !s.meldedBefore[outSeat], teams, scoresAfter: [...s.scores],
  };
  s.history.push(result);
  s.goOut = null;
  // R10.1
  const [a, b] = s.scores;
  const t = s.rules.target;
  if (a >= t || b >= t) {
    s.phase = 'gameOver';
    s.winner = a === b ? 'tie' : a > b ? 0 : 1;
  } else {
    s.phase = 'handOver';
  }
  return s;
}

function nextHand(state: GameState): Result {
  if (state.phase !== 'handOver') return fail('wrong_phase');
  const s = structuredClone(state);
  s.hand += 1;
  s.dealer = (s.dealer + 1) % s.rules.players;
  deal(s);
  return { ok: true, state: s };
}

/** Every card in the game, for conservation checks. */
export function allCards(s: GameState): Card[] {
  return [
    ...s.hands.flat(), ...s.stock, ...s.pile,
    ...s.melds[0].flatMap((m) => m.cards), ...s.melds[1].flatMap((m) => m.cards),
    ...s.red3s[0], ...s.red3s[1],
  ];
}
