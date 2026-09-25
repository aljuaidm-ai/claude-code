# Classic Canasta Arena

Classic Canasta for web and mobile: Singles, Singles Quick and Doubles, in English, Spanish, German and Arabic.

- Product plan: [`docs/canasta/PLAN.md`](../docs/canasta/PLAN.md)
- Rulebook (the engine follows it rule by rule): [`docs/canasta/RULES.md`](../docs/canasta/RULES.md)

## Layout

| Path | What it is |
|---|---|
| `packages/engine` | Pure TypeScript rules engine: deal, draw, pile, melds, going out, scoring, a rule-based bot, and a per-seat `viewFor()` that hides other players' cards. |
| `apps/web` | React prototype: play against computer players, with Salon and Club Felt tables and an Arena-style home screen. |

## Playing (no action buttons; everything happens on the table)

| To... | Tap... |
|---|---|
| Draw | the stock (tap it when empty to end the hand) |
| Take the pile | select your matching cards, then the pile |
| Meld | select cards, then your meld area |
| Add to a meld | select cards, then that meld |
| Discard | select one card, then the pile (or double-tap the card) |
| Ask "May I go out?" (Doubles) | your partner |

A first meld below the minimum stays on the table with a dashed outline, and the progress shows next to the pile. It is laid down as soon as it reaches the minimum. Tap it with no cards selected to take it back.

## Commands

```sh
npm install
npm test               # engine tests, including 75 full bot-vs-bot games
npm run typecheck
npm run dev            # play locally at http://localhost:5173
npm run build          # static site in apps/web/dist
npm run build:artifact -w @cca/web   # single-file page in apps/web/dist-artifact
```

## How the engine works

`apply(state, seat, action)` returns either a new state or an error code, such as `minimum_not_met` with `{ need, have }`.
The server (and for now the web prototype) sends only codes and events. Each client writes them out in its player's own language.
