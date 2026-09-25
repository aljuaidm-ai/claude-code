# Canasta Arena — Product & Technical Plan (Draft v0.1)

> A fun, competitive home for Canasta players on web and mobile. It brings back the
> Yahoo! Games lobby-and-table community feel and adds what modern games do well:
> ranked seasons, smooth animations, cross-platform play, and fair matchmaking.

This is a **working draft**. Anything marked **[YOU DECIDE]** is a question for you as
a Canasta player. Your answers shape the rules engine and the UI.

---

## 1. Research summary

### 1.1 What made Yahoo! Games great (1998–2016)
- **Lobbies and rooms.** You entered a named room ("Social", "Intermediate", "Advanced",
  "Ladder") and saw a list of **tables**: who sat where, which seats were open, and
  whether a table was rated. You could join a table or watch it.
- **The rating number next to your name** (e.g. 1500 ± ...) was an identity and a status symbol.
- **Chat everywhere.** Room chat, table chat, and private messages. Regulars knew each other.
- **Ladders** gave people a reason to come back every night.
- **Host controls.** The table host picked the rules, invited or booted players, and
  could make the table private.
- **Why it closed:** it was built on Java applets and later Flash. When browsers dropped
  those plug-ins, Yahoo decided a rewrite wasn't worth it (all games were shut down by 2016).
  **Lesson:** build on open web standards and keep the rules engine separate from the UI
  so the product outlives any one front end.

### 1.2 Where Canasta is played online today
| Product | Strengths | Gaps we can exploit |
|---|---|---|
| **Canasta Junction** (CLA official) | CLA rules, 2 & 4 players, private tables, stats, spectators | Dated look, niche, limited "game feel" |
| **Canasta – Fun & Friends** (GameDuell) | Leagues, live players | Coin/ads-heavy, European rule bias |
| **PlayOK** | Big international player base, ratings, game records | Very bare UI, no personality |
| **Canasta Palace**, **cardgames.io**, Rare Pike | No sign-up needed, tutorials | Mostly vs-AI or casual, weak community |
| Mobile single-player apps (Litegames, Northsky) | Polished for solo play | Little or no real competition |

**Opportunity:** no one combines (a) a real community lobby, (b) modern game polish,
(c) serious, fair competitive ranking for **both 1v1 and 2v2**, and (d) **configurable
house rules** so each group can play the way they play at home.

---

## 2. Product vision and pillars

1. **Feels like a real card table.** Smooth dealing, satisfying melds, a "CANASTA!"
   moment with sound and a burst of light.
2. **Community first.** Lobby rooms, friends, clubs, chat, spectating, regulars.
3. **Fair competition.** Server-authoritative play, separate ratings for each mode, seasons.
4. **Your rules.** Classic, Modern American (CLA), and house variants, all clearly labeled.
5. **Play anywhere.** Web, iOS, and Android with one account and cross-play.

---

## 3. Game modes

### 3.1 Table formats
| Format | Players | Notes |
|---|---|---|
| **Singles (1v1)** | 2 | Classic 2-player: draw 2 / discard 1 (configurable) |
| **Doubles (2v2)** | 4 | Partners sit opposite; partner signals via quick-chat only |
| **Vs Bots** | 1 + AI | Practice, tutorial, fill empty seats (unrated) |

### 3.2 "Go-out" requirement (your request)
- **1 Canasta to go out**: faster games, more aggressive.
- **2 Canastas to go out**: more strategic, bigger hands.
- This is a **table rule** and part of the **ladder identity**. Each combination gets
  its own rating: e.g. `Singles · 2-Canasta`, `Doubles · 1-Canasta`.

### 3.3 Rule sets (the engine supports all of them as data, not code forks)
| Setting | Options |
|---|---|
| Rule family | Classic (Hoyle) · Modern American / CLA · House |
| Deck | 2 decks + 4 jokers (108) · 3 decks for 3+ variants later |
| Initial meld minimum | by score: 50 / 90 / 120 (Classic) · CLA table (50/90/120/150) · custom |
| Picking up the pile | natural pair only · pair or matching + wild · frozen pile rules |
| Wild cards per meld | max 3 (Classic) · custom |
| Red 3s | 100 each, 800 for all four (Classic) · variants |
| Black 3s | stopper only · meldable when going out |
| Concealed go-out bonus | 100 / 200 |
| Game target | 5000 (Classic) · 8500 (CLA) · custom / timed |
| Draw count | 1 or 2 (Singles often 2) |
| Turn timer | Relaxed 60s · Standard 30s · Blitz 15s |

**[YOU DECIDE]** Which rule set should be the **default ranked** rules? What house rules
do you and your friends actually use?

---

## 4. Old-school community features (Yahoo DNA)
- **Lobby with rooms**: *Social*, *Beginner*, *Intermediate*, *Advanced*, *Ranked Ladder*,
  plus country/language rooms (for example English, Spanish, Arabic).
- **Table list**: seats, player names, ratings, flags, rule badges
  (`1C`/`2C`, `CLA`, `Blitz`), open/watch/private buttons.
- **Host controls**: set rules, invite, boot, lock, make private, rematch.
- **Room chat, table chat, private messages**, all with moderation tools.
- **Spectator mode** (watchers only see the public board; hands stay hidden, with a
  delay for ranked games).
- **"Regulars"**: friends list, "follow", see which room your friends are in.
- **Classic profile card**: rating, games played, win %, member since, favorite rules.

## 5. Modern features
- **Quick Match** matchmaking by mode and rating (Glicko-2), plus the classic lobby.
- **Seasons** (about 8 weeks) with tiers such as Bronze → Silver → Gold → Platinum →
  Diamond → **Canasta Master**, placement matches, and end-of-season rewards.
- **Partner system for Doubles**: queue with a friend, or solo-queue with a random
  partner. Keep a separate team rating for fixed pairs.
- **Clubs**: private groups with their own leaderboard, scheduled club nights, and
  club-vs-club events.
- **Tournaments**: daily Swiss/knockout events, weekend majors, and private tournaments
  for clubs.
- **Replays and hand history**: step through any finished game. Share a link.
- **Stats dashboard**: canastas per game, natural vs mixed ratio, pile pickups,
  go-out rate, average hand score.
- **Daily challenges and achievements** ("Make a natural canasta of Aces", "Go out
  concealed").
- **Cosmetics only**: card backs, felt colors, avatars, table themes, emotes.
  **Never pay-to-win.**
- **Smart AI bots** (Easy / Normal / Expert) for practice and for filling a seat when
  someone disconnects.
- **Reconnect and grace timer**: a dropped player gets 60s before a bot takes over.
- **Accessibility**: large-card mode, color-blind suits, 4-color deck option,
  screen-reader announcements, adjustable speed.
- **Localization** from day one, including RTL (Arabic) support.

---

## 6. UI / UX direction

### 6.1 Look and feel (initial proposal; you can change all of it)
- **Theme**: warm casino-club feel. Deep green or burgundy felt, wood rim, soft
  lighting. Offer a "Retro '99" skin as a nod to Yahoo.
- **Cards**: large, highly legible indices. Classic faces by default, with a modern
  flat option. The 4-color deck is optional.
- **Motion**: fast by default (under 250ms per action). Nothing blocks input.
  Big celebration moments only for a Canasta, going out, and winning.
- **Sound**: soft shuffles and card snaps. A distinct "Canasta!" chime. Everything can
  be muted.

### 6.2 Table layout: Doubles (landscape web/tablet)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Room: Advanced · Table 12 · CLA · 2-Canasta · Blitz     ⚙  💬  ⏻   │
├─────────────────────────────────────────────────────────────────────┤
│                        [ Partner  ▲ 1620 ]  (13 cards)              │
│   ┌─────────────── THEIR MELDS ────────────────┐                    │
│   │ K K K ★   9 9 9 9 2   [CANASTA 7s ■]       │  Score  THEM 2140  │
│   └────────────────────────────────────────────┘         US   2380  │
│ [Opp W 1580]      ┌──────┐   ┌──────┐          [Opp E 1602]         │
│ (11 cards)        │ DECK │   │ PILE │  ← frozen ❄ (14)  (9 cards)   │
│                   └──────┘   └──────┘                               │
│   ┌──────────────── OUR MELDS ─────────────────┐   Need: 90 to meld │
│   │ A A A A   7 7 7 JKR   [CANASTA Qs ■■ red]  │   Canastas: 1 / 2  │
│   └────────────────────────────────────────────┘   ⏱ 00:24          │
│                                                                     │
│   ┌───────────── YOUR HAND (sorted, drag or tap) ────────────────┐  │
│   │ 3♥ 4♣ 4♦ 6♠ 8♥ 8♦ J♣ J♠ Q♥ K♦ A♠ 2♣ JKR                      │  │
│   └──────────────────────────────────────────────────────────────┘  │
│   [ Meld ]  [ Add to meld ]  [ Take pile ]  [ Discard ]  [ Undo ]   │
│   Quick-chat: "Nice!"  "Can I go out?"  "Yes" "No"  "GG"            │
└─────────────────────────────────────────────────────────────────────┘
```
- **Rule helpers** you can toggle: "you need 90 to meld" hint, a glow on playable
  cards, a warning before you take a frozen pile, and a points preview before you meld.
- **"Can I go out?"**: a Doubles-only prompt that asks your partner, as in the real game.
  **[YOU DECIDE]** Should it be mandatory, optional, or a house rule?

### 6.3 Mobile (portrait) adaptations
- Opponents appear as compact avatars along the top. Meld areas collapse into
  expandable rows.
- Your hand fans along the bottom. Drag cards up to meld. Double-tap to discard.
- One-thumb reach: the main action buttons sit bottom-right.

### 6.4 Key screens
1. **Home**: Quick Match · Lobby · Play Bots · Clubs · Tournaments · Daily Challenge
2. **Lobby**: room list → table list (Yahoo-style) with filters (mode, rules, rating range)
3. **Table / Game**
4. **End-of-hand scoresheet**: a classic paper scorepad look, with breakdowns
   (base, canasta bonuses, red 3s, going out, cards left in hand)
5. **Profile and stats**, **Leaderboards** (global / country / friends / club)
6. **Replays**, **Settings**, **Shop (cosmetics)**, **Tutorial / How to play**

---

## 7. Technical architecture

### 7.1 Principles
- **Server-authoritative.** Clients send *intents* ("meld these cards") and the server
  validates them. Hidden information (other hands, the deck order) **never leaves the server**.
- **Pure, shared rules engine.** One TypeScript package, deterministic and
  side-effect-free: `(state, action, rules) → newState | error`. The server, the web
  client (for instant previews and hints), the bots, and the replay viewer all use it.
- **Rules as data.** Every variant in §3.3 is a `RuleSet` config object, so a new house
  rule is a config change, not a code fork.

### 7.2 Proposed stack
| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** everywhere | One engine shared by client, server, and bots |
| Monorepo | pnpm workspaces + Turborepo | `engine`, `server`, `web`, `mobile`, `bots` |
| Web client | **React + Vite** (or Next.js for marketing/SEO pages) | Mature, fast |
| Card rendering | **PixiJS** (WebGL) for the table; React for menus | 60fps animation on low-end phones |
| Mobile | **Capacitor** wrapping the web app (phase 1); React Native later if needed | Ship iOS/Android fast with one codebase |
| Realtime | **Colyseus** (Node) or a custom WebSocket server | Rooms, state sync, reconnect built in |
| Data | **PostgreSQL** (accounts, games, ratings) + **Redis** (presence, lobby, matchmaking queues) | Standard and scalable |
| Auth | Email + Apple/Google sign-in, guest accounts that upgrade later | Low friction |
| Chat moderation | Profanity filter + report/mute/block + moderator tools | Community health |
| Hosting | Containers on Fly.io / AWS / GCP, regional game servers | Low latency |
| Analytics | PostHog (self-hostable) | Funnels, retention |

### 7.3 Engine core (sketch)
```ts
type Rank = 'A'|'2'|'3'|...|'K'|'JOKER';
interface RuleSet { family: 'classic'|'cla'|'house'; canastasToGoOut: 1|2;
  initialMeld: Array<{ minScore: number; required: number }>;
  drawCount: 1|2; maxWildsPerMeld: number; pileRules: PileRules; target: number; ... }
type Action =
  | { t: 'draw' } | { t: 'takePile'; using: CardId[] }
  | { t: 'meld'; cards: CardId[] } | { t: 'addToMeld'; meldId: string; cards: CardId[] }
  | { t: 'discard'; card: CardId } | { t: 'askGoOut' } | { t: 'answerGoOut'; yes: boolean };
function apply(state: GameState, a: Action, by: Seat, rules: RuleSet): Result<GameState>;
function score(hand: HandState, rules: RuleSet): TeamScore;
function viewFor(state: GameState, seat: Seat | 'spectator'): PublicView; // strips hidden info
```
- **Tests**: thousands of property-based tests (the card count always equals 108;
  no illegal meld is ever accepted), plus golden tests taken from official rulebook examples.
- **Seeded shuffles** logged per game for replays and audits. A commit-reveal of the
  seed can prove the deal was fair.

### 7.4 Bots
- **v1**: rule-based heuristics (meld priorities, pile-freezing strategy, discard safety).
- **v2**: Monte Carlo sampling over hidden hands (determinized search) for Expert level.
- Bots must use the same `viewFor()` as humans, so **they cannot cheat**.

### 7.5 Fair play
- Collusion detection in Singles (unusual discard patterns between the same accounts)
  and abandon/rage-quit penalties.
- Rating decay for inactive players at the top of the ladder. Placement matches for new
  accounts. Smurf detection.

---

## 8. Monetization (player-friendly)
- **Free to play**, with every game mode free.
- **Cosmetics** (card backs, felts, avatars, emotes) and an optional **Club Pass /
  Season Pass**.
- **Premium membership**: no ads, advanced stats, unlimited replays, private
  tournaments, custom club badges.
- Ads, if any, appear only between games and never during a hand.
- **No real-money gambling** and no pay-to-win mechanics.

---

## 9. Roadmap

| Phase | Duration (est.) | Deliverables |
|---|---|---|
| **0. Rules lock** | 1–2 wks | Finalize default rule sets with you; write the rules spec + test cases |
| **1. Engine + prototype** | 3–4 wks | Rules engine + tests, playable web prototype vs bots (Singles & Doubles, 1C/2C) |
| **2. Online MVP** | 6–8 wks | Accounts, realtime server, Yahoo-style lobby & tables, chat, private tables, reconnect, basic ratings |
| **3. Closed beta** | 4 wks | Invite Canasta players and clubs; balance bots; tune the UI from feedback |
| **4. Launch (web + mobile)** | 4–6 wks | Capacitor iOS/Android, Quick Match, seasons, profiles/stats, spectators, cosmetics shop |
| **5. Live ops** | ongoing | Clubs, tournaments, replays, achievements, more variants, localization |

---

## 10. Questions for you (please guide me)
1. **Rules**: Which family do you play: Classic, Modern American (CLA), or your own house
   rules? Please list your exact rules for initial meld minimums, picking up the pile,
   black 3s, and red 3s.
2. **Singles**: Draw 2 / discard 1, or draw 1? What go-out requirement do 1v1 players
   expect?
3. **Doubles**: Should "Can I go out, partner?" be required?
4. **Game length**: Is playing to 5000 too long for mobile? Should we offer a "Quick
   Game" (e.g. 2 hands or 2500 points)?
5. **Look**: Classic casino felt, retro Yahoo '99, or clean modern? Any apps or sites
   whose look you love?
6. **Community**: Which rooms do you want at launch? Which languages or regions?
7. **Name and brand**: "Canasta Arena" is a placeholder. Do you have a name in mind?
8. **Platforms first**: Web first and then mobile, or both at once?
9. **Monetization**: Are you comfortable with cosmetics plus a membership? Should there
   be any ads at all?

---

### Sources
- [Yahoo! Games — Wikipedia](https://en.wikipedia.org/wiki/Yahoo_Games)
- [Yahoo! Games (1998–2016) — rip.so](https://rip.so/yahoo-games.html)
- [Canasta Junction](https://canastajunction.com/) · [Google Play](https://play.google.com/store/apps/details?id=com.fiftytwo.canasta&hl=en_US)
- [Canasta – Fun & Friends (GameDuell)](https://play.google.com/store/apps/details?id=com.gameduell.canasta.treff.kartenspiel&hl=en_US)
- [PlayOK Canasta](https://www.playok.com/en/canasta/) · [Canasta Palace](https://www.canasta-palace.com/) · [cardgames.io Canasta](https://cardgames.io/canasta/)
- [Best Sites to Play Canasta Online 2026 — Rare Pike](https://rarepike.com/best-sites-to-play-canasta-online/)
