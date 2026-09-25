import { CLASSIC_DOUBLES, CLASSIC_SINGLES, CLASSIC_SINGLES_QUICK, type RuleSet } from '@cca/engine';
import { useEffect, useState } from 'react';
import { type Lang, LANGS, t } from './i18n';
import { Table } from './Table';

export type Skin = 'salon' | 'club';

function load<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch { return fallback; }
}
function save(key: string, v: string) { try { localStorage.setItem(key, v); } catch { /* storage unavailable */ } }

const MODES: { rules: RuleSet; title: string; desc: string; seats: string }[] = [
  { rules: CLASSIC_DOUBLES, title: 'doubles', desc: 'doublesDesc', seats: '2v2' },
  { rules: CLASSIC_SINGLES, title: 'singles', desc: 'singlesDesc', seats: '1v1' },
  { rules: CLASSIC_SINGLES_QUICK, title: 'quick', desc: 'quickDesc', seats: '1v1' },
];

export function App() {
  const [lang, setLang] = useState<Lang>(() => load('cca-lang', 'en', ['en', 'es', 'de', 'ar']));
  const [skin, setSkin] = useState<Skin>(() => load('cca-skin', 'salon', ['salon', 'club']));
  const [game, setGame] = useState<{ rules: RuleSet; seed: number } | null>(null);

  useEffect(() => { save('cca-lang', lang); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { save('cca-skin', skin); }, [skin]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (game) {
    return (
      <div dir={dir} lang={lang} className={`app skin-${skin}`}>
        <Table
          key={game.seed} rules={game.rules} seed={game.seed} lang={lang} skin={skin}
          onLang={setLang} onSkin={setSkin} onExit={() => setGame(null)}
          onRestart={() => setGame({ rules: game.rules, seed: (Math.random() * 2 ** 31) >>> 0 })}
        />
      </div>
    );
  }

  return (
    <div dir={dir} lang={lang} className="app home">
      <header className="home-head">
        <div className="brand">Classic Canasta <span>Arena</span></div>
        <p className="tagline">{t(lang, 'tagline')}</p>
      </header>

      <section className="home-section">
        <h2>{t(lang, 'chooseGame')}</h2>
        <div className="modes">
          {MODES.map((m) => (
            <button
              key={m.rules.id} type="button" className="mode"
              onClick={() => setGame({ rules: m.rules, seed: (Math.random() * 2 ** 31) >>> 0 })}
            >
              <span className="mode-seats">{m.seats}</span>
              <span className="mode-title">{t(lang, m.title)}</span>
              <span className="mode-desc">{t(lang, m.desc)}</span>
              <span className="mode-desc">{t(lang, 'twoCanastas')}</span>
              <span className="mode-play">{t(lang, 'play')}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section settings">
        <div className="setting">
          <span className="setting-label">{t(lang, 'language')}</span>
          <div className="seg" role="group" aria-label={t(lang, 'language')}>
            {LANGS.map((l) => (
              <button key={l.id} type="button" aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>{l.label}</button>
            ))}
          </div>
        </div>
        <div className="setting">
          <span className="setting-label">{t(lang, 'tableStyle')}</span>
          <div className="seg" role="group" aria-label={t(lang, 'tableStyle')}>
            {(['salon', 'club'] as Skin[]).map((s) => (
              <button key={s} type="button" aria-pressed={skin === s} onClick={() => setSkin(s)}>
                <i className={`swatch swatch-${s}`} aria-hidden="true" />{t(lang, s)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="proto-note">{t(lang, 'prototype')}</p>
    </div>
  );
}
