// ============================================================
//  chat_set.js — Конфігурація модуля «Вільний чат»
//  Spanish AI Hub
//  Підключати після sett_set.js
// ============================================================

const CHAT_CONFIG = {

    // ── Аспекти: кількість питань у тесті на кожен ───────────
    aspects: [
        { id: 'grammar',    questions: 7 },
        { id: 'vocabulary', questions: 7 },
        { id: 'listening',  questions: 5 },
        { id: 'reading',    questions: 3 },
        { id: 'writing',    questions: 5 },
        { id: 'speaking',   questions: 5 },
        { id: 'pragmatics', questions: 3 },
    ],

    // ── Параметри тесту ───────────────────────────────────────
    test: {
        feedbackDelay: 2000,  // мс перед переходом до наступного питання

        // Додаткові інструкції для генератора питань — за типом аспекту
        // Мова береться динамічно з getLangConfig()
        get aspectExtras() {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian' };
            return {
                listening:  `Add audio_text field (${L.targetName} phrase for TTS). Question asks what was said or heard.`,
                reading:    `Add passage field: short ${L.targetName} text 3-5 sentences. All questions for this aspect share the same passage.`,
                speaking:   `Ask learner to say a sentence in ${L.targetName}. options: null.`,
                writing:    `Ask learner to write 1-2 sentences freely in ${L.targetName}. options: null.`,
                pragmatics: `Focus on register, politeness and situational appropriateness in ${L.targetName}. Use multiple choice.`,
            };
        },

        // Ліміти токенів
        maxTokensGenerate: 3000,
        maxTokensEvaluate: 400,
        maxTokensReport:   500,
    },

    // ── Параметри сесії (урок / чат) ─────────────────────────
    session: {
        maxTokensInit:  1000,
        maxTokensReply: 1000,
    },

    // ── Маркери блоку корекції (режим «Чат») ─────────────────
    // Увага: рядки містять дефіси — при побудові RegExp у chat.html
    // їх потрібно екранувати: s => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,'\\$&')
    correctionMarkers: {
        open:  '---КОРЕКЦІЯ---',
        close: '---КІНЕЦЬ---',
    },

    // ── Native Audio Dialog (Gemini Live API) ─────────────────
    // Активується тоглом у setup-екрані режиму «Вільне спілкування»
    // тільки якщо provider === 'google'
    nad: {
        // ── Gemini Live (Google) ─────────────────────────────
        gemini: {
            model:            'gemini-2.5-flash-native-audio-preview-12-2025',
            // model:         'gemini-2.0-flash-live-001',  // ← альтернатива
            voices:           ['Charon', 'Puck'],
            inputSampleRate:  16000,
            outputSampleRate: 24000,
        },

        // ── OpenAI Realtime API ──────────────────────────────
        openai: {
            model:            'gpt-4o-realtime-preview',
            voices:           ['alloy', 'shimmer', 'echo'],
            inputSampleRate:  24000,
            outputSampleRate: 24000,
        },

        sessionMaxMin: 10,   // ліміт сесії в хвилинах

        // ── UI-параметри ─────────────────────────────────────
        // true  → показувати перемикач NAD на екрані налаштувань сесії
        // false → NAD прихований
        showToggle: true,

        // Режим запису аудіо:
        //   'auto'   → запис стартує автоматично при старті NAD-сесії
        //   'button' → показується кнопка ручного запуску/зупинки
        //   'off'    → запис вимкнено
        recordingMode: 'auto',
    },

};

// ============================================================
//  ПРОМПТИ
// ============================================================

const CHAT_PROMPTS = {

    get baseRole() {
        const L = (typeof getLangConfig === 'function') ? getLangConfig() : { teacherRole: 'professional Spanish teacher' };
        return `Ти — ${L.teacherRole}. Твоє мовлення чітке, лаконічне, дружнє.`;
    },

    // ── Режим «Вільний урок» ──────────────────────────────────
    lesson: {
        // @param level {string} — середній CEFR рівень діапазону (sessLevel), напр. "B1"
        // @param fileContent {string} — необов'язковий текст файлу прогресу учня
        system: (level, fileContent = '') => {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian', helperClause: '' };
            const fileCtx = fileContent
                ? `\n\nФайл прогресу учня:\n---\n${fileContent.slice(0, 2000)}\n---\nВрахуй ці дані при виборі теми.`
                : '';
            return (
                `Ти вчитель ${L.targetName}. Рівень учня: ${level}. Режим: ВІЛЬНИЙ УРОК.` + fileCtx +
                `\nОбери актуальну граматичну або лексичну тему відповідно до рівня ${level} і веди структурований урок:\n` +
                `  1. Привітання та оголошення теми\n` +
                `  2. Коротке пояснення правила (мовою ${L.uiLanguage})\n` +
                `  3. 3-4 приклади мовою ${L.targetName} з перекладом\n` +
                `  4. Коротка практична вправа для учня\n` +
                `Пиши мовою ${L.uiLanguage}; приклади ${L.targetName} виділяй лапками.${L.helperClause} Починай одразу.`
            );
        },
    },

    // ── Режим «Вільне спілкування» ────────────────────────────
    chat: {
        // @param level {string} — середній CEFR рівень діапазону (sessLevel), напр. "B1"
        // @param topic {string} — необов'язкова тема розмови
        system: (level, topic = '') => {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian', helperClause: '' };
            const topicCtx = topic ? `\nТема розмови: "${topic}". Веди розмову саме на цю тему.` : '';

            const profile = {
                A1: { lexicon: 'тільки найпростіші слова (ser, estar, tener, ir, querer)', syntax: '1 коротке речення', hint: 'надзвичайно просто' },
                A2: { lexicon: 'базова лексика побутових тем, presente + indefinido', syntax: '1-2 короткі речення', hint: 'просто і чітко' },
                B1: { lexicon: 'розмовна лексика середнього рівня', syntax: '2-3 речення', hint: 'природньо але чітко' },
                B2: { lexicon: 'вільна розмовна лексика, ідіоми', syntax: '2-4 речення', hint: 'вільно і природньо' },
                C1: { lexicon: 'багата лексика, ідіоматичні вирази, розмовні скорочення', syntax: '3-5 речень', hint: 'як носій з носієм' },
            }[level] || { lexicon: 'розмовна лексика', syntax: '2-3 речення', hint: 'природньо' };

            return (
                `Ти носій ${L.targetName}, дружній співрозмовник. Рівень учня: ${level}.${topicCtx}\n\n` +
                `ПРОФІЛЬ МОВИ для ${level}: ${profile.hint}.\n` +
                `• Лексика: ${profile.lexicon}\n` +
                `• Довжина відповіді мовою ${L.targetName}: ${profile.syntax}\n\n` +
                `Режим: ВІЛЬНЕ СПІЛКУВАННЯ.\n` +
                `Правила:\n` +
                `1. Якщо це НЕ перше повідомлення — ЗАВЖДИ додай блок корекції попереднього повідомлення учня:\n` +
                `---КОРЕКЦІЯ---\n` +
                `{"has_errors":true|false,"corrections":[{"wrong":"фраза з помилкою","right":"виправлена фраза","note":"пояснення мовою ${L.uiLanguage}"}],"overall":"загальний коментар мовою ${L.uiLanguage}"}\n` +
                `---КІНЕЦЬ---\n` +
                `2. Потім відповідай мовою ${L.targetName} відповідно до профілю ${level} вище.\n\n` +
                `Якщо це перше повідомлення — починай першим: постав питання мовою ${L.targetName} (без блоку корекції).`
            );
        },
    },

    // ── Режим «Вільне спілкування» · Native Audio Dialog ─────
    // Використовується замість chat.system коли увімкнено NAD
    // Без структурованих маркерів — корекція органічна, вбудована в мовлення
    chatNAD: {
        // @param level {string} — CEFR рівень: A1|A2|B1|B2|C1
        // @param topic {string} — необов'язкова тема
        system: (level, topic = '') => {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian', helperClause: '' };
            const topicCtx = topic ? ` Тема розмови: "${topic}".` : '';

            // Профіль мовлення залежно від рівня
            const profile = {
                A1: {
                    pace:    'Говори ДУЖЕ повільно — як диктор на уроці для дітей. Між реченнями роби паузу.',
                    lexicon: 'Використовуй ТІЛЬКИ найпростіші слова: ser, estar, tener, querer, ir, hacer. Уникай будь-яких складних конструкцій.',
                    syntax:  'Максимум одне просте речення за раз. Ніяких підрядних речень.',
                    length:  '1 речення на відповідь.',
                },
                A2: {
                    pace:    'Говори повільно, з чіткою артикуляцією. Невелика пауза між реченнями.',
                    lexicon: 'Прості дієслова і базова лексика побутових тем. Можна presente та pretérito indefinido.',
                    syntax:  'Короткі речення, можна 1-2 прості сполучники (y, pero, porque).',
                    length:  '1-2 речення на відповідь.',
                },
                B1: {
                    pace:    'Помірний темп — трохи повільніше за природну розмову. Чітка артикуляція.',
                    lexicon: 'Розмовна лексика середнього рівня. Можна subjuntivo в простих випадках.',
                    syntax:  'Природні речення середньої довжини, сполучники, невеликі підрядні.',
                    length:  '2-3 речення на відповідь.',
                },
                B2: {
                    pace:    'Близький до природного темпу носія у неформальній розмові.',
                    lexicon: 'Вільна розмовна лексика, ідіоми, варіативні часові форми.',
                    syntax:  'Складніші речення, різноманітні конструкції, природні паузи.',
                    length:  '2-4 речення на відповідь.',
                },
                C1: {
                    pace:    'Природний темп носія — живо, вільно, з нормальними редукціями мовлення.',
                    lexicon: 'Багата лексика, ідіоматичні вирази, розмовні скорочення, емоційні забарвлення.',
                    syntax:  'Повністю природний синтаксис, еліпсис, незавершені речення як у живій мові.',
                    length:  '3-5 речень або стільки скільки природно.',
                },
            }[level] || {
                pace:    'Помірний природний темп.',
                lexicon: 'Розмовна лексика.',
                syntax:  'Природні речення.',
                length:  '2-3 речення.',
            };

            return (
                `Ти носій ${L.targetName}, дружній співрозмовник. Рівень учня: ${level}.${topicCtx}\n\n` +
                `МОВЛЕННЄВИЙ ПРОФІЛЬ ДЛЯ РІВНЯ ${level}:\n` +
                `• Темп: ${profile.pace}\n` +
                `• Лексика: ${profile.lexicon}\n` +
                `• Синтаксис: ${profile.syntax}\n` +
                `• Довжина відповіді: ${profile.length}\n\n` +
                `ПРАВИЛА:\n` +
                `1. Говори ТІЛЬКИ мовою ${L.targetName}.\n` +
                `2. Дотримуйся профілю вище суворо — це критично для навчання.\n` +
                `3. Якщо учень зробив граматичну помилку — природно повтори правильну форму у своїй наступній репліці без оголошень.\n` +
                `4. Учень говорить ${L.targetName} — розпізнавай його мовлення ЗАВЖДИ як ${L.targetName}, навіть якщо вимова недосконала.\n` +
                `5. Починай першим: постав питання відповідне до рівня ${level}.`
            );
        },
    },

    // ── Тест: генерація питань ────────────────────────────────
    testGenerate: {
        get system() {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish' };
            return `You are a ${L.targetName} placement test generator. Respond with valid JSON array only.`;
        },

        // @param aspectIds {string[]} — масив id аспектів
        // @param level {string} — діапазон CEFR (testLabel), напр. "A2-B2" або одиночний "B1"
        user: (aspectIds, level) => {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian' };
            const defs = aspectIds.map(id => {
                const a     = CHAT_CONFIG.aspects.find(x => x.id === id) || { questions: 5 };
                const extra = CHAT_CONFIG.test.aspectExtras[id] || 'Use multiple choice, 4 options.';
                return `- ${id}: ${a.questions} questions. ${extra}`;
            }).join('\n');

            const extraFields = [
                aspectIds.includes('listening') ? ', audio_text (string, only for listening)' : '',
                aspectIds.includes('reading')   ? ', passage (string, only for reading)'      : '',
            ].join('');

            const levelDesc = level.includes('-')
                ? `covering CEFR levels ${level} (mix difficulty across the range)`
                : `at CEFR level ${level}`;

            return (
                `Generate ${L.targetName} placement test ${levelDesc}.\n${defs}\n` +
                `Return ONLY valid JSON array. Each item must have: aspect, question (${L.uiLanguage}), ` +
                `options (4 strings or null), correct (string)${extraFields}. No markdown.`
            );
        },
    },

    // ── Тест: оцінка відкритої відповіді ─────────────────────
    testEvaluate: {
        get system() {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish' };
            return `${L.targetName} examiner. Respond with valid JSON only.`;
        },

        // @param question {string}, answer {string}, modelAnswer {string}, aspect {string}
        user: (question, answer, modelAnswer, aspect) => {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish', uiLanguage: 'Ukrainian' };
            return `Evaluate ${L.targetName} answer.\nAspect: ${aspect}\nQuestion: ${question}\n` +
                `Model answer: ${modelAnswer}\nLearner answer: "${answer}"\n` +
                `Respond ONLY JSON: {"score":0-10,"correct":true|false,"feedback":"${L.uiLanguage} 1-2 sentences","error_analysis":"brief"}`;
        },
    },

    // ── Тест: фінальний звіт CEFR ─────────────────────────────
    testReport: {
        get system() {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish' };
            return `${L.targetName} CEFR expert. Respond with valid JSON only.`;
        },

        // @param scores {Object} — { aspectId: number (0-10) }
        // @param answers {Object[]} — масив відповідей з полями q, ans, result
        user: (scores, answers) => {
            const L = (typeof getLangConfig === 'function') ? getLangConfig() : { targetName: 'Spanish' };
            const summary  = Object.entries(scores).map(([id, s]) => `${id}:${s}/10`).join(', ');
            const mistakes = answers
                .filter(a => !a.result.correct)
                .map(a => `${a.q.aspect}:${a.result.error_analysis}`)
                .join('; ');
            return (
                `${L.targetName} test scores: ${summary}\nMistakes: ${mistakes}\n` +
                `JSON only: {"cefr":"A1|A2|B1|B2|C1|C2","overall_score":0-100,` +
                `"weak_aspects":["id"],"strong_aspects":["id"],"recommendations":["...","...","..."]}`
            );
        },
    },
};

// Експорт для використання в HTML
if (typeof window !== 'undefined') {
    window.CHAT_CONFIG  = CHAT_CONFIG;
    window.CHAT_PROMPTS = CHAT_PROMPTS;
}
