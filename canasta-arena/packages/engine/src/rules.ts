export interface RuleSet {
  readonly id: 'singles' | 'singles-quick' | 'doubles';
  readonly players: 2 | 4;
  readonly handSize: number;
  readonly drawCount: 1 | 2;
  readonly canastasToGoOut: 1 | 2;
  readonly target: number;
  readonly maxWildsPerMeld: number;
  /** R7.3 — Doubles players must ask their partner before going out. */
  readonly askPartnerToGoOut: boolean;
  /** R7.4 [CONFIRM] — going out concealed skips the minimum first meld. */
  readonly concealedIgnoresMinimum: boolean;
}

const classicBase = {
  canastasToGoOut: 2,
  maxWildsPerMeld: 3,
  concealedIgnoresMinimum: true,
} as const;

/** R1 formats. */
export const CLASSIC_SINGLES: RuleSet = {
  ...classicBase, id: 'singles', players: 2, handSize: 15, drawCount: 2, target: 5000, askPartnerToGoOut: false,
};
export const CLASSIC_SINGLES_QUICK: RuleSet = { ...CLASSIC_SINGLES, id: 'singles-quick', target: 2500 };
export const CLASSIC_DOUBLES: RuleSet = {
  ...classicBase, id: 'doubles', players: 4, handSize: 11, drawCount: 1, target: 5000, askPartnerToGoOut: true,
};

/** R6.6 */
export function initialMeldMinimum(teamScore: number): number {
  if (teamScore < 0) return 15;
  if (teamScore < 1500) return 50;
  if (teamScore < 3000) return 90;
  return 120;
}
