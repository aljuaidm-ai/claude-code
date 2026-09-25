# Classic Canasta Arena — Rulebook (Classic rules, v1)

This is the rulebook the game engine follows. Each rule has an ID (for example **R4.2**).
The engine tests refer to these IDs, so each rule shows how it is enforced.

Items marked **[CONFIRM]** are points where Classic rulebooks differ. I picked the most common
reading. Please confirm them or tell me how you play.

---

## R1. Formats

| Format | Players | Cards dealt | Draw | Canastas to go out | Game to | Ask partner |
|---|---|---|---|---|---|---|
| **Singles** | 2 | 15 each | 2, then discard 1 | 2 | 5000 | — |
| **Singles Quick** | 2 | 15 each | 2, then discard 1 | 2 | 2500 | — |
| **Doubles** | 4 (2 teams, partners sit opposite) | 11 each | 1, then discard 1 | 2 | 5000 | Required |

- **R1.1** In Doubles, seats 0 and 2 are one team and seats 1 and 3 are the other. Play goes clockwise (to the left).
- **R1.2** The deal passes to the left after each hand. The player to the dealer's left plays first.

## R2. Cards and values

- **R2.1** Two standard 52-card decks plus 4 jokers: 108 cards.
- **R2.2** Jokers and 2s are **wild**. All other cards are **natural**.
- **R2.3** Card values:

| Card | Points |
|---|---|
| Joker | 50 |
| 2, Ace | 20 |
| K, Q, J, 10, 9, 8 | 10 |
| 7, 6, 5, 4, black 3 | 5 |
| Red 3 | bonus only (see R8) |

## R3. The deal

- **R3.1** Each player gets the number of cards in R1. The rest is the **stock**. One card is turned face up to start the **discard pile**.
- **R3.2** If that first card is a wild card or a red 3, another card is turned on top of it and the pile is **frozen** (R5.2).
- **R3.3** Any player dealt a red 3 lays it face up at once and draws a replacement from the stock. The same applies if the replacement is another red 3.

## R4. A turn

- **R4.1** Start by either **drawing** from the stock (1 card in Doubles, 2 in Singles) **or taking the whole discard pile** (R5).
- **R4.2** A red 3 drawn from the stock is laid down at once and replaced from the stock. It does not count as one of your drawn cards.
- **R4.3** Then you may meld: make new melds or add cards to your side's melds (R6).
- **R4.4** End the turn by discarding one card onto the pile. The only exception is going out by melding every card (R7).
- **R4.5** Discarding a wild card **freezes** the pile (R5.2).
- **R4.6** Discarding a black 3 **blocks** the next player. Nobody can take a pile with a black 3 on top.

## R5. Taking the discard pile

- **R5.1** Nobody can take the pile when its top card is a wild card or a black 3.
- **R5.2** The pile is **frozen** for your side when:
  - (a) your side has not melded yet this hand, or
  - (b) it contains a wild card or a red 3. This applies to everyone, until someone takes the pile.
- **R5.3** **Frozen pile:** you can take it only with a **natural pair** from your hand of the same rank as the top card. You must meld the top card with that pair at once.
- **R5.4** **Pile not frozen:** you can take it with any of these:
  - (a) a natural pair of the top card's rank,
  - (b) one natural card of that rank plus one wild card,
  - (c) no cards from your hand, by adding the top card to your side's existing meld of that rank.
- **R5.5** When you take the pile, you must meld the top card at once. The rest of the pile goes into your hand. Any red 3s in the pile are laid down, without replacement.
- **R5.6** **First meld from the pile:** the top card and the cards melded with it count toward the minimum (R6.6). You may add other melds from your hand to reach it, all at the same time. No other pile cards count.

## R6. Melds

- **R6.1** A meld is 3 or more cards of the same rank (4 to Ace). It needs **at least 2 natural cards** and **no more than 3 wild cards**.
- **R6.2** A side may have only one meld of each rank. More cards of that rank are added to it.
- **R6.3** 3s cannot be melded, except black 3s (R6.4).
- **R6.4** **Black 3s** can be melded (3 or 4 of them, with no wild cards) only in the turn you go out.
- **R6.5** A **canasta** is a meld of 7 or more cards. It is **natural** if it has no wild cards (worth 500) and **mixed** if it has any (worth 300). **[CONFIRM]** The 3-wild limit also applies after a meld becomes a canasta. Adding a wild card to a natural canasta makes it mixed.
- **R6.6** **Minimum first meld.** Your side's first meld of each hand must add up to a minimum card value (bonuses don't count). The minimum depends on your side's total score at the start of the hand:

| Side's score | Minimum |
|---|---|
| Below 0 | 15 |
| 0 – 1,495 | 50 |
| 1,500 – 2,995 | 90 |
| 3,000 and up | 120 |

  You may lay down several melds at once to reach the minimum.
- **R6.7** You may not meld in a way that leaves you with no card to discard, unless you are going out. In practice, keep at least 2 cards unless you can go out.

## R7. Going out

- **R7.1** To go out, your side must have at least **2 canastas** (in every format).
- **R7.2** You go out by getting rid of all your cards: either meld them all, or meld all but one and discard the last card.
- **R7.3** **Doubles:** before going out you must ask your partner **"May I go out?"**. Ask before you meld anything that turn; you may ask before or after you draw. You go out only if your partner says **yes**. If they say no, you can't go out that turn. **[CONFIRM]** If the answer is yes, most rulebooks say you *must* go out. The prototype doesn't force this, so a player who asked by mistake isn't stuck. Should it be forced?
- **R7.4** **Concealed** going out: you meld your whole hand in one turn without having melded anything earlier in the hand. You get a 200 bonus instead of 100. **[CONFIRM]** A player going out concealed does not need to meet the minimum first meld.
- **R7.5** When a player goes out, the hand ends immediately.

## R8. Red 3s

- **R8.1** Each red 3 is worth **100**. If one side has all four, they are worth **800**.
- **R8.2** They count **for** your side if you have melded this hand, and **against** it if you haven't.

## R9. When the stock runs out

- **R9.1** If a player draws the last card of the stock and it's a red 3, they lay it down and the hand ends. They don't meld or discard.
- **R9.2** Once the stock is empty, each player in turn must take the discard pile if the top card can be added to their side's melds (and the pile isn't frozen for them). They may take it in any other legal way. If they can't or won't take it, the hand ends. Nobody gets the going-out bonus.

## R10. Scoring a hand

Each side adds up:

| Item | Points |
|---|---|
| Each natural canasta | +500 |
| Each mixed canasta | +300 |
| Red 3s | +100 each, +800 for all four (negative if the side has not melded) |
| Going out | +100 (+200 if concealed) |
| Every card in the side's melds | + its value (R2.3) |
| Every card left in the side's hands | − its value |

- **R10.1** The game ends after the hand in which a side reaches the target (5000, or 2500 in Singles Quick). If both sides pass it, the higher score wins.

---

## Points to confirm with you
1. **R6.5** Does the 3-wild limit apply to canastas too?
2. **R7.3** If your partner says yes, must you go out?
3. **R7.4** Does going out concealed skip the minimum first meld?
4. **R9.2** Is taking the pile required when the stock is empty and the top card fits your side's meld?
