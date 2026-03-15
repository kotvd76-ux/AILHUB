/**
 * verb_set.js — Конфіг модуля «Граматичні вправи»
 * Spanish AI Hub
 *
 * Кожна вправа містить:
 *   seeds[]   — тематичні ситуації (seed вибирається випадково щоразу)
 *   focuses[] — граматичні фокуси (focus вибирається випадково щоразу)
 *   aiPrompt(level) — функція; level береться з sel-level (getExerciseLevels з sett_set.js)
 *
 * МОВА: береться динамічно з getLangConfig() (sett_set.js).
 * РІВЕНЬ: передається параметром; профілі — GRAMMAR_CONFIG.levelProfiles.
 */

/** Повертає мовний конфіг або дефолт якщо getLangConfig ще не доступний */
function _vLang() {
    return (typeof getLangConfig === 'function')
        ? getLangConfig()
        : { targetName: 'Spanish', uiLanguage: 'Ukrainian', helperClause: '', helper: { id: 'none' }, target: { id: 'es' } };
}

const GRAMMAR_CONFIG = {

  homePage:     'index.html',
  settingsPage: 'settings.html',

  // ── Допустимі рівні для цього модуля ─────────────────────
  // Читаються у verbs.html для побудови sel-level.
  allowedLevels: ['A1', 'A2', 'B1', 'B2', 'C1'],

  // ── Шлях до сервера статистики ─────────────────
  statsPath: '',

  tasksPerSession: 5,
  get speechLang() { return (typeof getLangConfig === 'function') ? getLangConfig().speechLang : 'es-ES'; },
  uiLanguage:      'uk',
  autoNextDelay:   900,

  storageKeys: {
    lastExercise: 'sp_grammar_last_ex',
    sessionStats: 'sp_grammar_session',
  },

  // ── Профілі рівнів (мовозалежні) ────────────────────────
  // Використовуються у getLevelInstruction(level) для адаптації складності.
  // Тепер повертають профіль відповідно до обраної мови навчання.
  _levelProfilesByLang: {
    es: {
      A1: { grammar: 'ТІЛЬКИ Presente Indicativo; дієслова: ser, estar, tener, ir, querer, poder та прості регулярні -ar/-er/-ir', lexicon: 'базова лексика: числа, кольори, члени сім\'ї, частини тіла, базова їжа, дні тижня', syntax: 'прості короткі речення 3–5 слів, без складних підрядних' },
      A2: { grammar: 'Presente + Pretérito Indefinido + Futuro Simple базовий; рефлексивні дієслова; ir a + infinitivo', lexicon: 'побутова лексика: покупки, транспорт, помешкання, робота, хобі, базові прикметники', syntax: 'речення 5–8 слів, прості сполучники (y, pero, porque, cuando)' },
      B1: { grammar: 'усі часи Indicativo + Subjuntivo базовий (бажання, емоції) + рефлексивні + модальні (poder, deber, tener que)', lexicon: 'розмовна лексика: подорожі, медицина, офіс, стосунки, часові маркери', syntax: 'речення 7–11 слів; підрядні з que, cuando, si, aunque; прямий і непрямий порядок слів' },
      B2: { grammar: 'повний Subjuntivo (Presente і Imperfecto) + Condicional + Pluscuamperfecto + пасивний стан (se + verbo)', lexicon: 'широка лексика: ідіоми, колокації, фразові дієслова, термінологія', syntax: 'складні речення 10–15 слів; складні підрядні; умовні конструкції (Si + Imperfecto Subj + Condicional)' },
      C1: { grammar: 'весь граматичний спектр; тонке розрізнення Subjuntivo/Indicativo; Futuro Perfecto; Condicional Perfecto; Subjuntivo Perfecto; інверсія', lexicon: 'академічна та ідіоматична лексика; фразеологізми; стилістичні варіанти; нюанси синонімів', syntax: 'складні багатоклаузульні речення 14–20 слів; еліпсис; безособові конструкції; номіналізація' },
    },
    en: {
      A1: { grammar: 'Simple Present only; verbs: be, have, do, go, come, like, want, need, and basic regular verbs', lexicon: 'basic vocabulary: numbers, colors, family members, body parts, food, days of the week', syntax: 'short simple sentences 3–5 words, no complex subordinate clauses' },
      A2: { grammar: 'Simple Present + Simple Past + Future (will/going to) + Present Continuous; basic modals (can, must)', lexicon: 'everyday vocabulary: shopping, transport, home, work, hobbies, basic adjectives', syntax: 'sentences 5–8 words, simple conjunctions (and, but, because, when)' },
      B1: { grammar: 'all basic tenses + Present Perfect + Past Continuous + modals (can, must, should, have to, may) + 1st conditional', lexicon: 'conversational vocabulary: travel, medicine, office, relationships, time markers', syntax: 'sentences 7–11 words; clauses with that, when, if, although; direct and indirect word order' },
      B2: { grammar: 'Past Perfect + 2nd/3rd conditionals + passive voice + reported speech + gerunds vs. infinitives', lexicon: 'wide vocabulary: idioms, collocations, phrasal verbs, terminology', syntax: 'complex sentences 10–15 words; complex subordinate clauses; conditional structures (If + Past Simple + Would)' },
      C1: { grammar: 'full grammatical spectrum; inverted conditionals; advanced passives; emphatic structures; mixed conditionals; subjunctive mood', lexicon: 'academic and idiomatic vocabulary; phraseology; stylistic variants; nuances of synonyms', syntax: 'complex multi-clause sentences 14–20 words; ellipsis; impersonal constructions; nominalization' },
    },
    fr: {
      A1: { grammar: 'Présent Indicatif seulement; verbes: être, avoir, aller, faire, vouloir, pouvoir et réguliers -er', lexicon: 'vocabulaire de base: nombres, couleurs, famille, corps, nourriture, jours de la semaine', syntax: 'phrases courtes 3–5 mots, sans subordonnées complexes' },
      A2: { grammar: 'Présent + Passé Composé + Futur Proche; verbes réfléchis; imparfait basique', lexicon: 'vocabulaire quotidien: achats, transports, logement, travail, loisirs', syntax: 'phrases 5–8 mots, conjonctions simples (et, mais, parce que, quand)' },
      B1: { grammar: 'tous les temps Indicatif + Subjonctif présent basique + modaux (devoir, pouvoir, vouloir) + Conditionnel', lexicon: 'vocabulaire conversationnel: voyages, médecine, bureau, relations, marqueurs temporels', syntax: 'phrases 7–11 mots; subordonnées avec que, quand, si, bien que' },
      B2: { grammar: 'Subjonctif présent et passé + Conditionnel passé + Plus-que-parfait + voix passive', lexicon: 'large vocabulaire: idiomes, collocations, terminologie', syntax: 'phrases complexes 10–15 mots; structures conditionnelles complexes' },
      C1: { grammar: 'spectre grammatical complet; Subjonctif imparfait; distinctions fines; inversion; nominalisation', lexicon: 'vocabulaire académique et idiomatique; phraséologie; variantes stylistiques', syntax: 'phrases multi-propositions 14–20 mots; ellipse; constructions impersonnelles' },
    },
    de: {
      A1: { grammar: 'Präsens nur; Verben: sein, haben, werden, gehen, kommen, mögen; Kasus: Nominativ/Akkusativ', lexicon: 'Grundwortschatz: Zahlen, Farben, Familie, Körper, Essen, Wochentage', syntax: 'einfache Sätze 3–5 Wörter, ohne Nebensätze' },
      A2: { grammar: 'Präsens + Perfekt + Futur I; Modalverben (können, müssen, wollen, dürfen); Präteritum (sein/haben)', lexicon: 'Alltagswortschatz: Einkaufen, Verkehr, Wohnen, Arbeit, Hobbys', syntax: 'Sätze 5–8 Wörter, einfache Konjunktionen (und, aber, weil, wenn)' },
      B1: { grammar: 'alle Zeitformen Indikativ + Konjunktiv II basisch + Modalverben + Passiv Präsens/Perfekt', lexicon: 'Gesprächswortschatz: Reisen, Medizin, Büro, Beziehungen, Zeitangaben', syntax: 'Sätze 7–11 Wörter; Nebensätze mit dass, wenn, ob, obwohl; Verb-2. Position' },
      B2: { grammar: 'Konjunktiv I und II vollständig + Passiv (alle Zeiten) + Plusquamperfekt + Konditionalsätze', lexicon: 'umfangreicher Wortschatz: Redewendungen, Kollokationen, Fachbegriffe', syntax: 'komplexe Sätze 10–15 Wörter; Konditionalkonstruktionen; Partizipialkonstruktionen' },
      C1: { grammar: 'vollständiges Grammatikspektrum; Konjunktiv Plusquamperfekt; Inversion; nominale Strukturen; Modalpartikeln', lexicon: 'akademischer und idiomatischer Wortschatz; Phraseologie; Stilistik', syntax: 'Mehrfachsätze 14–20 Wörter; Ellipse; unpersönliche Konstruktionen' },
    },
    it: {
      A1: { grammar: 'solo Presente Indicativo; verbi: essere, avere, andare, fare, volere, potere e regolari', lexicon: 'vocabolario di base: numeri, colori, famiglia, corpo, cibo, giorni', syntax: 'frasi brevi 3–5 parole, senza subordinate complesse' },
      A2: { grammar: 'Presente + Passato Prossimo + Futuro Semplice; verbi riflessivi; stare + gerundio', lexicon: 'vocabolario quotidiano: shopping, trasporti, casa, lavoro, hobby', syntax: 'frasi 5–8 parole, congiunzioni semplici (e, ma, perché, quando)' },
      B1: { grammar: 'tutti i tempi Indicativo + Congiuntivo Presente basico + Condizionale + Imperfetto', lexicon: 'vocabolario conversazionale: viaggi, medicina, ufficio, relazioni', syntax: 'frasi 7–11 parole; subordinate con che, quando, se, anche se' },
      B2: { grammar: 'Congiuntivo completo + Condizionale Passato + Trapassato + voce passiva', lexicon: 'ampio vocabolario: idiomi, collocazioni, terminologia', syntax: 'frasi complesse 10–15 parole; strutture condizionali' },
      C1: { grammar: 'spettro grammaticale completo; sfumature Congiuntivo/Indicativo; strutture avanzate; nominalizzazione', lexicon: 'vocabolario accademico e idiomatico; fraseologia; varianti stilistiche', syntax: 'frasi multi-clausola 14–20 parole; ellissi; costruzioni impersonali' },
    },
    pl: {
      A1: { grammar: 'tylko Czas Teraźniejszy; czasowniki: być, mieć, iść, robić, chcieć, móc; koniugacja regularna', lexicon: 'podstawowe słownictwo: liczby, kolory, rodzina, ciało, jedzenie, dni tygodnia', syntax: 'proste zdania 3–5 słów, bez złożonych zdań podrzędnych' },
      A2: { grammar: 'Czas Teraźniejszy + Przeszły + Przyszły; czasowniki zwrotne; aspekt dokonany/niedokonany podstawowy', lexicon: 'codzienne słownictwo: zakupy, transport, dom, praca, hobby', syntax: 'zdania 5–8 słów, proste spójniki (i, ale, bo, kiedy)' },
      B1: { grammar: 'wszystkie czasy + Tryb Warunkowy podstawowy + modalne (móc, musieć, chcieć, powinien)', lexicon: 'słownictwo konwersacyjne: podróże, medycyna, biuro, relacje, wyrażenia czasu', syntax: 'zdania 7–11 słów; zdania podrzędne z że, kiedy, jeśli, chociaż' },
      B2: { grammar: 'Tryb Warunkowy rozszerzony + Strona Bierna + zdania złożone + aspekt szczegółowy', lexicon: 'szerokie słownictwo: idiomy, kolokacje, terminologia', syntax: 'zdania złożone 10–15 słów; struktury warunkowe' },
      C1: { grammar: 'pełne spektrum gramatyczne; tryb warunkowy złożony; inwersja; konstrukcje nominalne; mowa zależna', lexicon: 'akademickie i idiomatyczne słownictwo; frazeologia; warianty stylistyczne', syntax: 'wieloklauzulowe zdania 14–20 słów; elipsa; konstrukcje bezosobowe' },
    },
    pt: {
      A1: { grammar: 'apenas Presente Indicativo; verbos: ser, estar, ter, ir, querer, poder e regulares -ar/-er/-ir', lexicon: 'vocabulário básico: números, cores, família, corpo, comida, dias da semana', syntax: 'frases simples 3–5 palavras, sem orações subordinadas complexas' },
      A2: { grammar: 'Presente + Pretérito Perfeito Simples + Futuro Imediato (ir + inf); verbos reflexivos', lexicon: 'vocabulário cotidiano: compras, transporte, casa, trabalho, hobby', syntax: 'frases 5–8 palavras, conjunções simples (e, mas, porque, quando)' },
      B1: { grammar: 'todos os tempos Indicativo + Subjuntivo Presente básico + modais + Imperfeito', lexicon: 'vocabulário conversacional: viagens, medicina, escritório, relações, marcadores temporais', syntax: 'frases 7–11 palavras; orações subordinadas com que, quando, se, embora' },
      B2: { grammar: 'Subjuntivo completo + Condicional + Mais-que-perfeito + voz passiva + Futuro do Subjuntivo', lexicon: 'vocabulário amplo: expressões idiomáticas, colocações, terminologia', syntax: 'frases complexas 10–15 palavras; estruturas condicionais' },
      C1: { grammar: 'espectro gramatical completo; distinções sutis; Subjuntivo Imperfeito; inversão; nominalizações', lexicon: 'vocabulário acadêmico e idiomático; fraseologia; variantes estilísticas', syntax: 'frases multi-cláusula 14–20 palavras; elipse; construções impessoais' },
    },
    la: {
      A1: { grammar: 'Praesens 1st/2nd conjugation only; verbs: esse, habere; cases: Nominativus/Accusativus', lexicon: 'basic Latin: familia, numeralia, corpus, dies hebdomadis, res cotidianae', syntax: 'simple sentences 3–5 words; SVO/SOV word order' },
      A2: { grammar: 'all conjugations Praesens + Perfectum + Futurum; basic cases (nom/acc/gen/dat/abl)', lexicon: 'everyday Latin: vita quotidiana, domus, iter, amor, labor', syntax: 'sentences 5–8 words; simple subordinate clauses with ut, quod, cum' },
      B1: { grammar: 'all tenses Indicativus + Coniunctivus Praesens/Imperfectum; all cases; Passivum basic', lexicon: 'conversational Latin: travel, philosophy, nature, time, body', syntax: 'sentences 7–11 words; cum clauses; indirect statement (acc + inf)' },
      B2: { grammar: 'full Indicativus + Coniunctivus + infinitive constructions + participles + gerunds/gerundives', lexicon: 'wide Latin vocabulary: idioms, literary expressions, formal register', syntax: 'complex sentences 10–15 words; complex subordinate clauses; ablative absolute' },
      C1: { grammar: 'full grammatical spectrum; rare verb forms; literary constructions; subtle Coniunctivus usage', lexicon: 'academic and classical vocabulary; phraseology; prose and poetry styles', syntax: 'complex multi-clause sentences 14–20 words; ellipsis; impersonal constructions' },
    },
  },

  /** Повертає рядок-інструкцію рівня для вставки в початок промпту (мовозалежна) */
  getLevelInstruction(level) {
    const L = _vLang();
    const lang = (L.target && L.target.id) ? L.target.id : 'es';
    const profiles = this._levelProfilesByLang[lang] || this._levelProfilesByLang['en'];
    const p = profiles[level] || profiles['B1'];
    return (
      `\nПРОФІЛЬ РІВНЯ ${level}:\n` +
      `  • граматика: ${p.grammar}\n` +
      `  • лексика:   ${p.lexicon}\n` +
      `  • синтаксис: ${p.syntax}\n` +
      `Суворо дотримуйся цього профілю у ВСІХ 5 завданнях. ` +
      `Не виходь за межі рівня ні у граматиці, ні у лексиці.\n`
    );
  },

  feedback: {
    get systemPrompt() {
      const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian', helperClause: '' };
      return `Ти вчитель ${L.targetName}. Дай дуже короткий фідбек (до 15 слів) відповіддю на помилку учня. Пиши мовою ${L.uiLanguage}.${L.helperClause} Без привітань.`;
    },
    maxWords: 15,
  },

  exercises: [

    // ── 01 ДІЄСЛІВНЕ ДОМІНО ────────────────────────────────────
    {
      id:    'domino',
      num:   '01',
      label: 'Дієслівне доміно',
      level: 'A1–C1',

      seeds: [
        'хтось щойно впустив телефон у фонтан',
        'команда готується до фінального матчу',
        'пасажири чекають на затриманий рейс',
        'друзі планують несподіваний сюрприз',
        'механік ремонтує старий мотоцикл',
        'турист загубився в незнайомому місті',
        'кухар готує нову страву вперше',
        'студенти здають іспит онлайн',
        'пожежники гасять невелику пожежу',
        'сусіди сваряться через паркування',
        'дитина вчиться кататися на велосипеді',
        'блогер знімає відео в горах',
        'пацієнт чекає результатів аналізів',
        'журналіст бере інтерв\'ю на вулиці',
        'перукар стриже клієнта вперше',
        'волонтери сортують речі для фонду',
        'підліток вперше готує сніданок сам',
        'менеджер проводить онлайн-нараду',
        'мандрівник пакує рюкзак перед виходом',
        'художник малює портрет незнайомця',
      ],

      focuses: [
        'Акцент на Pretérito Indefinido (завершені одноразові дії)',
        'Акцент на Pretérito Imperfecto (тривалі стани і звичні дії в минулому)',
        'Акцент на Pretérito Perfecto (дії що мають зв\'язок із теперішнім)',
        'Акцент на Futuro Simple і Condicional (плани і припущення)',
        'Акцент на рефлексивних дієсловах (levantarse, quedarse, ponerse тощо)',
        'Акцент на ser vs estar у різних контекстах одного речення',
        'Акцент на Presente Progresivo (estar + gerundio)',
        'Акцент на модальних дієсловах (poder, deber, tener que, hay que)',
        'Акцент на Presente Indicativo (базові регулярні та нерегулярні дієслова)',
        'Акцент на ir a + infinitivo (найближче майбутнє)',
      ],

      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);
        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 різноманітних завдань на вибір правильної форми дієслова.\n` +
          lvl +
          '\nАЛГОРИТМ для кожного завдання:\n' +
          `  1. Склади природне речення мовою ${L.targetName} відповідно до профілю рівня ${level}\n` +
          '  2. Визнач дієслово або дієслівну групу яку учень має вгадати\n' +
          '  3. Поділи речення: before = все ДО дієслова, after = все ПІСЛЯ\n' +
          '  4. Склади 3 варіанти: правильний + 2 схожих але граматично неправильних для цього рівня\n' +
          '\nЗАБОРОНЕНО: hablar, comer, vivir, ir al trabajo, ir al mercado,\n' +
          'tener hambre/sed, me llamo, Buenos días, estar bien, la casa grande.\n' +
          '\nПоле explain — ОБОВ\'ЯЗКОВЕ, 7–12 слів: чому саме ця форма.\n' +
          `Поле uk — ТІЛЬКИ переклад мовою ${L.uiLanguage}, без жодних інших мов у дужках.\n` +
          (L.helper.id !== 'none' ? `Поле en — ТІЛЬКИ переклад мовою ${L.helper.nameEn}, ОКРЕМО від поля uk.\n` : '') +
          'Відповідай ТІЛЬКИ валідним JSON без markdown:\n' +
          (L.helper.id !== 'none'
              ? '{"tasks":[{"before":"частина ДО","correct":"правильне дієслово/група","after":"частина ПІСЛЯ","opts":["правильний","хибний1","хибний2"],"uk":"переклад","en":"переклад допоміжною мовою","explain":"7–12 слів"}]}\n'
              : '{"tasks":[{"before":"частина ДО","correct":"правильне дієслово/група","after":"частина ПІСЛЯ","opts":["правильний","хибний1","хибний2"],"uk":"переклад","explain":"7–12 слів"}]}\n'
          ) +
          'ВАЖЛИВО: opts — рівно 3 елементи, correct ОБОВ\'ЯЗКОВО серед них.\n' +
          'Згенеруй рівно 5 об\'єктів у масиві tasks.'
        );
      },
    },

    // ── 02 КОНТРАСТ ФОРМ (мовозалежна) ────────────────────────
    {
      id:    'contrast',
      num:   '02',
      label: 'Контраст форм (мовозалежна)',
      level: 'A2–C1',

      seeds: [
        'розмова з лікарем про діагноз',
        'суперечка між партнерами по бізнесу',
        'прощання на вокзалі',
        'переговори про підвищення зарплати',
        'розмова між батьками і підлітком',
        'дискусія про зміну клімату',
        'порада другові перед важливим рішенням',
        'скарга менеджеру готелю',
        'розмова волонтерів перед акцією',
        'планування весілля в останній момент',
        'конфлікт сусідів через шум',
        'інструктаж нового співробітника',
        'обговорення нового проєкту на нараді',
        'розмова студентів перед іспитом',
        'вибачення після непорозуміння',
      ],

      get focuses() {
        const L = _vLang();
        const lang = (L.target && L.target.id) ? L.target.id : 'es';
        if (lang === 'es') return [
          'Тригери волевиявлення і бажання (querer, desear, pedir, insistir en)',
          'Тригери сумніву і заперечення (dudar, no creer, no estar seguro)',
          'Тригери емоцій (alegrarse, tener miedo, sorprender, molestar)',
          'Тригери часу в майбутньому (cuando, en cuanto, hasta que, antes de que)',
          'Тригери умови і поступки (aunque, a menos que, con tal de que, para que)',
          'Тригери ojalá і impersonal (es necesario que, es posible que, conviene que)',
          'Контраст Presente Indicativo vs Pretérito Indefinido (факт vs завершена дія)',
          'Контраст Imperfecto (фон) vs Indefinido (передній план)',
          'Контраст Presente vs Futuro Simple (теперішнє vs план)',
        ];
        if (lang === 'en') return [
          'Simple Past vs. Present Perfect (completed action vs. current relevance)',
          'Will vs. Going to (spontaneous decision vs. planned action)',
          'Present Simple vs. Present Continuous (habit vs. temporary action)',
          'Past Simple vs. Past Continuous (completed event vs. background action)',
          'Modal verbs: must vs. have to vs. should vs. need to',
          'Zero/First conditional vs. Second conditional (real vs. hypothetical)',
          'Present Perfect vs. Present Perfect Continuous (completion vs. ongoing duration)',
          'Active vs. Passive voice (focus on action vs. focus on result)',
          'Gerund vs. Infinitive after verbs (stop doing vs. stop to do)',
        ];
        // Generic fallback for other languages
        return [
          `Contrast of main tenses in ${L.targetName} (present vs. past)`,
          `Modal verbs and their equivalents in ${L.targetName}`,
          `Aspect: completed vs. ongoing actions in ${L.targetName}`,
          `Conditional structures in ${L.targetName}`,
          `Active vs. passive constructions in ${L.targetName}`,
          `Contrast of future tense forms in ${L.targetName}`,
        ];
      },

      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);

        // Вибір граматичного фокусу залежно від рівня
        const isLow = level === 'A1' || level === 'A2';
        const gramFocus = isLow
          ? (L.target.id === 'es'
              ? `контраст Presente Indicativo vs Pretérito Indefinido (прості нерегулярні дієслова)`
              : `контраст основних форм Presente і минулого часу у ${L.targetName}`)
          : (L.target.id === 'es'
              ? `Subjuntivo Presente. Варіанти: правильна форма Subjuntivo, дві хибних (Indicativo і Futuro або Condicional). Поле explain — чому Subjuntivo у цьому контексті.`
              : `складна дієслівна форма (Subjunctive / conditional / modal verbs) у ${L.targetName}. Варіанти: правильна форма, дві хибних. Поле explain — чому саме ця форма.`);

        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 завдань на ${gramFocus}\n` +
          lvl +
          'Речення розбите на дві частини навколо пропуску — учень обирає одну дієслівну форму з 3 варіантів.\n' +
          'ВАЖЛИВО: opts містять ТІЛЬКИ саме дієслово (одне слово), без решти речення.\n' +
          (isLow ? 'ВАЖЛИВО: використовуй лише граматику рівня — без Subjuntivo.\n' : '') +
          `\nПоле uk — переклад мовою ${L.uiLanguage}.${L.helperClause}\n` +
          (L.helper.id !== 'none' ? `Поле en — переклад мовою ${L.helper.nameEn} (для лінгвістичного містку).\n` : '') +
          'Відповідай ТІЛЬКИ валідним JSON без markdown:\n' +
          (L.helper.id !== 'none'
              ? '{"tasks":[{"before":"частина речення ДО пропуску","after":"частина речення ПІСЛЯ пропуску","uk":"переклад","en":"переклад допоміжною мовою","opts":["правильна форма","хибна1","хибна2"],"correct":"правильна форма","explain":"7–12 слів"}]}\n'
              : '{"tasks":[{"before":"частина речення ДО пропуску","after":"частина речення ПІСЛЯ пропуску","uk":"переклад","opts":["правильна форма","хибна1","хибна2"],"correct":"правильна форма","explain":"7–12 слів"}]}\n'
          ) +
          'Згенеруй рівно 5 об\'єктів у масиві tasks.'
        );
      },
    },

    // ── 03 FILL-IN-THE-BLANK ───────────────────────────────────
    {
      id:    'fill',
      num:   '03',
      label: 'Fill-in-the-Blank',
      level: 'A1–C1',

      seeds: [
        'у кабіні пілота під час турбулентності',
        'на кухні ресторану в час пік',
        'у черзі на митниці',
        'у порожньому музеї вночі',
        'на будівельному майданчику',
        'у підводному човні',
        'в операційній лікарні',
        'на метеостанції в горах',
        'у студії звукозапису',
        'на нічній вахті маяка',
        'в архіві старих документів',
        'на фермі під час збору врожаю',
        'у лабораторії під час експерименту',
        'на борту вітрильника в шторм',
        'у тренажерному залі під час змагань',
        'на відкритому ринку з ремеслами',
        'у студентській їдальні в перерву',
        'в офісі під час тривоги',
        'на гірськолижному курорті',
        'у бібліотеці перед закриттям',
      ],

      get focuses() {
        const L = _vLang();
        const lang = (L.target && L.target.id) ? L.target.id : 'es';
        if (lang === 'es') return [
          'Всі 5 пропусків — різні часи: Presente / Indefinido / Imperfecto / Perfecto / Futuro',
          'Акцент на контрасті Indefinido (факт) vs Imperfecto (фон)',
          'Акцент на Pretérito Perfecto і маркерах: ya, todavía, hoy, esta semana',
          'Акцент на Futuro Simple і Condicional Simple',
          'Акцент на рефлексивних і безособових конструкціях (se + verb)',
          'Акцент на Presente Progresivo і Futuro Próximo (ir a + inf)',
          'Акцент на Presente Indicativo — регулярні та нерегулярні дієслова',
          'Акцент на Subjuntivo Presente після тригерних виразів (B1+)',
          'Акцент на Condicional Simple (ввічливе прохання, гіпотеза) (B2+)',
        ];
        if (lang === 'en') return [
          'All 5 blanks cover different tenses: Present Simple / Past Simple / Present Perfect / Past Continuous / Future',
          'Focus on Past Simple vs. Past Continuous (completed event vs. background action)',
          'Focus on Present Perfect and markers: already, yet, ever, just, recently',
          'Focus on Future Simple (will) and Future Continuous',
          'Focus on passive voice constructions (is/are/was/were + past participle)',
          'Focus on Present Simple and Present Continuous (state vs. temporary action)',
          'Focus on modal verbs (can/could, must/had to, should, would, might)',
          'Focus on conditionals: zero, first, second conditional',
          'Focus on gerunds and infinitives after verbs',
        ];
        // Generic fallback for other languages
        return [
          `All 5 blanks cover different tenses in ${L.targetName}`,
          `Focus on completed vs. ongoing actions in ${L.targetName}`,
          `Focus on Present Perfect equivalents in ${L.targetName}`,
          `Focus on future tense forms in ${L.targetName}`,
          `Focus on passive voice in ${L.targetName}`,
          `Focus on modal verbs in ${L.targetName}`,
          `Focus on conditionals in ${L.targetName}`,
        ];
      },

      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);
        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 завдань Fill-in-the-Blank на дієслівні форми.\n` +
          lvl +
          '\nРечення розбите на дві частини навколо пропуску.\n' +
          'Три варіанти: одна правильна форма, дві хибних (схожих, граматично неправильних для цього рівня).\n' +
          'ВАЖЛИВО: усі дієслівні форми мають відповідати профілю рівня — не виходь за межі.\n' +
          '\nЗАБОРОНЕНО: hablar, comer, vivir, ir al trabajo, estar bien, tener hambre.\n' +
          '\nПоле explain — ОБОВ\'ЯЗКОВЕ, 7–12 слів, чому саме ця форма.\n' +
          `Поле uk — ТІЛЬКИ переклад мовою ${L.uiLanguage}, без жодних інших мов у дужках.\n` +
          (L.helper.id !== 'none' ? `Поле en — ТІЛЬКИ переклад мовою ${L.helper.nameEn}, ОКРЕМО від поля uk.\n` : '') +
          'Відповідай ТІЛЬКИ валідним JSON без markdown:\n' +
          (L.helper.id !== 'none'
              ? '{"tasks":[{"before":"частина до пропуску","blank":"___","after":"частина після пропуску","uk":"переклад","en":"переклад допоміжною мовою","opts":["правильна","хибна1","хибна2"],"correct":"правильна","explain":"7–12 слів"}]}\n'
              : '{"tasks":[{"before":"частина до пропуску","blank":"___","after":"частина після пропуску","uk":"переклад","opts":["правильна","хибна1","хибна2"],"correct":"правильна","explain":"7–12 слів"}]}\n'
          ) +
          'Згенеруй рівно 5 об\'єктів у масиві tasks.'
        );
      },
    },

    // ── 04 КОНТЕКСТНИЙ ВИБІР (3 варіанти, мовозалежна) ────────
    {
      id:    'context3',
      num:   '04',
      label: 'Контекстний вибір (3 варіанти)',
      level: 'A1–C1',

      seeds: [
        'актор прямо перед виходом на сцену',
        'туристка яка щойно приземлилась у новій країні',
        'лікар після 36-годинної зміни',
        'спортсмен одразу після фінішу марафону',
        'архітектор показує своє перше побудоване місто',
        'дитина яка знайшла загублену іграшку',
        'шеф-кухар пробує страву конкурента',
        'програміст після трьох днів без сну',
        'пенсіонер у своєму новому будинку',
        'дипломат на першій зустрічі з президентом',
        'студент після захисту дисертації',
        'пілот під час першого самостійного польоту',
        'вчителька після першого дня в новій школі',
        'атлет, що щойно встановив особистий рекорд',
        'дитина в перший день у новому садочку',
      ],

      focuses: [
        'Акцент на прикметниках що ЗМІНЮЮТЬ значення: listo/malo/rico/aburrido/seguro/bueno',
        'Акцент на estar + стан vs ser + риса (cansado/alto, nervioso/tranquilo)',
        'Акцент на ser + матеріал, походження, призначення',
        'Акцент на estar + місцезнаходження і ser + де відбувається подія',
        'Акцент на пасивному стані: estar + дієприкметник (roto, abierto, cerrado)',
        'Змішаний: 3 × estar (стан/місце/пасив) і 2 × ser (характеристика/іменник)',
        'Контекст A1–A2: лише базові дієслова ser/estar з простими прикметниками',
      ],

      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);
        const isLow = level === 'A1' || level === 'A2';
        const focusMap = L.target.id === 'en'
          ? 'фразові дієслова та артиклі (a/an/the/zero)'
          : L.target.id === 'es'
            ? 'Ser vs Estar (лише це протиставлення у всіх 5 завданнях)'
            : L.target.id === 'fr'
              ? 'займенники-додатки (en/y/le-la-les) та узгодження'
              : `контекстний граматичний вибір у ${L.targetName}`;
        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 завдань на ${focusMap}.\n` +
          lvl +
          (L.target.id === 'es'
            ? 'ОБОВ\'ЯЗКОВО для іспанської: усі 5 завдань тільки на ser/estar (Presente), без Subjuntivo та без інших тем.\n'
            : '') +
          (isLow ? 'РІВЕНЬ A1/A2: використовуй лише прості прикметники (bueno, cansado, joven, feliz, ocupado тощо).\n' : '') +
          'Кожне завдання: sentence (з ___), opts (РІВНО 3 варіанти), correct (один з opts), hint, explain.\n' +
          (L.target.id === 'es'
            ? 'Для іспанської opts повинні бути тільки формами ser/estar: 1 правильна форма + 2 правдоподібні хибні форми.\n'
            : '') +
          'ВАЖЛИВО: це вправа на вибір між 3 варіантами, не swipe A/B.\n' +
          `Поле hint — коротка підказка мовою ${L.uiLanguage}.\n` +
          `Поле uk — переклад мовою ${L.uiLanguage}.${L.helperClause}\n` +
          (L.helper.id !== 'none' ? `Поле en — переклад мовою ${L.helper.nameEn}.\n` : '') +
          'Відповідай ТІЛЬКИ валідним JSON без markdown:\n' +
          (L.helper.id !== 'none'
            ? '{"tasks":[{"sentence":"речення з ___","opts":["варіант1","варіант2","варіант3"],"correct":"варіант1","hint":"підказка","uk":"переклад","en":"переклад","explain":"7–12 слів"}]}'
            : '{"tasks":[{"sentence":"речення з ___","opts":["варіант1","варіант2","варіант3"],"correct":"варіант1","hint":"підказка","uk":"переклад","explain":"7–12 слів"}]}'
          ) + '\n' +
          'Згенеруй рівно 5 об\'єктів у масиві tasks.'
        );
      },
    },

    // ── 05 ЗНАЙДИ ПОМИЛКУ ──────────────────────────────────────
    {
      id:    'spotfix',
      num:   '05',
      label: 'Знайди помилку',
      level: 'A2–C1',

      seeds: [
        'обладнання у фотостудії',
        'розклад потягів і автобусів',
        'меню ресторану з морепродуктами',
        'інструкція до складання меблів',
        'прогноз погоди на тиждень',
        'оголошення в аеропорту',
        'рецепт традиційної іспанської страви',
        'список речей для кемпінгу',
        'опис квартири для оренди',
        'розклад тренувань у спортзалі',
        'програма музичного фестивалю',
        'інструкція з першої допомоги',
        'меню дитячого кафе',
        'реклама туристичного агентства',
        'оголошення про втрату тварини',
        'розклад занять у мовній школі',
      ],

      get focuses() {
        const L = _vLang();
        const lang = (L.target && L.target.id) ? L.target.id : 'es';
        if (lang === 'es') return [
          'Помилки тільки у формах дієслів (особа, число, час відповідно до рівня)',
          'Помилки у рід/число іменників і прикметників',
          'Помилки у вживанні артиклів (el/la/un/una/los/las)',
          'Помилки у прийменниках (a/en/de/por/para/con/sin)',
          'Змішані помилки: дієслово + артикль + прийменник + займенник + прикметник',
          'Помилки у займенниках (me/te/le/lo/la/nos/les/los/las)',
        ];
        if (lang === 'en') return [
          'Errors in verb forms (wrong tense or person agreement)',
          'Errors in subject-verb agreement (is/are, was/were, does/do)',
          'Errors in article usage (a/an/the/zero article)',
          'Errors in prepositions (in/on/at/to/for/by/with)',
          'Mixed errors: verb + article + preposition + pronoun + adjective',
          'Errors in pronouns (wrong case: I/me, he/him, she/her, they/them)',
        ];
        // Generic fallback for other languages
        return [
          `Errors in verb forms in ${L.targetName}`,
          `Errors in articles or determiners in ${L.targetName}`,
          `Errors in prepositions in ${L.targetName}`,
          `Errors in pronouns in ${L.targetName}`,
          `Mixed grammatical errors in ${L.targetName}`,
        ];
      },

      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);
        const isLow = level === 'A1' || level === 'A2';
        const lang = (L.target && L.target.id) ? L.target.id : 'es';

        const errorTypes = lang === 'es'
          ? (
            '\nОБОВ\'ЯЗКОВО: 5 різних типів помилок — жоден тип не повторюється:\n' +
            '  1. Форма дієслова (особа або час — у межах рівня)\n' +
            '  2. Рід або число прикметника\n' +
            '  3. Артикль (el/la/un/una/los/las)\n' +
            '  4. Прийменник (a/en/de/por/para/con/sin)\n' +
            '  5. Займенник (me/te/le/lo/la/nos/les/los/las)\n'
          ) : lang === 'en' ? (
            '\nОБОВ\'ЯЗКОВО: 5 різних типів помилок — жоден тип не повторюється:\n' +
            '  1. Форма дієслова (час або особа — у межах рівня)\n' +
            '  2. Артикль (a/an/the/zero article)\n' +
            '  3. Прийменник (in/on/at/to/for/by/with)\n' +
            '  4. Займенник (форма відмінку: I/me, he/him, she/her, they/them)\n' +
            '  5. Узгодження підмета і присудка (subject-verb agreement)\n'
          ) : (
            '\nОБОВ\'ЯЗКОВО: 5 різних типів помилок — жоден тип не повторюється:\n' +
            '  1. Форма дієслова\n' +
            '  2. Артикль або детермінант\n' +
            '  3. Прийменник\n' +
            '  4. Займенник\n' +
            '  5. Узгодження (число/рід/час)\n'
          );

        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 завдань «Знайди і виправ граматичну помилку».\n` +
          lvl +
          `\nКожне: фраза мовою ${L.targetName} 4–7 слів з ОДНИМ навмисно неправильним словом.\n` +
          `Граматичні помилки мають відповідати рівню ${level} (не вводь конструкції вищого рівня).\n` +
          errorTypes +
          (isLow ? `РІВЕНЬ A1/A2: уникай складних часів — лише найпростіші форми у ${L.targetName}.\n` : '') +
          '\nПоля ОБОВ\'ЯЗКОВІ: words (масив слів без пунктуації), errorIdx (0-based),\n' +
          'correctWord, fixOptions (рівно 3: correctWord + 2 хибних),\n' +
          `uk — ТІЛЬКИ переклад мовою ${L.uiLanguage}, без жодних інших мов у дужках.\n` +
          (L.helper.id !== 'none' ? `en — ТІЛЬКИ переклад мовою ${L.helper.nameEn}, ОКРЕМО від поля uk.\n` : '') +
          'ВАЖЛИВО: words[errorIdx] має бути ПОМИЛКОВИМ словом і НЕ дорівнювати correctWord.\n' +
          'ВАЖЛИВО: correctWord ОБОВ\'ЯЗКОВО присутній серед fixOptions.\n' +
          'КРИТИЧНО: words[errorIdx] і correctWord ПОВИННІ належати до ОДНІЄЇ граматичної категорії — артикль замінюється артиклем, прийменник — прийменником, форма дієслова — формою того самого або спорідненого дієслова. НЕ можна замінювати прийменник артиклем або навпаки.\n' +
          'КРИТИЧНО: усі 3 fixOptions мають належати до тієї самої граматичної категорії що й correctWord.\n' +
          'КРИТИЧНО: речення words[] із correctWord на місці words[errorIdx] ПОВИННО бути повністю граматично правильним — перевір перед генерацією.\n' +
          'КРИТИЧНО: слово correctWord (та будь-яка його однокоренева форма) НЕ повинно з\'являтися в реченні ніде, крім позиції errorIdx. Наприклад, якщо correctWord="forgot", то слово "forget" не може бути в інших позиціях words[].\n' +
          'Відповідай ТІЛЬКИ валідним JSON без markdown:\n' +
          (L.helper.id !== 'none'
              ? '{"tasks":[{"words":[...],"errorIdx":0,"correctWord":"...","fixOptions":["...","...","..."],"uk":"...","en":"...","explain":"..."}]}\n'
              : '{"tasks":[{"words":[...],"errorIdx":0,"correctWord":"...","fixOptions":["...","...","..."],"uk":"...","explain":"..."}]}\n'
          ) +
          'Згенеруй рівно 5 об\'єктів у масиві tasks.'
        );
      },
    },

    // ── 06 TAP-ORDER TRANSFORM ───────────────────────────────
    {
      id:    'transform',
      num:   '06',
      label: 'Tap-order transform',
      level: 'A1–C1',
      seeds: [
        'на співбесіді', 'у кав\'ярні', 'під час подорожі потягом', 'на прийомі у лікаря',
        'під час сімейної вечері', 'під час онлайн-уроку', 'на вечірці з друзями',
        'у черзі в супермаркеті', 'під час прогулянки в парку', 'на спортивному тренуванні',
      ],
      focuses: [
        'перетворення часу (відповідно до рівня)',
        'перетворення ствердження у заперечення',
        'заміна іменника займенником',
        'коректний порядок слів у питанні',
        'зміна особи (я → він/вона)',
        'усталені вирази і колокації рівня',
      ],
      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);
        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 завдань формату Tap-order transform.\n` +
          lvl +
          `\nКожне завдання: source (вихідна фраза або речення), tokens (перемішані слова результату), correctSentence, uk, explain.\n` +
          `КРИТИЧНО ВАЖЛИВО: source ЗАВЖДИ ТІЛЬКИ мовою ${L.targetName}. Ніколи не використовуй іншу мову для source.\n` +
          `Складність трансформацій має строго відповідати рівню ${level}.\n` +
          'ОБОВ\'ЯЗКОВО: щонайменше 3 з 5 завдань мають бути усталеними виразами/колокаціями рівня.\n' +
          'ОБОВ\'ЯЗКОВО: correctSentence коротке — максимум 5 слів.\n' +
          'tokens мають складати correctSentence без зайвих слів.\n' +
          (L.helper.id !== 'none' ? `Додай en мовою ${L.helper.nameEn}.\n` : '') +
          'JSON only:\n' +
          (L.helper.id !== 'none'
            ? '{"tasks":[{"source":"...","tokens":["..."],"correctSentence":"...","uk":"...","en":"...","explain":"7–12 слів"}]}'
            : '{"tasks":[{"source":"...","tokens":["..."],"correctSentence":"...","uk":"...","explain":"7–12 слів"}]}'
          )
        );
      },
    },

    // ── 07 СЛОВНИК ───────────────────────────────────────────
    {
      id:    'vocab',
      num:   '07',
      label: 'Словник',
      level: 'A1–C1',
      seeds: [
        'подорожі', 'офіс', 'ресторан', 'small talk', 'сімʼя', 'шопінг',
        'здоровʼя', 'надзвичайні ситуації', 'спорт', 'навчання', 'технології',
        'природа', 'розваги', 'їжа', 'транспорт', 'дім', 'хобі', 'культура',
        'фінанси', 'соцмережі',
      ],
      focuses: [
        'колокації і усталені вирази рівня',
        'щоденна побутова лексика',
        'короткі корисні фрази для спілкування',
        'контекстне запам\'ятовування (слово в реченні)',
        'синоніми і антоніми рівня',
        'тематична лексика (тема сесії)',
      ],
      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);
        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 словникових завдань для смартфона.\n` +
          lvl +
          `\nФормат кожного завдання:\n` +
          `  nativeWord — одне слово або усталений вираз мовою ${L.uiLanguage} (показується учню як запитання)\n` +
          `  opts — рівно 3 варіанти мовою ${L.targetName}: всі три пов'язані за темою/сферою зі значенням nativeWord, але ТІЛЬКИ ОДИН є точним перекладом nativeWord\n` +
          `  correct — точний переклад nativeWord мовою ${L.targetName} (ОБОВ'ЯЗКОВО один з opts)\n` +
          `  uk — пояснення або приклад вживання мовою ${L.uiLanguage}\n` +
          `  explain — 7–12 слів чому саме цей варіант правильний\n` +
          `  example — коротке речення мовою ${L.targetName} з правильним словом\n` +
          'ОБОВ\'ЯЗКОВО: всі 3 opts мають бути схожими за темою, але хибні два — неточні або ширші за значенням.\n' +
          'У вправі 7 дозволені ТІЛЬКИ: 1) окремі слова; 2) усталені вирази до 2 слів.\n' +
          `ОБОВ\'ЯЗКОВО: лексика строго відповідає рівню ${level} — не вводь слів вищого рівня.\n` +
          'ОБОВ\'ЯЗКОВО: і nativeWord, і кожен елемент opts, і correct — максимум 2 слова.\n' +
          'Використовуй лексику з ТЕМИ СЕСІЇ (передана нижче у промпті).\n' +
          (L.helper.id !== 'none' ? `Додай en мовою ${L.helper.nameEn}.\n` : '') +
          'JSON only:\n' +
          (L.helper.id !== 'none'
            ? '{"tasks":[{"nativeWord":"...","opts":["...","...","..."],"correct":"...","uk":"...","en":"...","example":"...","explain":"7–12 слів"}]}'
            : '{"tasks":[{"nativeWord":"...","opts":["...","...","..."],"correct":"...","uk":"...","example":"...","explain":"7–12 слів"}]}'
          )
        );
      },
    },

  ],
};
