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
 * РІВЕНЬ: передається параметром; профілі беруться централізовано з sett_set.js
 * через getExerciseLevelProfile(level). Профілі є мовонезалежними.
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

  /** Повертає рядок-інструкцію рівня для вставки в початок промпту */
  getLevelInstruction(level) {
    const central = (typeof getExerciseLevelProfile === 'function')
      ? getExerciseLevelProfile(level)
      : {
          pace: 'Помірний навчальний темп',
          lexicon: 'розмовна лексика середнього рівня',
          grammar: 'основні часові й модальні форми',
          sentences: '2–3 речення по 7–11 слів',
          constraints: 'базові складнопідрядні',
        };
    const p = {
      pace: central.pace,
      grammar: central.grammar,
      lexicon: central.lexicon,
      syntax: central.sentences,
      constraints: central.constraints || 'Не виходь за межі рівня.',
    };
    return (
      `\nПРОФІЛЬ РІВНЯ ${level}:\n` +
      `  • темп:      ${p.pace}\n` +
      `  • граматика: ${p.grammar}\n` +
      `  • лексика:   ${p.lexicon}\n` +
      `  • синтаксис: ${p.syntax}\n` +
      `  • обмеження: ${p.constraints}\n` +
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


      get focuses() {
        const L = _vLang();
        const lang = (L.target && L.target.id) ? L.target.id : 'es';
        if (lang === 'es') return [
          'Акцент на прикметниках що ЗМІНЮЮТЬ значення: listo/malo/rico/aburrido/seguro/bueno',
          'Акцент на estar + стан vs ser + риса (cansado/alto, nervioso/tranquilo)',
          'Акцент на ser + матеріал, походження, призначення',
          'Акцент на estar + місцезнаходження і ser + де відбувається подія',
          'Акцент на пасивному стані: estar + дієприкметник (roto, abierto, cerrado)',
          'Змішаний: 3 × estar (стан/місце/пасив) і 2 × ser (характеристика/іменник)',
          'Контекст A1–A2: лише базові дієслова ser/estar з простими прикметниками',
        ];
        if (lang === 'en') return [
          'Phrasal verbs: give up/in/out, pick up, turn on/off, look after/for',
          'Articles: a/an vs the vs zero article (first mention vs. known entity)',
          'Prepositions of time: in/on/at (months, days, clock times)',
          'Prepositions of place: in/on/at/by (location vs. surface vs. point)',
          'Quantifiers: some/any/much/many/a lot of/a few/a little',
        ];
        if (lang === 'fr') return [
          'Pronoms COD vs COI (le/la/les vs lui/leur)',
          'Pronoms en vs y (de + nom vs à + lieu)',
          'Accord du participe passé avec avoir (COD placé avant)',
          'Pronoms disjoints après préposition (avec moi/toi/lui/elle)',
          'Double pronom (me le, lui en, y en)',
        ];
        return [
          `Contextual grammar choice in ${L.targetName}: contrast of two similar forms`,
          `Prepositions in ${L.targetName}: selecting the correct one by context`,
          `Articles or determiners in ${L.targetName}`,
          `Pronouns and their placement in ${L.targetName}`,
        ];
      },

      aiPrompt(level) {
        const L   = _vLang();
        const lvl = GRAMMAR_CONFIG.getLevelInstruction(level);
        const isLow = level === 'A1' || level === 'A2';
        const focusMap = L.target.id === 'en'
          ? 'ОДИН граматичний тип (обери сам): або (A) фразові дієслова (give up/in/out, pick up, turn on/off тощо), або (B) артиклі (a/an/the/zero) — усі 5 завдань ТІЛЬКИ один тип, не змішуй'
          : L.target.id === 'es'
            ? 'Ser vs Estar (лише це протиставлення у всіх 5 завданнях)'
            : L.target.id === 'fr'
              ? 'займенники-додатки (en/y/le-la-les) та узгодження'
              : `контекстний граматичний вибір у ${L.targetName}`;
        return (
          `Ти вчитель ${L.targetName}. Згенеруй 5 завдань на ${focusMap}.\n` +
          lvl +
          '\nАЛГОРИТМ для кожного завдання:\n' +
          `  1. Склади природне речення мовою ${L.targetName} з пропуском ___ на місці цільової форми\n` +
          '  2. Правильний варіант — граматично єдино можливий у цьому контексті\n' +
          '  3. Два хибних — схожі форми тієї самої граматичної категорії, але неправильні саме тут\n' +
          '  4. Перевір: речення з правильним варіантом — бездоганне; з хибним — граматично неправильне\n' +
          (L.target.id === 'es'
            ? 'ОБОВ\'ЯЗКОВО для іспанської: усі 5 завдань тільки на ser/estar (Presente), без Subjuntivo та без інших тем.\n'
            : '') +
          (isLow ? 'РІВЕНЬ A1/A2: використовуй лише прості прикметники (bueno, cansado, joven, feliz, ocupado тощо).\n' : '') +
          (L.target.id === 'es'
            ? 'Для іспанської opts повинні бути тільки формами ser/estar: 1 правильна форма + 2 правдоподібні хибні форми.\n'
            : '') +
          'КРИТИЧНО: поле correct ПОВИННО бути СИМВОЛ-В-СИМВОЛ ідентичним одному з елементів масиву opts — не скорочуй, не змінюй регістр.\n' +
          `Поле hint — коротка підказка мовою ${L.uiLanguage}.\n` +
          `Поле uk — переклад мовою ${L.uiLanguage}.${L.helperClause}\n` +
          (L.helper.id !== 'none' ? `Поле en — переклад мовою ${L.helper.nameEn}.\n` : '') +
          'Відповідай ТІЛЬКИ валідним JSON без markdown:\n' +
          (L.helper.id !== 'none'
            ? '{"tasks":[{"sentence":"речення з ___","opts":["хибний1","правильний","хибний2"],"correct":"правильний","hint":"підказка","uk":"переклад","en":"переклад","explain":"7–12 слів"}]}'
            : '{"tasks":[{"sentence":"речення з ___","opts":["хибний1","правильний","хибний2"],"correct":"правильний","hint":"підказка","uk":"переклад","explain":"7–12 слів"}]}'
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
          '\nАЛГОРИТМ для кожного завдання (виконуй СТРОГО в цьому порядку):\n' +
          `  1. Склади правильне, природне речення мовою ${L.targetName} (4–7 слів) відповідно до рівня ${level}\n` +
          '  2. Обери ОДНЕ слово для навмисної помилки — воно має відповідати одному з 5 типів нижче\n' +
          '  3. Заміни його ОДНИМ неправильним словом ТІЄї САМОЇ граматичної категорії (артикль→артикль, прийменник→прийменник, форма дієслова→форма дієслова)\n' +
          '  4. Перевір ДВА умови: (A) words[] з помилкою — очевидно граматично неправильне; (B) words[] з correctWord — бездоганно правильне\n' +
          '  5. Склади fixOptions: correctWord + 2 хибних тієї самої граматичної категорії\n' +
          `\nГраматичні помилки мають відповідати рівню ${level} (не вводь конструкції вищого рівня).\n` +
          errorTypes +
          (isLow ? `РІВЕНЬ A1/A2: уникай складних часів — лише найпростіші форми у ${L.targetName}.\n` : '') +
          '\nПоля ОБОВ\'ЯЗКОВІ: words (масив слів без пунктуації), errorIdx (0-based),\n' +
          'correctWord, fixOptions (рівно 3: correctWord + 2 хибних),\n' +
          `uk — ТІЛЬКИ переклад мовою ${L.uiLanguage}, без жодних інших мов у дужках.\n` +
          (L.helper.id !== 'none' ? `en — ТІЛЬКИ переклад мовою ${L.helper.nameEn}, ОКРЕМО від поля uk.\n` : '') +
          'КРИТИЧНО: words[errorIdx] ≠ correctWord; correctWord присутній серед fixOptions.\n' +
          'КРИТИЧНО: correctWord та жодна його однокоренева форма НЕ з\'являється в words[] ніде крім позиції errorIdx.\n' +
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
          `\nКожне завдання: source (вихідна фраза або речення), tokens (перемішані слова результату), correctSentence, uk, ukExplain, explain.\n` +
          `КРИТИЧНО ВАЖЛИВО: source ЗАВЖДИ ТІЛЬКИ мовою ${L.targetName}. Ніколи не використовуй іншу мову для source.\n` +
          `Складність трансформацій має строго відповідати рівню ${level}.\n` +
          'ОБОВ\'ЯЗКОВО: щонайменше 3 з 5 завдань мають бути усталеними виразами/колокаціями рівня.\n' +
          'ОБОВ\'ЯЗКОВО: correctSentence коротке — максимум 5 слів.\n' +
          'tokens мають складати correctSentence без зайвих слів і без розділових знаків.\n' +
          'uk — простий переклад фрази українською.\n' +
          'ukExplain — коротке тлумачення значення фрази українською (1 речення).\n' +
          (L.helper.id !== 'none' ? `Додай en мовою ${L.helper.nameEn}.\n` : '') +
          'JSON only:\n' +
          (L.helper.id !== 'none'
            ? '{"tasks":[{"source":"...","tokens":["..."],"correctSentence":"...","uk":"...","ukExplain":"...","en":"...","explain":"7–12 слів"}]}'
            : '{"tasks":[{"source":"...","tokens":["..."],"correctSentence":"...","uk":"...","ukExplain":"...","explain":"7–12 слів"}]}'
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
