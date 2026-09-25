import { botAction } from './bot';
import { type Action, actorOf, apply } from './engine';
import type { GameState } from './state';
import { viewFor } from './view';

export * from './cards';
export * from './rules';
export * from './state';
export * from './engine';
export * from './view';
export { botAction } from './bot';

/** Let a bot act for whichever seat the game is waiting on. Always makes progress. */
export function botStep(s: GameState): { state: GameState; seat: number; action: Action } {
  const seat = actorOf(s);
  if (seat === null) throw new Error('No one to act');
  const legal = (a: Action) => apply(s, seat, a).ok;
  const action = botAction(viewFor(s, seat), legal);
  const r = apply(s, seat, action);
  if (r.ok) return { state: r.state, seat, action };
  const fallbacks: Action[] = s.phase === 'draw'
    ? [{ t: 'draw' }, { t: 'endHand' }]
    : s.hands[seat].map((c) => ({ t: 'discard', card: c.id }) as Action);
  for (const a of fallbacks) {
    const f = apply(s, seat, a);
    if (f.ok) return { state: f.state, seat, action: a };
  }
  throw new Error(`Bot stuck: ${r.code}`);
}
