import { describe, expect, it } from 'vitest';
import { apply, type Result, scoreHand } from '../src/engine';
import { CLASSIC_DOUBLES, CLASSIC_SINGLES } from '../src/rules';
import type { GameState } from '../src/state';
import { c, cards, ids, makeState, meld } from './helpers';

const err = (r: Result) => (r.ok ? 'ok' : r.code);
const ok = (r: Result): GameState => { if (!r.ok) throw new Error(r.code); return r.state; };
const canasta = (id: string, rank: 'K' | 'Q' | 'A') => meld(id, cards(rank, rank, rank, rank, rank, rank, rank));

describe('R7 going out', () => {
  it('R7.1 needs two canastas', () => {
    const hand = cards('5');
    const one = makeState(CLASSIC_SINGLES, { hands: [hand, cards('4')], melds: [[canasta('a', 'K')], []] });
    expect(err(apply(one, 0, { t: 'discard', card: hand[0].id }))).toBe('need_canastas');
    const two = makeState(CLASSIC_SINGLES, { hands: [hand, cards('4')], melds: [[canasta('a', 'K'), canasta('b', 'Q')], []] });
    const n = ok(apply(two, 0, { t: 'discard', card: hand[0].id }));
    expect(n.phase).toBe('handOver');
    expect(n.history[0].outSeat).toBe(0);
    expect(n.history[0].teams[0].goingOut).toBe(100);
  });
  it('R7.2 go out by melding every card', () => {
    const hand = cards('A', 'A', 'A');
    const s = makeState(CLASSIC_SINGLES, { hands: [hand, cards('4')], melds: [[canasta('a', 'K'), canasta('b', 'Q')], []] });
    expect(ok(apply(s, 0, { t: 'play', newMelds: [ids(hand)] })).phase).toBe('handOver');
  });
  it('R6.4 black 3s can be melded when going out', () => {
    const hand = [c('3', 'S'), c('3', 'C'), c('3', 'S'), c('9')];
    const s = makeState(CLASSIC_SINGLES, { hands: [hand, cards('4')], melds: [[canasta('a', 'K'), canasta('b', 'Q')], []] });
    const n = ok(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 3))] }));
    expect(ok(apply(n, 0, { t: 'discard', card: hand[3].id })).phase).toBe('handOver');
  });
  it('R7.3 Doubles: must ask partner, and needs a yes', () => {
    const hand = cards('5');
    const s = makeState(CLASSIC_DOUBLES, { hands: [hand, [], cards('9'), []], melds: [[canasta('a', 'K'), canasta('b', 'Q')], []] });
    expect(err(apply(s, 0, { t: 'discard', card: hand[0].id }))).toBe('need_permission');
    const asked = ok(apply(s, 0, { t: 'ask' }));
    expect(err(apply(asked, 0, { t: 'discard', card: hand[0].id }))).toBe('waiting_partner');
    expect(err(apply(asked, 1, { t: 'answer', yes: true }))).toBe('not_your_turn');
    const no = ok(apply(asked, 2, { t: 'answer', yes: false }));
    expect(err(apply(no, 0, { t: 'discard', card: hand[0].id }))).toBe('need_permission');
    const yes = ok(apply(asked, 2, { t: 'answer', yes: true }));
    expect(ok(apply(yes, 0, { t: 'discard', card: hand[0].id })).phase).toBe('handOver');
  });
  it('R7.3 ask before melding', () => {
    const s = makeState(CLASSIC_DOUBLES, { meldedThisTurn: true, hands: [cards('5', '6'), [], [], []] });
    expect(err(apply(s, 0, { t: 'ask' }))).toBe('ask_before_melding');
    expect(err(apply(makeState(CLASSIC_SINGLES), 0, { t: 'ask' }))).toBe('cannot_ask');
  });
  it('R7.4 concealed going out scores 200 and skips the minimum', () => {
    const hand = cards('A', 'A', 'A', 'A', 'A', 'A', 'A', '5', '5', '5', '5', '5', '5', '5');
    const s = makeState(CLASSIC_SINGLES, {
      hands: [hand, cards('4')], meldedBefore: [false, true], scores: [3000, 0],
    });
    const n = ok(apply(s, 0, { t: 'play', newMelds: [ids(hand.slice(0, 7)), ids(hand.slice(7))] }));
    expect(n.history[0].concealed).toBe(true);
    expect(n.history[0].teams[0].goingOut).toBe(200);
  });
});

describe('R8/R10 scoring', () => {
  it('adds canastas, red 3s, going out and card values; subtracts cards in hand', () => {
    const natural = canasta('a', 'K');                                        // 70 pts, +500
    const mixed = meld('b', [...cards('Q', 'Q', 'Q', 'Q', 'Q'), c('2'), c('JK')]); // 120 pts, +300
    const s = makeState(CLASSIC_SINGLES, {
      hands: [[], [c('A'), c('JK')]],
      melds: [[natural, mixed], []],
      red3s: [[c('3', 'H'), c('3', 'D'), c('3', 'H'), c('3', 'D')], []],
    });
    const [us, them] = scoreHand(s, 0);
    expect(us).toMatchObject({ meldPoints: 190, canastaBonus: 800, red3: 800, goingOut: 100, handPenalty: 0, total: 1890 });
    expect(them.total).toBe(-70);
  });
  it('R8.2 red 3s count against a side that has not melded', () => {
    const s = makeState(CLASSIC_SINGLES, { hands: [[], []], red3s: [[], [c('3', 'H')]] });
    expect(scoreHand(s, null)[1].red3).toBe(-100);
  });
  it('R10.1 the game ends when a side reaches the target', () => {
    const hand = cards('5');
    const s = makeState(CLASSIC_SINGLES, {
      scores: [4200, 1000], hands: [hand, cards('4')], melds: [[canasta('a', 'K'), canasta('b', 'Q')], []],
    });
    const n = ok(apply(s, 0, { t: 'discard', card: hand[0].id }));
    expect(n.phase).toBe('gameOver');
    expect(n.winner).toBe(0);
  });
});
