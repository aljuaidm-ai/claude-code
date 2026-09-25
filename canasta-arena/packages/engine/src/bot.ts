import { type Card, cardPoints, isBlack3, isNatural, isWild, type Rank, sumPoints } from './cards';
import type { Action } from './engine';
import { initialMeldMinimum } from './rules';
import { type Meld, partnerOf, teamOf } from './state';
import type { PlayerView } from './view';

/**
 * A rule-based "Normal" bot. It only sees its PlayerView, and it checks every action with
 * `legal` before choosing it, so it can never make an illegal move.
 */
export function botAction(v: PlayerView, legal: (a: Action) => boolean): Action {
  if (v.goOut?.status === 'pending' && partnerOf(v.goOut.asker) === v.seat) {
    return { t: 'answer', yes: handValue(v.hand) <= 80 };
  }
  if (v.phase === 'draw') return drawDecision(v, legal);
  return playDecision(v, legal);
}

const handValue = (cards: readonly Card[]) => cards.reduce((n, c) => n + cardPoints(c), 0);

function drawDecision(v: PlayerView, legal: (a: Action) => boolean): Action {
  const take = pileOption(v);
  if (take && legal(take)) return take;
  if (v.stockCount === 0) return { t: 'endHand' };
  return { t: 'draw' };
}

function pileOption(v: PlayerView): Action | null {
  const top = v.pileTop;
  if (!top || isWild(top) || isBlack3(top)) return null;
  const team = teamOf(v.seat);
  const melds = v.melds[team];
  const frozen = v.pileFrozenAll || melds.length === 0;
  const naturals = v.hand.filter((c) => isNatural(c) && c.rank === top.rank);
  const wilds = v.hand.filter(isWild).sort((a, b) => cardPoints(a) - cardPoints(b));
  const existing = melds.some((m) => m.rank === top.rank);

  let pair: Card[] | null = null;
  if (naturals.length >= 2) pair = naturals;
  else if (!frozen && existing) pair = [];
  else if (!frozen && naturals.length === 1 && wilds.length > 0 && v.pileCount >= 4) pair = [naturals[0], wilds[0]];
  if (!pair) return null;

  if (melds.length > 0) return { t: 'takePile', pair: pair.map((c) => c.id) };

  // First meld of the hand: add melds from the hand to reach the minimum (R5.6).
  const need = initialMeldMinimum(v.scores[team]) - sumPoints([top, ...pair]);
  const used = new Set(pair.map((c) => c.id));
  const rest = v.hand.filter((c) => !used.has(c.id));
  const extras = need > 0 ? meldsReaching(rest, need, v.rules.maxWildsPerMeld, new Set([top.rank])) : [];
  if (extras === null) return null;
  return { t: 'takePile', pair: pair.map((c) => c.id), extraMelds: extras.map((m) => m.map((c) => c.id)) };
}

/** Greedy: natural triples first, then pairs with a wild, until `need` points are reached. */
function meldsReaching(hand: readonly Card[], need: number, maxW: number, skip: Set<Rank>): Card[][] | null {
  const groups = naturalGroups(hand, skip);
  const wilds = hand.filter(isWild).sort((a, b) => cardPoints(a) - cardPoints(b));
  const melds: Card[][] = [];
  let pts = 0;
  const byValue = [...groups.values()].sort((a, b) => sumPoints(b) - sumPoints(a));
  for (const g of byValue) if (g.length >= 3 && pts < need) { melds.push(g); pts += sumPoints(g); }
  for (const g of byValue) {
    if (pts >= need) break;
    if (g.length === 2 && wilds.length > 0) {
      const m = [...g, wilds.shift()!];
      melds.push(m);
      pts += sumPoints(m);
    }
  }
  // Still short: add remaining wilds to melds that have room.
  for (const m of melds) {
    while (pts < need && wilds.length > 0 && m.filter(isWild).length < maxW) {
      const w = wilds.shift()!;
      m.push(w);
      pts += cardPoints(w);
    }
  }
  return pts >= need ? melds : null;
}

function naturalGroups(hand: readonly Card[], skip: Set<Rank> = new Set()): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>();
  for (const c of hand) {
    if (!isNatural(c) || c.rank === '3' || skip.has(c.rank)) continue;
    groups.set(c.rank, [...(groups.get(c.rank) ?? []), c]);
  }
  return groups;
}

interface Plan {
  newMelds: Card[][];
  additions: { meld: Meld; cards: Card[] }[];
  remaining: Card[];
  canastas: number;
}

/** Plan this turn's melds. With `allOut`, try to use every card (to go out). */
function planPlays(v: PlayerView, allOut: boolean): Plan | null {
  const team = teamOf(v.seat);
  const melds = v.melds[team];
  const maxW = v.rules.maxWildsPerMeld;
  const byRank = new Map(melds.map((m) => [m.rank, m]));
  const groups = naturalGroups(v.hand);
  const wilds = v.hand.filter(isWild).sort((a, b) => cardPoints(a) - cardPoints(b));
  const newMelds: Card[][] = [];
  const additions: { meld: Meld; cards: Card[] }[] = [];

  for (const [rank, g] of groups) {
    const m = byRank.get(rank);
    if (m) additions.push({ meld: m, cards: [...g] });
    else if (g.length >= 3) newMelds.push([...g]);
  }
  const pairs = [...groups.entries()].filter(([r, g]) => !byRank.has(r) && g.length === 2).map(([, g]) => g);

  // First meld: must reach the minimum, using pairs + wilds if necessary.
  if (melds.length === 0) {
    const need = initialMeldMinimum(v.scores[team]);
    let pts = newMelds.reduce((n, m) => n + sumPoints(m), 0);
    for (const p of pairs.sort((a, b) => sumPoints(b) - sumPoints(a))) {
      if ((pts >= need && !allOut) || wilds.length === 0) break;
      const m = [...p, wilds.shift()!];
      newMelds.push(m);
      pts += sumPoints(m);
    }
    if (pts < need && !allOut) return null;
  } else if (allOut) {
    for (const p of pairs) if (wilds.length > 0) newMelds.push([...p, wilds.shift()!]);
  }

  // Use wilds to complete canastas (sizes 5-6), and when going out, place all of them.
  const sizeOf = (m: Card[] | Meld) => {
    if (Array.isArray(m)) return m.length;
    return m.cards.length + additions.filter((a) => a.meld === m).reduce((n, a) => n + a.cards.length, 0);
  };
  const wildsIn = (m: Card[] | Meld) => {
    if (Array.isArray(m)) return m.filter(isWild).length;
    return m.cards.filter(isWild).length + additions.filter((a) => a.meld === m).reduce((n, a) => n + a.cards.filter(isWild).length, 0);
  };
  const targets: (Card[] | Meld)[] = [...melds.filter((m) => m.rank !== '3'), ...newMelds];
  for (const t of targets) {
    while (wilds.length > 0 && wildsIn(t) < maxW && (allOut || (sizeOf(t) >= 5 && sizeOf(t) < 7))) {
      const w = wilds.shift()!;
      if (Array.isArray(t)) t.push(w); else additions.push({ meld: t, cards: [w] });
    }
  }

  if (allOut) {
    const b3 = v.hand.filter(isBlack3);
    if (b3.length >= 3) newMelds.push(b3);
  }

  const used = new Set([...newMelds.flat(), ...additions.flatMap((a) => a.cards)].map((c) => c.id));
  const remaining = v.hand.filter((c) => !used.has(c.id));
  let canastas = 0;
  for (const m of melds) if (sizeOf(m) >= 7) canastas++;
  for (const m of newMelds) if (m.length >= 7) canastas++;
  return { newMelds, additions, remaining, canastas };
}

const toAction = (p: Plan): Action => ({
  t: 'play',
  newMelds: p.newMelds.map((m) => m.map((c) => c.id)),
  additions: p.additions.map((a) => ({ meldId: a.meld.id, cards: a.cards.map((c) => c.id) })),
});

const isEmpty = (p: Plan) => p.newMelds.length === 0 && p.additions.length === 0;

/** Drop plays (cheapest first) until at least two cards stay in hand. */
function trimToKeepTwo(v: PlayerView, p: Plan): Plan | null {
  const plan: Plan = { ...p, newMelds: [...p.newMelds], additions: [...p.additions], remaining: [...p.remaining] };
  while (plan.remaining.length < 2) {
    if (plan.additions.length > 0) plan.remaining.push(...plan.additions.pop()!.cards);
    else if (plan.newMelds.length > (v.melds[teamOf(v.seat)].length === 0 ? 1 : 0)) plan.remaining.push(...plan.newMelds.pop()!);
    else return null;
  }
  return plan;
}

function playDecision(v: PlayerView, legal: (a: Action) => boolean): Action {
  const needAsk = v.rules.players === 4 && v.rules.askPartnerToGoOut;
  const permitted = !needAsk || (v.goOut?.asker === v.seat && v.goOut.status === 'yes');

  // Try to go out.
  const out = planPlays(v, true);
  if (out && out.remaining.length <= 1 && out.canastas >= v.rules.canastasToGoOut) {
    if (!permitted && needAsk && v.goOut === null && !v.meldedThisTurn && legal({ t: 'ask' })) return { t: 'ask' };
    if (permitted) {
      if (!isEmpty(out) && legal(toAction(out))) return toAction(out);
      if (v.hand.length === 1 && legal({ t: 'discard', card: v.hand[0].id })) return { t: 'discard', card: v.hand[0].id };
    }
  }

  // Normal melding, keeping two cards.
  if (!v.meldedThisTurn || v.melds[teamOf(v.seat)].length > 0) {
    const p = planPlays(v, false);
    const kept = p && !isEmpty(p) ? trimToKeepTwo(v, p) : null;
    if (kept && !isEmpty(kept)) {
      const a = toAction(kept);
      if (legal(a)) return a;
    }
  }
  return chooseDiscard(v, legal);
}

function chooseDiscard(v: PlayerView, legal: (a: Action) => boolean): Action {
  const oppTeam = teamOf(v.seat + 1);
  const oppMelds = v.melds[oppTeam];
  const oppCanTake = !v.pileFrozenAll && oppMelds.length > 0;
  const counts = new Map<Rank, number>();
  for (const c of v.hand) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
  const score = (c: Card): number => {
    if (isWild(c)) return 1000 + cardPoints(c);
    if (isBlack3(c)) return -100;
    let s = cardPoints(c) + (counts.get(c.rank)! - 1) * 40;
    if (oppCanTake && oppMelds.some((m) => m.rank === c.rank)) s += 300;
    if (v.melds[teamOf(v.seat)].some((m) => m.rank === c.rank)) s += 60;
    return s;
  };
  const ordered = [...v.hand].sort((a, b) => score(a) - score(b));
  for (const c of ordered) {
    const a: Action = { t: 'discard', card: c.id };
    if (legal(a)) return a;
  }
  return { t: 'discard', card: ordered[0].id };
}
