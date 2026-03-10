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

    // ─── ТЕМИ ────────────────────────────────────────────────────────────────────
    themes: [
        { value: 'Travel',      label: '✈️ Подорожі'             },
        { value: 'Office',      label: '💼 Офіс'                 },
        { value: 'Restaurant',  label: '🍽️ Ресторан'             },
        { value: 'SmallTalk',   label: '💬 Small Talk'           },
        { value: 'Family',      label: "👨‍👩‍👧 Сім'я"             },
        { value: 'Shopping',    label: '🛍️ Шопінг'              },
        { value: 'Health',      label: "🏥 Здоров'я"            },
        { value: 'Emergencies', label: '🚨 Надзвичайні ситуації' },
    ],

    // ─── РІВНІ ───────────────────────────────────────────────────────────────────
    levels: [
        { value: 'A1', label: 'A1 — Елементарний',     wordCount: 6               },
        { value: 'A2', label: 'A2 — Початковий',       wordCount: 10              },
        { value: 'B1', label: 'B1 — Середній',         wordCount: 17, default: true },
        { value: 'B2', label: 'B2 — Вище середнього',  wordCount: 25              },
        { value: 'C1', label: 'C1 — Просунутий',       wordCount: 35              },
    ],

    // ─── ПРОФІЛІ РІВНІВ ДЛЯ AI-ПРОМПТУ ─────────────────────────────────────────
    // Використовується при генерації завдань — передається в системний промпт
    // щоб AI підлаштовував складність лексики, граматики та стиль мовлення для TTS
    levelProfiles: {
        A1: {
            ttsHint:    'дуже повільно, чітко, з паузами між словами',
            lexicon:    'тільки найпростіші слова: ser, estar, tener, ir, querer, числа, кольори, привітання',
            grammar:    'лише presente indicativo, прості ствердні речення',
            sentences:  'одне просте речення 4-6 слів',
        },
        A2: {
            ttsHint:    'повільно, чітка артикуляція',
            lexicon:    'базова лексика побутових тем, frecuentemente використовувані дієслова',
            grammar:    'presente, indefinido, прості питання та заперечення',
            sentences:  '1-2 короткі речення, прості сполучники y/pero/porque',
        },
        B1: {
            ttsHint:    'помірний темп, природна артикуляція',
            lexicon:    'розмовна лексика середнього рівня, деякі ідіоми',
            grammar:    'усі основні часи, subjuntivo в простих випадках',
            sentences:  '2-3 речення середньої довжини з підрядними',
        },
        B2: {
            ttsHint:    'близький до природного темпу носія',
            lexicon:    'вільна розмовна лексика, ідіоми, фразові дієслова',
            grammar:    'складні часові форми, умовний спосіб, subjuntivo вільно',
            sentences:  '3-4 речення, складні конструкції',
        },
        C1: {
            ttsHint:    'природний темп носія, розмовні редукції',
            lexicon:    'багата лексика, ідіоматичні вирази, розмовний стиль',
            grammar:    'весь граматичний спектр, стилістичні варіації',
            sentences:  '4-6 речень, природний розмовний потік',
        },
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
