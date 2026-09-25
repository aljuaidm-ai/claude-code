import { describe, expect, it } from 'vitest';
import { apply, type Result } from '../src/engine';
import { CLASSIC_DOUBLES, CLASSIC_SINGLES } from '../src/rules';
import type { GameState } from '../src/state';
import { c, cards, ids, makeState, meld } from './helpers';

const err = (r: Result) => (r.ok ? 'ok' : r.code);
const ok = (r: Result): GameState => { if (!r.ok) throw new Error(r.code); return r.state; };

describe('R6 melds', () => {
  const melded = (hand = cards('K', 'K', 'K', '5', '6')) =>
    makeState(CLASSIC_SINGLES, { hands: [hand, cards('4', '4')], melds: [[meld('a', cards('A', 'A', 'A'))], []] });

  it('R6.1 accepts three naturals', () => {
    const s = melded();
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(s.hands[0].slice(0, 3))] }))).toBe('ok');
  });
  it('R6.1 needs at least two naturals', () => {
    const hand = [c('K'), c('2'), c('JK'), c('5'), c('6')];
    const s = melded(hand);
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3))] }))).toBe('need_two_naturals');
  });
  it('R6.1 allows at most three wild cards', () => {
    const hand = [c('K'), c('K'), c('2'), c('2'), c('2'), c('JK'), c('5'), c('6')];
    const s = melded(hand);
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 6))] }))).toBe('too_many_wilds');
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 5))] }))).toBe('ok');
  });
  it('R6.1 needs at least three cards', () => {
    const s = melded();
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(s.hands[0].slice(0, 2))] }))).toBe('meld_too_small');
  });
  it('R6.2 one meld per rank: a second meld of Aces is rejected, adding works', () => {
    const hand = cards('A', 'A', 'A', '5', '6');
    const s = melded(hand);
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3))] }))).toBe('rank_exists');
    expect(err(apply(s, 0, { t: 'play', additions: [{ meldId: 'a', cards: ids(hand.slice(0, 3)) }] }))).toBe('ok');
  });
  it('R6.4 black 3s only when going out', () => {
    const hand = [c('3', 'S'), c('3', 'C'), c('3', 'S'), c('5'), c('6')];
    const s = melded(hand);
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3))] }))).toBe('black3_only_going_out');
  });
  it('R6.6 first meld must reach the minimum (50 at score 0)', () => {
    const hand = cards('K', 'K', 'K', 'A', 'A', 'JK', '5', '6');
    const s = makeState(CLASSIC_SINGLES, { hands: [hand, cards('4', '4')] });
    const r = apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3))] });
    expect(r.ok ? null : r.params).toEqual({ need: 50, have: 30 });
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3)), ids(hand.slice(3, 6))] }))).toBe('ok');
  });
  it('R6.6 the minimum is 90 at 1500 points', () => {
    const hand = cards('K', 'K', 'K', 'Q', 'Q', 'Q', '5', '6');
    const s = makeState(CLASSIC_SINGLES, { hands: [hand, cards('4', '4')], scores: [1500, 0] });
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3)), ids(hand.slice(3, 6))] }))).toBe('minimum_not_met');
  });
  it('R6.7 must keep a card to discard unless going out', () => {
    const hand = cards('K', 'K', 'K', '5');
    const s = melded(hand);
    expect(err(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3))] }))).toBe('keep_one_card');
  });
  it('R6.5 logs a canasta when a meld reaches seven cards', () => {
    const hand = cards('A', 'A', 'A', 'A', '5', '6');
    const s = melded(hand);
    const n = ok(apply(s, 0, { t: 'play', additions: [{ meldId: 'a', cards: ids(hand.slice(0, 4)) }] }));
    expect(n.log).toContainEqual({ e: 'canasta', seat: 0, rank: 'A', natural: true });
  });
});

describe('R5 taking the pile', () => {
  it('R5.1 cannot take a pile topped by a black 3 or a wild card', () => {
    const hand = cards('K', 'K');
    for (const top of [c('3', 'C'), c('2')]) {
      const s = makeState(CLASSIC_SINGLES, { phase: 'draw', hands: [hand, []], pile: [top] });
      expect(err(apply(s, 0, { t: 'takePile', pair: ids(hand) }))).toBe('pile_top_unusable');
    }
  });
  it('R5.2(a)/R5.3 before melding, a natural pair is required', () => {
    const hand = [c('K'), c('2'), c('Q'), c('Q'), c('Q')];
    const s = makeState(CLASSIC_SINGLES, { phase: 'draw', hands: [hand, []], pile: [c('5'), c('K')] });
    expect(err(apply(s, 0, { t: 'takePile', pair: ids(hand.slice(0, 2)) }))).toBe('pile_frozen_needs_pair');
  });
  it('R5.6 first meld from the pile counts the top card and extra melds from hand', () => {
    const hand = cards('K', 'K', 'Q', 'Q', 'Q', '9');
    const s = makeState(CLASSIC_SINGLES, { phase: 'draw', hands: [hand, []], pile: [c('5'), c('K')] });
    expect(err(apply(s, 0, { t: 'takePile', pair: ids(hand.slice(0, 2)) }))).toBe('minimum_not_met');
    const n = ok(apply(s, 0, { t: 'takePile', pair: ids(hand.slice(0, 2)), extraMelds: [ids(hand.slice(2, 5))] }));
    expect(n.melds[0].map((m) => m.cards.length)).toEqual([3, 3]);
    expect(n.hands[0].map((x) => x.rank).sort()).toEqual(['5', '9']);
    expect(n.pile).toEqual([]);
    expect(n.phase).toBe('play');
  });
  it('R5.4(b) unfrozen pile: one natural plus a wild', () => {
    const hand = cards('K', '2', '5', '6');
    const s = makeState(CLASSIC_SINGLES, {
      phase: 'draw', hands: [hand, []], pile: [c('7'), c('K')], melds: [[meld('a', cards('A', 'A', 'A'))], []],
    });
    expect(err(apply(s, 0, { t: 'takePile', pair: ids(hand.slice(0, 2)) }))).toBe('ok');
    expect(err(apply({ ...s, pileFrozenAll: true }, 0, { t: 'takePile', pair: ids(hand.slice(0, 2)) }))).toBe('pile_frozen_needs_pair');
  });
  it('R5.4(c) add the top card to an existing meld', () => {
    const s = makeState(CLASSIC_SINGLES, {
      phase: 'draw', hands: [cards('5', '6'), []], pile: [c('7'), c('A')], melds: [[meld('a', cards('A', 'A', 'A'))], []],
    });
    const n = ok(apply(s, 0, { t: 'takePile', pair: [] }));
    expect(n.melds[0][0].cards).toHaveLength(4);
    expect(n.hands[0]).toHaveLength(3);
  });
  it('R5.5 red 3s in the pile are laid down', () => {
    const s = makeState(CLASSIC_SINGLES, {
      phase: 'draw', hands: [cards('5', '6'), []], pile: [c('3', 'H'), c('7'), c('A')],
      pileFrozenAll: false, melds: [[meld('a', cards('A', 'A', 'A'))], []],
    });
    const n = ok(apply(s, 0, { t: 'takePile', pair: [] }));
    expect(n.red3s[0]).toHaveLength(1);
    expect(n.hands[0].some((x) => x.rank === '3')).toBe(false);
  });
  it('R4.5 discarding a wild card freezes the pile', () => {
    const hand = cards('2', '5', '6');
    const s = makeState(CLASSIC_SINGLES, { hands: [hand, cards('4')] });
    expect(ok(apply(s, 0, { t: 'discard', card: hand[0].id })).pileFrozenAll).toBe(true);
  });
});

describe('R4 drawing', () => {
  it('R4.1 Singles draws two cards, Doubles one', () => {
    const s2 = makeState(CLASSIC_SINGLES, { phase: 'draw', hands: [cards('5'), []] });
    expect(ok(apply(s2, 0, { t: 'draw' })).hands[0]).toHaveLength(3);
    const s4 = makeState(CLASSIC_DOUBLES, { phase: 'draw', hands: [cards('5'), [], [], []] });
    expect(ok(apply(s4, 0, { t: 'draw' })).hands[0]).toHaveLength(2);
  });
  it('R4.2 a drawn red 3 is laid down and replaced', () => {
    const s = makeState(CLASSIC_DOUBLES, { phase: 'draw', hands: [cards('5'), [], [], []], stock: [c('8'), c('3', 'D')] });
    const n = ok(apply(s, 0, { t: 'draw' }));
    expect(n.red3s[0]).toHaveLength(1);
    expect(n.hands[0].map((x) => x.rank)).toEqual(['5', '8']);
  });
  it('R9.1 a red 3 as the last stock card ends the hand', () => {
    const s = makeState(CLASSIC_DOUBLES, { phase: 'draw', hands: [cards('5'), [], [], []], stock: [c('3', 'D')] });
    expect(ok(apply(s, 0, { t: 'draw' })).phase).toBe('handOver');
  });
  it('only the player on turn can act', () => {
    const s = makeState(CLASSIC_SINGLES, { phase: 'draw' });
    expect(err(apply(s, 1, { t: 'draw' }))).toBe('not_your_turn');
  });
});

describe('R9 stock runs out', () => {
  it('R9.2 must take the pile when the top card fits a meld; otherwise the hand ends', () => {
    const base = { phase: 'draw' as const, stock: [], hands: [cards('5', '6'), cards('7')] };
    const forced = makeState(CLASSIC_SINGLES, { ...base, pile: [c('A')], melds: [[meld('a', cards('A', 'A', 'A'))], []] });
    expect(err(apply(forced, 0, { t: 'draw' }))).toBe('stock_empty');
    expect(err(apply(forced, 0, { t: 'endHand' }))).toBe('must_take_pile');
    const free = makeState(CLASSIC_SINGLES, { ...base, pile: [c('9')], melds: [[meld('a', cards('A', 'A', 'A'))], []] });
    const n = ok(apply(free, 0, { t: 'endHand' }));
    expect(n.phase).toBe('handOver');
    expect(n.history[0].outSeat).toBeNull();
  });
});
