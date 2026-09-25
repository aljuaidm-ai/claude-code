import {
  type Action, actorOf, apply, botStep, type Card, canastaCount, type GameState, initialMeldMinimum, isPileFrozenFor,
  newGame, type RuleSet, sortCards, teamOf,
} from '@cca/engine';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Skin } from './App';
import { CardBack, CardFace, MeldStack } from './Card';
import { cardLabel, errorText, eventText, type Lang, LANGS, t, tw, type Who } from './i18n';

const HUMAN = 0;
const BOT_DELAY_MS = 700;

interface Staging { newMelds: number[][]; additions: { meldId: string; cards: number[] }[] }
const EMPTY: Staging = { newMelds: [], additions: [] };

const OPPONENTS_4 = [
  { name: 'Klaus', female: false }, { name: 'Layla', female: true }, { name: 'Marisol', female: true },
];

interface Props {
  rules: RuleSet; seed: number; lang: Lang; skin: Skin;
  onLang: (l: Lang) => void; onSkin: (s: Skin) => void; onExit: () => void; onRestart: () => void;
}

export function Table({ rules, seed, lang, skin, onLang, onSkin, onExit, onRestart }: Props) {
  const [game, setGame] = useState<GameState>(() => newGame(rules, seed));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [staging, setStaging] = useState<Staging>(EMPTY);
  const [toast, setToast] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const logSeen = useRef(0);

  const four = rules.players === 4;
  const who = (seat: number): Who => {
    if (seat === HUMAN) return { name: t(lang, 'you'), you: true, female: false };
    const p = four ? OPPONENTS_4[seat - 1] : { name: 'Marisol', female: true };
    return { name: p.name, you: false, female: p.female };
  };
  const actor = actorOf(game);
  const myTurn = game.turn === HUMAN && actor === HUMAN;
  const myTeam = teamOf(HUMAN);

  // Bots act on their own after a short pause.
  useEffect(() => {
    if (actor === null || actor === HUMAN) return;
    const id = setTimeout(() => setGame((g) => (actorOf(g) === actor ? botStep(g).state : g)), BOT_DELAY_MS);
    return () => clearTimeout(id);
  }, [game, actor]);

  // Celebrate new canastas.
  useEffect(() => {
    if (game.log.length < logSeen.current) logSeen.current = 0;
    const fresh = game.log.slice(logSeen.current);
    logSeen.current = game.log.length;
    if (fresh.some((e) => e.e === 'canasta')) {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 1400);
      return () => clearTimeout(id);
    }
  }, [game.log]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const showError = (r: { code: string; params?: Record<string, string | number> }) =>
    setToast(errorText(lang, r.code as never, r.params));

  const act = (a: Action, after?: () => void) => {
    const r = apply(game, HUMAN, a);
    if (!r.ok) { showError(r); return false; }
    setGame(r.state);
    after?.();
    return true;
  };
  const clearAll = () => { setSelected(new Set()); setStaging(EMPTY); };

  const stagedIds = useMemo(
    () => new Set([...staging.newMelds.flat(), ...staging.additions.flatMap((a) => a.cards)]),
    [staging],
  );
  const hand = sortCards(game.hands[HUMAN].filter((c) => !stagedIds.has(c.id)));
  const byId = new Map(game.hands[HUMAN].map((c) => [c.id, c]));
  const hasStaging = staging.newMelds.length > 0 || staging.additions.length > 0;

  const toggle = (id: number) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const onStock = () => { if (myTurn && game.phase === 'draw') act({ t: 'draw' }, clearAll); };
  const onPile = () => {
    if (!myTurn || game.phase !== 'draw') return;
    act({ t: 'takePile', pair: [...selected], extraMelds: staging.newMelds }, clearAll);
  };
  const onNewMeld = () => {
    if (selected.size === 0) { showError({ code: 'nothing_to_play' }); return; }
    setStaging((s) => ({ ...s, newMelds: [...s.newMelds, [...selected]] }));
    setSelected(new Set());
  };
  const onMeldTap = (meldId: string) => {
    if (selected.size === 0) return;
    setStaging((s) => ({ ...s, additions: [...s.additions, { meldId, cards: [...selected] }] }));
    setSelected(new Set());
  };
  const onStagedTap = (i: number) => {
    if (selected.size === 0) return;
    setStaging((s) => ({ ...s, newMelds: s.newMelds.map((m, j) => (j === i ? [...m, ...selected] : m)) }));
    setSelected(new Set());
  };
  const onLayDown = () => {
    if (!hasStaging) { showError({ code: 'nothing_to_play' }); return; }
    act({ t: 'play', ...staging }, clearAll);
  };
  const onDiscard = () => {
    if (selected.size !== 1) { showError({ code: 'select_one' }); return; }
    const card = [...selected][0];
    let s = game;
    if (hasStaging) {
      const r = apply(s, HUMAN, { t: 'play', ...staging });
      if (!r.ok) { showError(r); return; }
      s = r.state;
    }
    if (s.phase === 'play') {
      const r = apply(s, HUMAN, { t: 'discard', card });
      if (!r.ok) { showError(r); if (s !== game) { setGame(s); setStaging(EMPTY); } return; }
      s = r.state;
    }
    setGame(s);
    clearAll();
  };

  // Status line
  let status: string;
  if (game.goOut?.status === 'pending' && actor !== HUMAN) status = tw(lang, 'sAnswer', who(actor!));
  else if (game.turn !== HUMAN) status = tw(lang, 'sWait', who(game.turn));
  else if (game.phase === 'draw') status = t(lang, game.stock.length === 0 ? 'sStockOut' : selected.size ? 'sDrawSel' : 'sDraw');
  else status = t(lang, 'sPlay');

  const ourMelds = game.melds[myTeam];
  const theirMelds = game.melds[(1 - myTeam) as 0 | 1];
  const need = initialMeldMinimum(game.scores[myTeam]);
  const top = game.pile[game.pile.length - 1];
  const frozenForMe = isPileFrozenFor(game, myTeam);
  const recent = game.log.map((e) => eventText(lang, e, who)).filter(Boolean).slice(-3) as string[];
  const human = { name: t(lang, 'you') };

  const seatChip = (seat: number, pos: string) => {
    const w = who(seat);
    const turn = game.turn === seat && game.phase !== 'handOver' && game.phase !== 'gameOver';
    return (
      <div className={`seat seat-${pos} ${turn ? 'on-turn' : ''} ${teamOf(seat) === myTeam ? 'ally' : 'foe'}`}>
        <span className="avatar" aria-hidden="true">{w.name[0]}</span>
        <span className="seat-meta">
          <span className="seat-name">{w.name}</span>
          <span className="seat-cards">{t(lang, 'cards', { n: game.hands[seat].length })}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="table-screen">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={onExit}>{t(lang, 'menu')}</button>
        <span className="tb-title">Classic Canasta Arena</span>
        <span className="badge">{t(lang, rules.id === 'doubles' ? 'doubles' : rules.id === 'singles' ? 'singles' : 'quick')} · {rules.target}</span>
        <span className="grow" />
        <span className="scores" aria-live="polite">
          <span className="score-us">{t(lang, 'us')} <b>{game.scores[myTeam]}</b></span>
          <span className="score-them">{t(lang, 'them')} <b>{game.scores[1 - myTeam]}</b></span>
        </span>
        <select className="mini-select" aria-label={t(lang, 'language')} value={lang} onChange={(e) => onLang(e.target.value as Lang)}>
          {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
        <select className="mini-select" aria-label={t(lang, 'tableStyle')} value={skin} onChange={(e) => onSkin(e.target.value as Skin)}>
          <option value="salon">{t(lang, 'salon')}</option>
          <option value="club">{t(lang, 'club')}</option>
        </select>
      </header>

      <main className="felt">
        <div className="seats-row">
          {four ? <>{seatChip(1, 'left')}{seatChip(2, 'top')}{seatChip(3, 'right')}</> : seatChip(1, 'top')}
        </div>

        <section className="zone theirs" aria-label={t(lang, 'theirMelds')}>
          <span className="zone-label">{t(lang, 'theirMelds')}<Red3s n={game.red3s[1 - myTeam].length} /></span>
          <div className="melds">
            {theirMelds.map((m) => <MeldStack key={m.id} meld={m} naturalLabel={t(lang, 'natural')} mixedLabel={t(lang, 'mixed')} />)}
          </div>
        </section>

        <section className="center">
          <button type="button" className={`pilebox ${myTurn && game.phase === 'draw' && game.stock.length ? 'can' : ''}`} onClick={onStock} aria-label={t(lang, 'draw')}>
            {game.stock.length > 0 ? <CardBack count={game.stock.length} /> : <span className="card card-pile empty" />}
            <span className="pile-label">{t(lang, 'stock')}</span>
          </button>
          <button type="button" className={`pilebox ${myTurn && game.phase === 'draw' && top ? 'can' : ''}`} onClick={onPile} aria-label={t(lang, 'takePile')}>
            <span className="pile-stack">
              {game.pileFrozenAll && game.pile.length > 1 && <span className="card card-pile back crossed" aria-hidden="true" />}
              {top ? <CardFace card={top} size="pile" /> : <span className="card card-pile empty" />}
            </span>
            <span className="pile-label">{t(lang, 'pile')} · {game.pile.length}</span>
            {top && frozenForMe && <span className="frozen">❄ {t(lang, 'frozen')}</span>}
          </button>
          <div className="info">
            <div className="stat"><span>{t(lang, 'canastas')}</span><b>{canastaCount(ourMelds)} / {rules.canastasToGoOut}</b></div>
            <div className="stat"><span>{ourMelds.length ? t(lang, 'melded') : t(lang, 'firstMeld', { n: need })}</span></div>
          </div>
          <ol className="log" aria-live="polite">{recent.map((line, i) => <li key={`${game.log.length}-${i}`}>{line}</li>)}</ol>
          {flash && <div className="flash" role="status">{t(lang, 'flash')}</div>}
        </section>

        <section className="zone ours" aria-label={t(lang, 'ourMelds')}>
          <span className="zone-label">{t(lang, 'ourMelds')}<Red3s n={game.red3s[myTeam].length} /></span>
          <div className="melds">
            {ourMelds.map((m) => (
              <MeldStack
                key={m.id} meld={m}
                stagedCards={staging.additions.filter((a) => a.meldId === m.id).flatMap((a) => a.cards.map((id) => byId.get(id)!))}
                onClick={() => onMeldTap(m.id)} naturalLabel={t(lang, 'natural')} mixedLabel={t(lang, 'mixed')}
              />
            ))}
            {staging.newMelds.map((ids, i) => (
              <div key={`s${i}`} className="staged-wrap" title={t(lang, 'staged')}>
                <MeldStack
                  meld={{ id: `s${i}`, cards: [] }} stagedCards={ids.map((id) => byId.get(id)!)}
                  onClick={() => onStagedTap(i)} naturalLabel="" mixedLabel=""
                />
              </div>
            ))}
          </div>
        </section>

        <section className="dock">
          <p className="status">{status}</p>
          <div className="hand" role="group" aria-label={human.name}>
            {hand.map((c: Card) => (
              <CardFace
                key={c.id} card={c} selected={selected.has(c.id)} fresh={game.drawn.includes(c.id)}
                onClick={() => toggle(c.id)} label={cardLabel(c)}
              />
            ))}
          </div>
          <div className="actions">
            {game.phase === 'draw' && myTurn && game.stock.length > 0 && <button type="button" className="btn primary" onClick={onStock}>{t(lang, 'draw')}</button>}
            {game.phase === 'draw' && myTurn && <button type="button" className="btn" onClick={onPile}>{t(lang, 'takePile')}</button>}
            {game.phase === 'draw' && myTurn && game.stock.length === 0 && <button type="button" className="btn" onClick={() => act({ t: 'endHand' })}>{t(lang, 'endHand')}</button>}
            {myTurn && <button type="button" className="btn" onClick={onNewMeld}>{t(lang, 'newMeld')}</button>}
            {myTurn && game.phase === 'play' && <button type="button" className="btn" onClick={onLayDown} disabled={!hasStaging}>{t(lang, 'layDown')}</button>}
            {myTurn && game.phase === 'play' && <button type="button" className="btn primary" onClick={onDiscard}>{t(lang, 'discard')}</button>}
            {myTurn && four && !game.meldedThisTurn && game.goOut === null && canastaCount(ourMelds) >= rules.canastasToGoOut - 1 && (
              <button type="button" className="btn ask" onClick={() => act({ t: 'ask' })}>{t(lang, 'ask')}</button>
            )}
            {(hasStaging || selected.size > 0) && <button type="button" className="btn ghost" onClick={clearAll}>{t(lang, 'undo')}</button>}
          </div>
          {myTurn && game.phase === 'play' && ourMelds.length > 0 && <p className="hint">{t(lang, 'addHint')}</p>}
        </section>

        {toast && <div className="toast" role="alert">{toast}</div>}
      </main>

      {game.goOut?.status === 'pending' && actor === HUMAN && (
        <Modal>
          <h2>{tw(lang, 'askTitle', who(game.goOut.asker))}</h2>
          <div className="modal-actions">
            <button type="button" className="btn primary" onClick={() => act({ t: 'answer', yes: true })}>{t(lang, 'yes')}</button>
            <button type="button" className="btn" onClick={() => act({ t: 'answer', yes: false })}>{t(lang, 'no')}</button>
          </div>
        </Modal>
      )}

      {(game.phase === 'handOver' || game.phase === 'gameOver') && game.history.length > 0 && (
        <HandSummary game={game} lang={lang} who={who} myTeam={myTeam} onNext={() => act({ t: 'nextHand' }, clearAll)} onRestart={onRestart} onExit={onExit} />
      )}
    </div>
  );
}

function Red3s({ n }: { n: number }) {
  if (!n) return null;
  return <span className="red3s" aria-label={`${n} × 3♥`}>{Array.from({ length: n }, (_, i) => <i key={i}>3♥</i>)}</span>;
}

function Modal({ children }: { children: React.ReactNode }) {
  return <div className="modal-back"><div className="modal" role="dialog" aria-modal="true">{children}</div></div>;
}

function HandSummary({ game, lang, who, myTeam, onNext, onRestart, onExit }: {
  game: GameState; lang: Lang; who: (s: number) => Who; myTeam: 0 | 1;
  onNext: () => void; onRestart: () => void; onExit: () => void;
}) {
  const h = game.history[game.history.length - 1];
  const rows: [string, keyof typeof h.teams[0]][] = [
    ['meldPoints', 'meldPoints'], ['canastaBonus', 'canastaBonus'], ['red3', 'red3'], ['goingOut', 'goingOut'],
  ];
  const cols = [myTeam, (1 - myTeam) as 0 | 1];
  const over = game.phase === 'gameOver';
  return (
    <Modal>
      <h2>{over ? t(lang, 'gameOver') : t(lang, 'handOver', { n: h.hand + 1 })}</h2>
      <p className="summary-line">
        {h.outSeat === null ? t(lang, 'noOut') : `${tw(lang, 'wentOut', who(h.outSeat))} ${h.concealed ? t(lang, 'concealed') : ''}`}
      </p>
      <div className="scorepad">
        <table>
          <thead><tr><th /><th>{t(lang, 'us')}</th><th>{t(lang, 'them')}</th></tr></thead>
          <tbody>
            {rows.map(([label, key]) => (
              <tr key={key}><th>{t(lang, label)}</th>{cols.map((c) => <td key={c}>{fmt(h.teams[c][key])}</td>)}</tr>
            ))}
            <tr><th>{t(lang, 'handPenalty')}</th>{cols.map((c) => <td key={c}>{fmt(-h.teams[c].handPenalty)}</td>)}</tr>
            <tr className="total"><th>{t(lang, 'handTotal')}</th>{cols.map((c) => <td key={c}>{fmt(h.teams[c].total)}</td>)}</tr>
            <tr className="grand"><th>{t(lang, 'score')}</th>{cols.map((c) => <td key={c}>{h.scoresAfter[c]}</td>)}</tr>
          </tbody>
        </table>
      </div>
      {over && (
        <p className="result">{game.winner === 'tie' ? t(lang, 'tie') : game.winner === myTeam ? t(lang, 'win') : t(lang, 'lose')}</p>
      )}
      <div className="modal-actions">
        {over
          ? <><button type="button" className="btn primary" onClick={onRestart}>{t(lang, 'again')}</button>
              <button type="button" className="btn" onClick={onExit}>{t(lang, 'menu')}</button></>
          : <button type="button" className="btn primary" onClick={onNext}>{t(lang, 'nextHand')}</button>}
      </div>
    </Modal>
  );
}

const fmt = (n: number) => (n > 0 ? `+${n}` : String(n));

