/**
 * listen_set.js — Налаштування модуля "Аудіювання"
 * ─────────────────────────────────────────────────
 * Провайдери ШІ, моделі, API-ключі та режим TTS керуються глобально
 * через sett_set.js (localStorage-ключі з SETTINGS_CONFIG.storageKeys).
 * Цей файл містить лише параметри, специфічні для listening.html.
 *
 * ЗАЛЕЖНІСТЬ: підключати після sett_set.js:
 *   <script src="sett_set.js"></script>
 *   <script src="listen_set.js"></script>
 */

const LISTEN_CONFIG = {

    // Дефолтний CEFR-рівень береться централізовано з sett_set.js
    get defaultExerciseLevel() {
        return (typeof getDefaultExerciseLevel === 'function')
            ? getDefaultExerciseLevel(this.levels.map(l => l.value))
            : 'B1';
    },

    // ─── ТЕМИ ────────────────────────────────────────────────────────────────────
    // Беремо з глобальних налаштувань (sett_set.js), щоб усі модулі
    // працювали з єдиним списком пріоритетних тем.
    get themes() {
        if (typeof getPriorityThemes === 'function') return getPriorityThemes();
        return SETTINGS_CONFIG?.priorityThemes || [];
    },

    // ─── РІВНІ ───────────────────────────────────────────────────────────────────
    levels: [
        { value: 'A1', label: 'A1 — Елементарний',     wordCount: 6  },
        { value: 'A2', label: 'A2 — Початковий',       wordCount: 10 },
        { value: 'B1', label: 'B1 — Середній',         wordCount: 17 },
        { value: 'B2', label: 'B2 — Вище середнього',  wordCount: 25 },
        { value: 'C1', label: 'C1 — Просунутий',       wordCount: 35 },
    ],

    // ─── ПРОФІЛІ РІВНІВ ДЛЯ AI-ПРОМПТУ ─────────────────────────────────────────
    // Джерело: sett_set.js → SETTINGS_CONFIG.levelProfiles
    // Повертаємо сумісний формат для listening (ttsHint/lexicon/grammar/sentences).
    get levelProfiles() {
        const src = (typeof getExerciseLevelProfiles === 'function')
            ? getExerciseLevelProfiles()
            : {};
        return {
            A1: { ttsHint: src.A1?.pace || 'Дуже повільно й чітко', lexicon: src.A1?.lexicon || 'лише базова лексика', grammar: src.A1?.grammar || 'найпростіші граматичні форми', sentences: src.A1?.sentences || '1 речення 4–6 слів' },
            A2: { ttsHint: src.A2?.pace || 'Повільно й чітко', lexicon: src.A2?.lexicon || 'базова побутова лексика', grammar: src.A2?.grammar || 'прості форми теперішнього, минулого й майбутнього', sentences: src.A2?.sentences || '1–2 короткі речення по 5–8 слів' },
            B1: { ttsHint: src.B1?.pace || 'Помірний навчальний темп', lexicon: src.B1?.lexicon || 'розмовна лексика середнього рівня', grammar: src.B1?.grammar || 'основні часові й модальні форми', sentences: src.B1?.sentences || '2–3 речення по 7–11 слів' },
            B2: { ttsHint: src.B2?.pace || 'Майже природний темп', lexicon: src.B2?.lexicon || 'різноманітна лексика та сталі вирази', grammar: src.B2?.grammar || 'широкий набір граматичних структур', sentences: src.B2?.sentences || '3–4 речення по 10–15 слів' },
            C1: { ttsHint: src.C1?.pace || 'Природний темп носія', lexicon: src.C1?.lexicon || 'багата ідіоматична та абстрактна лексика', grammar: src.C1?.grammar || 'повний спектр граматики', sentences: src.C1?.sentences || '4–6 речень по 14–20 слів' },
        };
    },

    // ─── СЕСІЯ ───────────────────────────────────────────────────────────────────
    // Кількість завдань за одну сесію
    tasksPerSession: 5,

    // ─── СТИЛЬ ДІАЛОГІВ ──────────────────────────────────────────────────────────
    // Стиль мови у діалогах: 'informal' (Tú) | 'formal' (Usted)
    defaultPersonality: 'informal',

    // Складність зворотного зв'язку: 'easy' | 'mid' | 'strict'
    defaultStrictness: 'mid',

    // ─── AI ПРОМПТ ───────────────────────────────────────────────────────────────
    // Динамічно береться з getLangConfig() (sett_set.js) — НЕ хардкодити тут.
    // Використовуй: getLangConfig().uiLanguage  → 'Ukrainian'
    //               getLangConfig().teacherRole → 'professional Spanish teacher'

    // ─── TTS ПАРАМЕТРИ ───────────────────────────────────────────────────────────
    // Мова для Web Speech API (offline TTS) — динамічно з getLangConfig().speechLang
    // Залишаємо дефолт для зворотної сумісності якщо getLangConfig ще не завантажено
    get speechLang()  { return (typeof getLangConfig === 'function') ? getLangConfig().speechLang  : 'es-ES'; },
    get teacherRole() { return (typeof getLangConfig === 'function') ? getLangConfig().teacherRole : 'professional Spanish teacher'; },
    get uiLanguage()  { return (typeof getLangConfig === 'function') ? getLangConfig().uiLanguage  : 'Ukrainian (UA)'; },

    // Швидкість у "повільному" режимі (кнопка Повільно)
    slowSpeed: 0.6,

    // ─── ІНТЕРФЕЙС ───────────────────────────────────────────────────────────────
    // Затримка перед автовідтворенням (мс)
    autoPlayDelay: 800,

    // Сторінки навігації
    settingsPage: 'settings.html',
    homePage:     'index.html',

};
