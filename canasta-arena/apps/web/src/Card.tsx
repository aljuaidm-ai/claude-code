import { type Card, isNatural, isRedSuit, isWild, type Meld, sortCards } from '@cca/engine';
import { suitSymbol } from './i18n';

interface CardProps {
  card: Card;
  size?: 'hand' | 'mini' | 'pile';
  selected?: boolean;
  fresh?: boolean;
  staged?: boolean;
  onClick?: () => void;
  label?: string;
}

export function CardFace({ card, size = 'hand', selected, fresh, staged, onClick, label }: CardProps) {
  const cls = [
    'card', `card-${size}`,
    card.rank === 'JK' ? 'joker' : isRedSuit(card) ? 'red' : 'black',
    selected && 'selected', fresh && 'fresh', staged && 'staged',
  ].filter(Boolean).join(' ');
  const face = (
    <>
      <span className="idx">{card.rank === 'JK' ? 'JKR' : card.rank}<span className="idx-suit">{suitSymbol(card)}</span></span>
      <span className="pip">{suitSymbol(card)}</span>
    </>
  );
  if (onClick) {
    return <button type="button" className={cls} onClick={onClick} aria-pressed={selected} aria-label={label}>{face}</button>;
  }
  return <span className={cls} aria-label={label}>{face}</span>;
}

export function CardBack({ size = 'pile', count }: { size?: 'pile' | 'tiny'; count?: number }) {
  return <span className={`card card-${size} back`}>{count !== undefined && <span className="back-count">{count}</span>}</span>;
}

/** A meld: small overlapping cards. A canasta is shown squared up, with a red top card if natural, black if mixed. */
export function MeldStack({ meld, stagedCards = [], onClick, naturalLabel, mixedLabel }: {
  meld: Meld | { id: string; cards: Card[] };
  stagedCards?: Card[];
  onClick?: () => void;
  naturalLabel: string;
  mixedLabel: string;
}) {
  const ordered = [...sortCards(meld.cards.filter(isNatural)), ...sortCards(meld.cards.filter(isWild))];
  const total = meld.cards.length + stagedCards.length;
  const isCanasta = meld.cards.length >= 7;
  const natural = meld.cards.every(isNatural);
  const Tag = onClick ? 'button' : 'div';
  if (isCanasta) {
    const top = natural
      ? (meld.cards.find(isRedSuit) ?? meld.cards[0])
      : (meld.cards.find((c) => isNatural(c) && !isRedSuit(c)) ?? meld.cards[0]);
    return (
      <Tag type={onClick ? 'button' : undefined} className={`meld canasta ${natural ? 'nat' : 'mix'}`} onClick={onClick}>
        <span className="canasta-stack">
          <CardFace card={top} size="mini" />
        </span>
        <span className={`canasta-tag ${natural ? 'nat' : 'mix'}`}>{natural ? naturalLabel : mixedLabel}</span>
        {stagedCards.map((c) => <CardFace key={c.id} card={c} size="mini" staged />)}
        <span className="meld-count">{total}</span>
      </Tag>
    );
  }
  return (
    <Tag type={onClick ? 'button' : undefined} className="meld" onClick={onClick}>
      {ordered.map((c) => <CardFace key={c.id} card={c} size="mini" />)}
      {stagedCards.map((c) => <CardFace key={c.id} card={c} size="mini" staged />)}
      <span className="meld-count">{total}</span>
    </Tag>
  );
}
