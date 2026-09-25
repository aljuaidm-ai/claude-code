import type { Card, ErrorCode, GameEvent } from '@cca/engine';

export type Lang = 'en' | 'es' | 'de' | 'ar';
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' }, { id: 'es', label: 'Español' }, { id: 'de', label: 'Deutsch' }, { id: 'ar', label: 'العربية' },
];

type Dict = Record<string, string>;

const en: Dict = {
  tagline: 'Classic Canasta, the way it is played at the table.',
  chooseGame: 'Choose a game',
  singles: 'Singles', singlesDesc: '1 vs 1 · draw 2 · to 5000',
  quick: 'Singles Quick', quickDesc: '1 vs 1 · draw 2 · to 2500',
  doubles: 'Doubles', doublesDesc: '2 vs 2 with a partner · to 5000',
  twoCanastas: '2 canastas to go out',
  language: 'Language', tableStyle: 'Table style', salon: 'Salon', club: 'Club Felt',
  prototype: 'Prototype: you play against computer players. Online tables, the lobby and rankings come next.',
  play: 'Play',
  us: 'Us', them: 'Them', you: 'You', cards: '{n} cards',
  stock: 'Stock', pile: 'Pile', frozen: 'Frozen',
  ourMelds: 'Our melds', theirMelds: 'Their melds',
  canastas: 'Canastas', firstMeld: 'First meld: {n}', melded: 'Melded',
  red3s: 'Red 3s',
  sDraw: 'Your turn: draw from the stock, or take the pile.',
  sDrawSel: 'To take the pile, select the matching cards from your hand, then tap the pile.',
  sPlay: 'Meld if you can, then discard one card.',
  sWait: '{name} is playing…', sAnswer: 'Waiting for {name} to answer…',
  sStockOut: 'The stock is empty. Take the pile, or end the hand.',
  draw: 'Draw', takePile: 'Take pile', newMeld: 'New meld', layDown: 'Lay down', undo: 'Undo',
  discard: 'Discard', ask: 'May I go out?', endHand: 'End hand', menu: 'Menu',
  addHint: 'Tip: select cards, then tap one of your melds to add them.',
  staged: 'Not laid down yet',
  askTitle: '{name} asks: “Partner, may I go out?”', yes: 'Yes', no: 'No',
  handOver: 'Hand {n} complete', meldPoints: 'Melded cards', canastaBonus: 'Canastas', red3: 'Red 3s',
  goingOut: 'Going out', handPenalty: 'Cards left in hand', handTotal: 'Hand total', score: 'Score',
  nextHand: 'Next hand', gameOver: 'Game over', win: 'Your side wins!', lose: 'Their side wins.', tie: 'It’s a tie.',
  again: 'Play again', wentOut: '{name} went out', concealed: '(concealed)', noOut: 'The stock ran out. Nobody went out.',
  flash: 'CANASTA!', natural: 'Natural', mixed: 'Mixed',
  e_deal: 'Hand {n} is dealt', e_draw1: '{name} drew a card', e_draw: '{name} drew {n} cards',
  e_takePile: '{name} took the pile ({n} cards)', e_discard: '{name} discarded {card}', e_meld: '{name} melded',
  e_canasta: '{name} completed a canasta!', e_red3: '{name} laid down a red 3', e_ask: '{name}: “May I go out?”',
  e_yes: '{name}: “Yes”', e_no: '{name}: “No”', e_goOut: '{name} went out!', e_stockOut: 'The stock ran out',
  err_not_your_turn: 'It’s not your turn.', err_wrong_phase: 'You can’t do that right now.',
  err_unknown_card: 'That card isn’t in your hand.', err_duplicate_card: 'A card was selected twice.',
  err_stock_empty: 'The stock is empty.', err_stock_not_empty: 'There are still cards in the stock.',
  err_pile_empty: 'The pile is empty.', err_pile_top_unusable: 'Nobody can take a pile topped by a black 3 or a wild card.',
  err_pile_frozen_needs_pair: 'The pile is frozen: you need a natural pair matching the top card.',
  err_pile_needs_match: 'Select a pair that matches the top card (a natural pair, or one natural plus a wild card).',
  err_no_meld_to_add: 'Select cards that match the top card of the pile.',
  err_meld_too_small: 'A meld needs at least 3 cards.', err_mixed_ranks: 'All natural cards in a meld must be the same rank.',
  err_need_two_naturals: 'A meld needs at least 2 natural cards.', err_too_many_wilds: 'A meld can have at most 3 wild cards.',
  err_threes_not_meldable: '3s can’t be melded.', err_black3_only_going_out: 'Black 3s can only be melded when going out.',
  err_rank_exists: 'Your side already has that meld. Tap it to add these cards.', err_not_your_meld: 'You can only add to your side’s melds.',
  err_cannot_add_black3: 'You can’t add to black 3s.', err_wrong_rank: 'Those cards don’t match that meld.',
  err_minimum_not_met: 'Your first meld needs {need} points. You have {have}.',
  err_need_canastas: 'You need 2 canastas to go out.', err_need_permission: 'Ask your partner “May I go out?” first.',
  err_keep_one_card: 'Keep at least one card to discard.', err_waiting_partner: 'Wait for your partner’s answer.',
  err_ask_before_melding: 'Ask before you meld anything this turn.', err_cannot_ask: 'You can’t ask right now.',
  err_must_take_pile: 'The top card fits your meld, so you must take the pile.', err_nothing_to_play: 'Select cards first.',
  err_select_one: 'Select exactly one card to discard.',
};

const es: Dict = {
  tagline: 'Canasta clásica, como se juega en la mesa.',
  chooseGame: 'Elige una partida',
  singles: 'Individual', singlesDesc: '1 contra 1 · robar 2 · a 5000',
  quick: 'Individual rápida', quickDesc: '1 contra 1 · robar 2 · a 2500',
  doubles: 'Parejas', doublesDesc: '2 contra 2 con compañero · a 5000',
  twoCanastas: '2 canastas para cerrar',
  language: 'Idioma', tableStyle: 'Estilo de mesa', salon: 'Salón', club: 'Tapete de club',
  prototype: 'Prototipo: juegas contra la computadora. Las mesas en línea, el salón y las clasificaciones vienen después.',
  play: 'Jugar',
  us: 'Nosotros', them: 'Ellos', you: 'Tú', cards: '{n} cartas',
  stock: 'Mazo', pile: 'Pozo', frozen: 'Congelado',
  ourMelds: 'Nuestros juegos', theirMelds: 'Sus juegos',
  canastas: 'Canastas', firstMeld: 'Primera bajada: {n}', melded: 'Ya bajamos',
  red3s: 'Treses rojos',
  sDraw: 'Tu turno: roba del mazo o toma el pozo.',
  sDrawSel: 'Para tomar el pozo, selecciona las cartas que combinan y toca el pozo.',
  sPlay: 'Baja si puedes y luego descarta una carta.',
  sWait: '{name} está jugando…', sAnswer: 'Esperando la respuesta de {name}…',
  sStockOut: 'El mazo se acabó. Toma el pozo o termina la mano.',
  draw: 'Robar', takePile: 'Tomar pozo', newMeld: 'Nuevo juego', layDown: 'Bajar', undo: 'Deshacer',
  discard: 'Descartar', ask: '¿Puedo cerrar?', endHand: 'Terminar mano', menu: 'Menú',
  addHint: 'Consejo: selecciona cartas y toca uno de tus juegos para añadirlas.',
  staged: 'Aún sin bajar',
  askTitle: '{name} pregunta: «Compañero, ¿puedo cerrar?»', yes: 'Sí', no: 'No',
  handOver: 'Mano {n} terminada', meldPoints: 'Cartas bajadas', canastaBonus: 'Canastas', red3: 'Treses rojos',
  goingOut: 'Cierre', handPenalty: 'Cartas en la mano', handTotal: 'Total de la mano', score: 'Puntuación',
  nextHand: 'Siguiente mano', gameOver: 'Fin de la partida', win: '¡Gana tu equipo!', lose: 'Gana el otro equipo.', tie: 'Empate.',
  again: 'Jugar otra vez', wentOut: '{name} cerró', concealed: '(en mano)', noOut: 'Se acabó el mazo. Nadie cerró.',
  flash: '¡CANASTA!', natural: 'Limpia', mixed: 'Sucia',
  e_deal: 'Se reparte la mano {n}', e_draw1: '{name} robó una carta', e_draw: '{name} robó {n} cartas',
  e_takePile: '{name} tomó el pozo ({n} cartas)', e_discard: '{name} descartó {card}', e_meld: '{name} bajó cartas',
  e_canasta: '¡{name} completó una canasta!', e_red3: '{name} bajó un tres rojo', e_ask: '{name}: «¿Puedo cerrar?»',
  e_yes: '{name}: «Sí»', e_no: '{name}: «No»', e_goOut: '¡{name} cerró!', e_stockOut: 'Se acabó el mazo',
  err_not_your_turn: 'No es tu turno.', err_wrong_phase: 'Ahora no puedes hacer eso.',
  err_unknown_card: 'Esa carta no está en tu mano.', err_duplicate_card: 'Una carta se seleccionó dos veces.',
  err_stock_empty: 'El mazo está vacío.', err_stock_not_empty: 'Todavía quedan cartas en el mazo.',
  err_pile_empty: 'El pozo está vacío.', err_pile_top_unusable: 'Nadie puede tomar el pozo con un tres negro o un comodín encima.',
  err_pile_frozen_needs_pair: 'El pozo está congelado: necesitas un par limpio igual a la carta de arriba.',
  err_pile_needs_match: 'Selecciona un par que combine con la carta de arriba (par limpio, o una natural y un comodín).',
  err_no_meld_to_add: 'Selecciona cartas que combinen con la carta de arriba del pozo.',
  err_meld_too_small: 'Un juego necesita al menos 3 cartas.', err_mixed_ranks: 'Las cartas naturales de un juego deben ser del mismo valor.',
  err_need_two_naturals: 'Un juego necesita al menos 2 cartas naturales.', err_too_many_wilds: 'Un juego puede tener como máximo 3 comodines.',
  err_threes_not_meldable: 'Los treses no se pueden bajar.', err_black3_only_going_out: 'Los treses negros solo se bajan al cerrar.',
  err_rank_exists: 'Tu equipo ya tiene ese juego. Tócalo para añadir estas cartas.', err_not_your_meld: 'Solo puedes añadir a los juegos de tu equipo.',
  err_cannot_add_black3: 'No se puede añadir a los treses negros.', err_wrong_rank: 'Esas cartas no combinan con ese juego.',
  err_minimum_not_met: 'Tu primera bajada necesita {need} puntos. Tienes {have}.',
  err_need_canastas: 'Necesitas 2 canastas para cerrar.', err_need_permission: 'Primero pregunta a tu compañero «¿Puedo cerrar?».',
  err_keep_one_card: 'Guarda al menos una carta para descartar.', err_waiting_partner: 'Espera la respuesta de tu compañero.',
  err_ask_before_melding: 'Pregunta antes de bajar cartas en este turno.', err_cannot_ask: 'Ahora no puedes preguntar.',
  err_must_take_pile: 'La carta de arriba combina con tu juego, así que debes tomar el pozo.', err_nothing_to_play: 'Primero selecciona cartas.',
  err_select_one: 'Selecciona una sola carta para descartar.',
  e_draw1_you: 'Robaste una carta', e_draw_you: 'Robaste {n} cartas', e_takePile_you: 'Tomaste el pozo ({n} cartas)',
  e_discard_you: 'Descartaste {card}', e_meld_you: 'Bajaste cartas', e_canasta_you: '¡Completaste una canasta!',
  e_red3_you: 'Bajaste un tres rojo', e_goOut_you: '¡Cerraste!', wentOut_you: 'Cerraste',
};

const de: Dict = {
  tagline: 'Klassisches Canasta, so wie man es am Tisch spielt.',
  chooseGame: 'Spiel wählen',
  singles: 'Einzel', singlesDesc: '1 gegen 1 · 2 ziehen · bis 5000',
  quick: 'Einzel kurz', quickDesc: '1 gegen 1 · 2 ziehen · bis 2500',
  doubles: 'Doppel', doublesDesc: '2 gegen 2 mit Partner · bis 5000',
  twoCanastas: '2 Canastas zum Ausmachen',
  language: 'Sprache', tableStyle: 'Tischstil', salon: 'Salon', club: 'Clubtisch',
  prototype: 'Prototyp: Du spielst gegen Computergegner. Online-Tische, Lobby und Ranglisten folgen.',
  play: 'Spielen',
  us: 'Wir', them: 'Sie', you: 'Du', cards: '{n} Karten',
  stock: 'Talon', pile: 'Ablage', frozen: 'Gesperrt',
  ourMelds: 'Unsere Meldungen', theirMelds: 'Ihre Meldungen',
  canastas: 'Canastas', firstMeld: 'Erstes Auslegen: {n}', melded: 'Ausgelegt',
  red3s: 'Rote Dreien',
  sDraw: 'Du bist dran: Ziehe vom Talon oder nimm die Ablage.',
  sDrawSel: 'Um die Ablage zu nehmen, wähle die passenden Karten und tippe auf die Ablage.',
  sPlay: 'Lege aus, wenn du kannst, und wirf dann eine Karte ab.',
  sWait: '{name} ist am Zug…', sAnswer: 'Warte auf die Antwort von {name}…',
  sStockOut: 'Der Talon ist leer. Nimm die Ablage oder beende das Spiel.',
  draw: 'Ziehen', takePile: 'Ablage nehmen', newMeld: 'Neue Meldung', layDown: 'Auslegen', undo: 'Zurück',
  discard: 'Abwerfen', ask: 'Darf ich ausmachen?', endHand: 'Spiel beenden', menu: 'Menü',
  addHint: 'Tipp: Wähle Karten und tippe auf eine deiner Meldungen, um sie anzulegen.',
  staged: 'Noch nicht ausgelegt',
  askTitle: '{name} fragt: „Partner, darf ich ausmachen?“', yes: 'Ja', no: 'Nein',
  handOver: 'Spiel {n} beendet', meldPoints: 'Ausgelegte Karten', canastaBonus: 'Canastas', red3: 'Rote Dreien',
  goingOut: 'Ausmachen', handPenalty: 'Karten auf der Hand', handTotal: 'Summe', score: 'Punktestand',
  nextHand: 'Nächstes Spiel', gameOver: 'Partie beendet', win: 'Dein Team gewinnt!', lose: 'Das andere Team gewinnt.', tie: 'Unentschieden.',
  again: 'Nochmal spielen', wentOut: '{name} hat ausgemacht', concealed: '(verdeckt)', noOut: 'Der Talon ist leer. Niemand hat ausgemacht.',
  flash: 'CANASTA!', natural: 'Rein', mixed: 'Gemischt',
  e_deal: 'Spiel {n} wird gegeben', e_draw1: '{name} hat eine Karte gezogen', e_draw: '{name} hat {n} Karten gezogen',
  e_takePile: '{name} hat die Ablage genommen ({n} Karten)', e_discard: '{name} hat {card} abgeworfen', e_meld: '{name} hat ausgelegt',
  e_canasta: '{name} hat eine Canasta!', e_red3: '{name} hat eine rote Drei ausgelegt', e_ask: '{name}: „Darf ich ausmachen?“',
  e_yes: '{name}: „Ja“', e_no: '{name}: „Nein“', e_goOut: '{name} hat ausgemacht!', e_stockOut: 'Der Talon ist leer',
  err_not_your_turn: 'Du bist nicht dran.', err_wrong_phase: 'Das geht gerade nicht.',
  err_unknown_card: 'Diese Karte ist nicht auf deiner Hand.', err_duplicate_card: 'Eine Karte wurde doppelt gewählt.',
  err_stock_empty: 'Der Talon ist leer.', err_stock_not_empty: 'Im Talon sind noch Karten.',
  err_pile_empty: 'Die Ablage ist leer.', err_pile_top_unusable: 'Mit einer schwarzen Drei oder einem Joker oben darf niemand die Ablage nehmen.',
  err_pile_frozen_needs_pair: 'Die Ablage ist gesperrt: Du brauchst ein reines Paar zur obersten Karte.',
  err_pile_needs_match: 'Wähle ein Paar zur obersten Karte (reines Paar oder eine Karte plus Joker).',
  err_no_meld_to_add: 'Wähle Karten, die zur obersten Karte der Ablage passen.',
  err_meld_too_small: 'Eine Meldung braucht mindestens 3 Karten.', err_mixed_ranks: 'Alle echten Karten einer Meldung müssen gleich sein.',
  err_need_two_naturals: 'Eine Meldung braucht mindestens 2 echte Karten.', err_too_many_wilds: 'Eine Meldung darf höchstens 3 Joker haben.',
  err_threes_not_meldable: 'Dreien können nicht ausgelegt werden.', err_black3_only_going_out: 'Schwarze Dreien nur beim Ausmachen auslegen.',
  err_rank_exists: 'Dein Team hat diese Meldung schon. Tippe darauf, um anzulegen.', err_not_your_meld: 'Du kannst nur bei deinem Team anlegen.',
  err_cannot_add_black3: 'An schwarze Dreien kann nicht angelegt werden.', err_wrong_rank: 'Diese Karten passen nicht zu dieser Meldung.',
  err_minimum_not_met: 'Dein erstes Auslegen braucht {need} Punkte. Du hast {have}.',
  err_need_canastas: 'Zum Ausmachen brauchst du 2 Canastas.', err_need_permission: 'Frag zuerst deinen Partner: „Darf ich ausmachen?“',
  err_keep_one_card: 'Behalte mindestens eine Karte zum Abwerfen.', err_waiting_partner: 'Warte auf die Antwort deines Partners.',
  err_ask_before_melding: 'Frag, bevor du in diesem Zug auslegst.', err_cannot_ask: 'Du kannst jetzt nicht fragen.',
  err_must_take_pile: 'Die oberste Karte passt zu deiner Meldung – du musst die Ablage nehmen.', err_nothing_to_play: 'Wähle zuerst Karten.',
  err_select_one: 'Wähle genau eine Karte zum Abwerfen.',
  e_draw1_you: 'Du hast eine Karte gezogen', e_draw_you: 'Du hast {n} Karten gezogen',
  e_takePile_you: 'Du hast die Ablage genommen ({n} Karten)', e_discard_you: 'Du hast {card} abgeworfen',
  e_meld_you: 'Du hast ausgelegt', e_canasta_you: 'Du hast eine Canasta!', e_red3_you: 'Du hast eine rote Drei ausgelegt',
  e_goOut_you: 'Du hast ausgemacht!', wentOut_you: 'Du hast ausgemacht',
};

const ar: Dict = {
  tagline: 'الكاناستا الكلاسيكية، كما تُلعب على الطاولة.',
  chooseGame: 'اختر اللعبة',
  singles: 'فردي', singlesDesc: 'واحد ضد واحد · اسحب ورقتين · حتى 5000',
  quick: 'فردي سريع', quickDesc: 'واحد ضد واحد · اسحب ورقتين · حتى 2500',
  doubles: 'زوجي', doublesDesc: 'اثنان ضد اثنين مع شريك · حتى 5000',
  twoCanastas: 'كاناستتان للخروج',
  language: 'اللغة', tableStyle: 'شكل الطاولة', salon: 'الصالون', club: 'الجوخ الأخضر',
  prototype: 'نسخة تجريبية: تلعب ضد الكمبيوتر. الطاولات عبر الإنترنت والصالة والتصنيفات قادمة.',
  play: 'العب',
  us: 'نحن', them: 'هم', you: 'أنت', cards: 'أوراق: {n}',
  stock: 'الرزمة', pile: 'الأرض', frozen: 'مجمّدة',
  ourMelds: 'مجموعاتنا', theirMelds: 'مجموعاتهم',
  canastas: 'كاناستا', firstMeld: 'النزول الأول: {n}', melded: 'نزلنا',
  red3s: 'الثلاثات الحمراء',
  sDraw: 'دورك: اسحب من الرزمة أو خذ الأرض.',
  sDrawSel: 'لتأخذ الأرض، اختر الأوراق المطابقة من يدك ثم اضغط على الأرض.',
  sPlay: 'نزّل إن استطعت، ثم ارمِ ورقة واحدة.',
  sWait: '{name} يلعب…', sAnswer: 'بانتظار جواب {name}…',
  sStockOut: 'انتهت الرزمة. خذ الأرض أو أنهِ الجولة.',
  draw: 'اسحب', takePile: 'خذ الأرض', newMeld: 'مجموعة جديدة', layDown: 'نزّل', undo: 'تراجع',
  discard: 'ارمِ', ask: 'هل أخرج؟', endHand: 'أنهِ الجولة', menu: 'القائمة',
  addHint: 'تلميح: اختر أوراقاً ثم اضغط على إحدى مجموعاتك لإضافتها.',
  staged: 'لم تُنزَّل بعد',
  askTitle: '{name} يسأل: «يا شريكي، هل أخرج؟»', yes: 'نعم', no: 'لا',
  handOver: 'انتهت الجولة {n}', meldPoints: 'الأوراق النازلة', canastaBonus: 'الكاناستا', red3: 'الثلاثات الحمراء',
  goingOut: 'الخروج', handPenalty: 'أوراق في اليد', handTotal: 'مجموع الجولة', score: 'النتيجة',
  nextHand: 'الجولة التالية', gameOver: 'انتهت اللعبة', win: 'فريقك فاز!', lose: 'الفريق الآخر فاز.', tie: 'تعادل.',
  again: 'العب مرة أخرى', wentOut: '{name} خرج', concealed: '(من اليد)', noOut: 'انتهت الرزمة. لم يخرج أحد.',
  flash: 'كاناستا!', natural: 'نظيفة', mixed: 'مخلوطة',
  e_deal: 'توزيع الجولة {n}', e_draw1: '{name} سحب ورقة', e_draw: '{name} سحب ورقتين',
  e_takePile: '{name} أخذ الأرض (أوراق: {n})', e_discard: '{name} رمى {card}', e_meld: '{name} نزّل',
  e_canasta: '{name} أكمل كاناستا!', e_red3: '{name} نزّل ثلاثة حمراء', e_ask: '{name}: «هل أخرج؟»',
  e_yes: '{name}: «نعم»', e_no: '{name}: «لا»', e_goOut: '{name} خرج!', e_stockOut: 'انتهت الرزمة',
  err_not_your_turn: 'ليس دورك.', err_wrong_phase: 'لا يمكنك فعل ذلك الآن.',
  err_unknown_card: 'هذه الورقة ليست في يدك.', err_duplicate_card: 'تم اختيار ورقة مرتين.',
  err_stock_empty: 'الرزمة فارغة.', err_stock_not_empty: 'ما زالت هناك أوراق في الرزمة.',
  err_pile_empty: 'الأرض فارغة.', err_pile_top_unusable: 'لا يمكن أخذ الأرض وعليها ثلاثة سوداء أو ورقة جوكر.',
  err_pile_frozen_needs_pair: 'الأرض مجمّدة: تحتاج زوجاً نظيفاً مطابقاً للورقة العليا.',
  err_pile_needs_match: 'اختر زوجاً يطابق الورقة العليا (زوج نظيف، أو ورقة طبيعية مع جوكر).',
  err_no_meld_to_add: 'اختر أوراقاً تطابق الورقة العليا في الأرض.',
  err_meld_too_small: 'المجموعة تحتاج 3 أوراق على الأقل.', err_mixed_ranks: 'يجب أن تكون الأوراق الطبيعية في المجموعة من نفس الرقم.',
  err_need_two_naturals: 'المجموعة تحتاج ورقتين طبيعيتين على الأقل.', err_too_many_wilds: 'المجموعة لا تقبل أكثر من 3 جوكر.',
  err_threes_not_meldable: 'لا يمكن تنزيل الثلاثات.', err_black3_only_going_out: 'الثلاثات السوداء تُنزَّل فقط عند الخروج.',
  err_rank_exists: 'فريقك لديه هذه المجموعة. اضغط عليها لإضافة الأوراق.', err_not_your_meld: 'يمكنك الإضافة فقط لمجموعات فريقك.',
  err_cannot_add_black3: 'لا يمكن الإضافة إلى الثلاثات السوداء.', err_wrong_rank: 'هذه الأوراق لا تطابق هذه المجموعة.',
  err_minimum_not_met: 'نزولك الأول يحتاج {need} نقطة. لديك {have}.',
  err_need_canastas: 'تحتاج كاناستتين للخروج.', err_need_permission: 'اسأل شريكك أولاً: «هل أخرج؟»',
  err_keep_one_card: 'احتفظ بورقة واحدة على الأقل لترميها.', err_waiting_partner: 'انتظر جواب شريكك.',
  err_ask_before_melding: 'اسأل قبل أن تنزّل أي شيء في هذا الدور.', err_cannot_ask: 'لا يمكنك السؤال الآن.',
  err_must_take_pile: 'الورقة العليا تطابق مجموعتك، لذا يجب أن تأخذ الأرض.', err_nothing_to_play: 'اختر أوراقاً أولاً.',
  err_select_one: 'اختر ورقة واحدة فقط لترميها.',
  e_draw1_you: 'سحبتَ ورقة', e_draw_you: 'سحبتَ ورقتين', e_takePile_you: 'أخذتَ الأرض (أوراق: {n})',
  e_discard_you: 'رميتَ {card}', e_meld_you: 'نزّلتَ', e_canasta_you: 'أكملتَ كاناستا!', e_red3_you: 'نزّلتَ ثلاثة حمراء',
  e_goOut_you: 'خرجتَ!', wentOut_you: 'خرجتَ',
  sWait_f: '{name} تلعب…', askTitle_f: '{name} تسأل: «يا شريكي، هل أخرج؟»', wentOut_f: '{name} خرجت',
  e_draw1_f: '{name} سحبت ورقة', e_draw_f: '{name} سحبت ورقتين', e_takePile_f: '{name} أخذت الأرض (أوراق: {n})',
  e_discard_f: '{name} رمت {card}', e_meld_f: '{name} نزّلت', e_canasta_f: '{name} أكملت كاناستا!',
  e_red3_f: '{name} نزّلت ثلاثة حمراء', e_goOut_f: '{name} خرجت!',
};

const DICTS: Record<Lang, Dict> = { en, es, de, ar };

export function t(lang: Lang, key: string, params: Record<string, string | number> = {}): string {
  const raw = DICTS[lang][key] ?? en[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ''));
}

/** Who a message is about: lets languages pick second-person or feminine verb forms. */
export interface Who { name: string; you: boolean; female: boolean }

/** Like t(), but picks the `_you` or `_f` variant of a key when the language has one. */
export function tw(lang: Lang, key: string, who: Who, params: Record<string, string | number> = {}): string {
  const d = DICTS[lang];
  const k = who.you && d[`${key}_you`] ? `${key}_you` : who.female && d[`${key}_f`] ? `${key}_f` : key;
  return t(lang, k, { name: who.name, ...params });
}

export const errorText = (lang: Lang, code: ErrorCode | 'select_one', params?: Record<string, string | number>) =>
  t(lang, `err_${code}`, params);

const SUIT_SYMBOL: Record<string, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const cardLabel = (c: Card) => (c.rank === 'JK' ? '★' : `${c.rank}${SUIT_SYMBOL[c.suit ?? 'S']}`);
export const suitSymbol = (c: Card) => (c.rank === 'JK' ? '★' : SUIT_SYMBOL[c.suit ?? 'S']);

export function eventText(lang: Lang, ev: GameEvent, who: (seat: number) => Who): string | null {
  switch (ev.e) {
    case 'deal': return t(lang, 'e_deal', { n: ev.hand + 1 });
    case 'draw': return tw(lang, ev.n === 1 ? 'e_draw1' : 'e_draw', who(ev.seat), { n: ev.n });
    case 'takePile': return tw(lang, 'e_takePile', who(ev.seat), { n: ev.n });
    case 'discard': return tw(lang, 'e_discard', who(ev.seat), { card: cardLabel(ev.card) });
    case 'meld': return tw(lang, 'e_meld', who(ev.seat));
    case 'canasta': return tw(lang, 'e_canasta', who(ev.seat));
    case 'red3': return tw(lang, 'e_red3', who(ev.seat));
    case 'ask': return tw(lang, 'e_ask', who(ev.seat));
    case 'answer': return tw(lang, ev.yes ? 'e_yes' : 'e_no', who(ev.seat));
    case 'goOut': return tw(lang, 'e_goOut', who(ev.seat));
    case 'stockOut': return t(lang, 'e_stockOut');
  }
}
