// ============================================================
//  sett_set.js — Конфігурація налаштувань Spanish AI Hub
//  Цей файл містить усі дані та константи для settings.html
// ============================================================

// ── Файлові API-ключі (пріоритетні) ─────────────────────────
// Якщо вписати ключ тут — він використовується замість ключа
// збереженого в браузері. Зручно для домашнього роутера де
// ти єдиний користувач: вводити ключ у браузері не потрібно.
// Якщо поле порожнє — береться ключ з localStorage (як раніше).
const HARDCODED_KEYS = {
    openai:    '',   // напр. 'sk-proj-...'
    google:    '',   // напр. 'AIzaSy...'
    anthropic: '',   // напр. 'sk-ant-...'
};

const SETTINGS_CONFIG = {

    // ── Базовий рівень складності для всіх вправ ───────────
    // Єдине джерело дефолтного CEFR-рівня (A1–C1) у всіх модулях.
    defaultExerciseLevel: 'B1',

    // ── Глобальні пріоритетні теми для AI-промптів ──────────
    // Використовувати у вправах як єдине джерело тематик.
    // Це дає однаковий набір тем для всіх модулів.
    priorityThemes: [
        { value: 'Travel',         label: '✈️ Подорожі'                  },
        { value: 'Office',         label: '💼 Офіс / Робота'             },
        { value: 'Restaurant',     label: '🍽️ Ресторан / Кафе'           },
        { value: 'SmallTalk',      label: '💬 Small Talk'                },
        { value: 'Family',         label: "👨‍👩‍👧 Сім'я"                  },
        { value: 'Shopping',       label: '🛍️ Шопінг / Магазини'        },
        { value: 'Health',         label: "🏥 Здоров'я / Медицина"       },
        { value: 'Emergencies',    label: '🚨 Надзвичайні ситуації'      },
        { value: 'Sport',          label: '⚽ Спорт / Фітнес'            },
        { value: 'Education',      label: '📚 Навчання / Освіта'         },
        { value: 'Technology',     label: '💻 Технології / Гаджети'      },
        { value: 'Nature',         label: '🌿 Природа / Екологія'        },
        { value: 'Entertainment',  label: '🎬 Розваги / Кіно / Музика'   },
        { value: 'Food',           label: '🍕 Їжа / Кулінарія'          },
        { value: 'Transport',      label: '🚌 Транспорт / Дорога'        },
        { value: 'Home',           label: '🏠 Дім / Побут'              },
        { value: 'Hobbies',        label: '🎨 Хобі / Дозвілля'          },
        { value: 'Culture',        label: '🎭 Культура / Традиції'       },
        { value: 'Finance',        label: '💰 Фінанси / Гроші'           },
        { value: 'SocialMedia',    label: '📱 Соцмережі / Інтернет'      },
    ],

    // ── Глобальні рівні CEFR для всіх вправ ─────────────────
    // Єдине джерело переліку рівнів у всіх модулях.
    exerciseLevels: [
        { value: 'A1', label: 'A1 — Початківець'       },
        { value: 'A2', label: 'A2 — Елементарний'      },
        { value: 'B1', label: 'B1 — Середній'          },
        { value: 'B2', label: 'B2 — Вище середнього'   },
        { value: 'C1', label: 'C1 — Просунутий'        },
    ],

    // Режим теми для модуля граматики за замовчуванням:
    // 'random' — випадкова тема, якщо користувач не обрав вручну.
    grammarThemeDefaultMode: 'random',

    // ── Провайдери ШІ ────────────────────────────────────────
    providers: [
        { id: 'openai',    label: 'OpenAI (ChatGPT)',   icon: 'fa-robot' },
        { id: 'google',    label: 'Google Gemini',       icon: 'fa-google' },
        { id: 'anthropic', label: 'Anthropic Claude',    icon: 'fa-brain'  }
    ],

    // ── Моделі для кожного провайдера ────────────────────────
    models: {
        openai: [
            { id: 'gpt-4o',      name: 'GPT-4o (Найпотужніша)' },
            { id: 'gpt-4o-mini', name: 'GPT-4o-mini (Швидка)'  }
        ],
        google: [
            { id: 'gemini-2.5-flash',              name: 'Gemini 2.5 Flash'              },
            { id: 'gemini-3-flash-preview',         name: 'Gemini 3 Flash Preview'         },
            { id: 'gemini-3.1-flash-lite-preview',  name: 'Gemini 3.1 Flash Lite Preview'  }
        ],
        anthropic: [
            { id: 'claude-sonnet-4-6',          name: 'Claude Sonnet 4.6 (Найпотужніша)' },
            { id: 'claude-haiku-4-5-20251001',  name: 'Claude Haiku 4.5 (Швидка)'        }
        ]
    },

    // ── Онлайн-голоси для кожного провайдера ─────────────────
    onlineVoices: {
        openai: {
            desc: 'Преміум OpenAI TTS',
            list: [
                { id: 'alloy',   name: 'Alloy',   icon: 'fa-person'       },
                { id: 'shimmer', name: 'Shimmer',  icon: 'fa-person-dress' }
            ]
        },
        google: {
            desc: 'Рідна озвучка Gemini',
            list: [
                { id: 'Puck',   name: 'Puck',   icon: 'fa-robot'          },
                { id: 'Charon', name: 'Charon',  icon: 'fa-user-astronaut' }
            ]
        },
        anthropic: {
            desc: 'Claude Optimized',
            list: [
                { id: 'claude-soft', name: 'Soft', icon: 'fa-feather' }
            ]
        }
    },

    // ── Налаштування швидкості мовлення ──────────────────────
    speed: {
        min:     0.5,
        max:     1.5,
        step:    0.1,
        default: 0.9
    },

    // ── Мови ─────────────────────────────────────────────────
    languages: {

        // Мова, яку вивчають (target language)
        target: [
            { id: 'es', label: 'Іспанська',    flag: '🇪🇸', bcp47: 'es-ES', nameEn: 'Spanish',    nameNative: 'Español'    },
            { id: 'en', label: 'Англійська',   flag: '🇬🇧', bcp47: 'en-GB', nameEn: 'English',    nameNative: 'English'    },
            { id: 'fr', label: 'Французька',   flag: '🇫🇷', bcp47: 'fr-FR', nameEn: 'French',     nameNative: 'Français'   },
            { id: 'de', label: 'Німецька',     flag: '🇩🇪', bcp47: 'de-DE', nameEn: 'German',     nameNative: 'Deutsch'    },
            { id: 'it', label: 'Італійська',   flag: '🇮🇹', bcp47: 'it-IT', nameEn: 'Italian',    nameNative: 'Italiano'   },
            { id: 'pl', label: 'Польська',     flag: '🇵🇱', bcp47: 'pl-PL', nameEn: 'Polish',     nameNative: 'Polski'     },
            { id: 'pt', label: 'Португальська',flag: '🇵🇹', bcp47: 'pt-PT', nameEn: 'Portuguese', nameNative: 'Português'  },
            { id: 'la', label: 'Латинська',    flag: '🏛️', bcp47: 'la',    nameEn: 'Latin',      nameNative: 'Latina'     },
        ],

        // Рідна мова інтерфейсу (мова пояснень, фідбеку, перекладів)
        native: [
            { id: 'uk', label: 'Українська',  nameEn: 'Ukrainian' },
            { id: 'en', label: 'English',     nameEn: 'English'   },
            { id: 'pl', label: 'Polski',      nameEn: 'Polish'    },
        ],

        // Допоміжна мова (додаткові підказки у промптах)
        helper: [
            { id: 'none', label: 'Без допоміжної', flag: '',   nameEn: '' },
            { id: 'en',   label: 'English',        flag: '🇬🇧', nameEn: 'English'   },
            { id: 'uk',   label: 'Українська',     flag: '🇺🇦', nameEn: 'Ukrainian' },
            { id: 'la',   label: 'Latina',         flag: '🏛️', nameEn: 'Latin'     },
        ],
    },

    // ── Ключі localStorage ───────────────────────────────────
    storageKeys: {
        provider:     'sp_provider',
        model:        'sp_model',
        apiKeyOpenai: 'sp_api_key_openai',
        apiKeyGoogle: 'sp_api_key_google',
        apiKeyAnthro: 'sp_api_key_anthropic',
        speed:        'sp_speed',
        ttsMode:      'sp_tts_mode',
        voice:        'sp_voice',
        voiceNative:  'sp_voice_native',

        // ── Мови ───────────────────────────────────────────
        targetLang:  'sp_target_lang',   // id мови навчання, дефолт: 'es'
        nativeLang:  'sp_native_lang',   // id рідної мови,   дефолт: 'uk'
        helperLang:  'sp_helper_lang',   // id допоміжної,    дефолт: 'none'

        // ── Логування ──────────────────────────────────────
        techLogEnabled:  'sp_techlog_enabled',   // '1' | '0'
        studyLogEnabled: 'sp_studylog_enabled',  // '1' | '0'
        logServerUrl:    'sp_log_server_url',    // URL сервера, напр. 'http://localhost:3030'
    },

    // ── Плейсхолдери для полів API-ключів ────────────────────
    apiPlaceholders: {
        openai:    'sk-...',
        google:    'AIzaSy...',
        anthropic: 'sk-ant-...'
    },

    // ── Мінімальна довжина ключа для валідації ───────────────
    minKeyLength: 5,

    // ── Затримки (мс) ────────────────────────────────────────
    toastDuration:    2500,
    redirectDelay:    1500,
    toastFadeOut:      500,

    // ── URL для повернення назад ─────────────────────────────
    backUrl: 'index.html',

    // ── Конфігурація логування ───────────────────────────────
    logging: {

        // Локальний сервер-приймач логів (опціонально).
        // Якщо порожній або недоступний — логи зберігаються тільки в localStorage.
        // Формат: 'http://localhost:3030'
        defaultServerUrl: 'https://tst-log.keensl.keenetic.pro',

        // Максимальна кількість рядків у буфері localStorage
        // перед авто-скиданням у файл (або пропозицією завантажити)
        bufferMaxLines: 500,

        // ── Техлог ─────────────────────────────────────────
        techLog: {
            storageKey:  'sp_techlog_buffer',   // ключ буфера в localStorage
            folder:      'techlog',             // папка на сервері
            // Назва файлу: <module>+ДД.ММ.txt  (напр. phone+10.06.txt)
            // Поля рядка (через TAB):
            // timestamp  module  level  event_type  description  [extra_json]
            fields:   ['timestamp', 'module', 'level', 'event_type', 'description', 'extra'],
            separator: '\t',
        },

        // ── Навчальний лог ─────────────────────────────────
        studyLog: {
            storageKey:  'sp_studylog_buffer',  // ключ буфера в localStorage
            folder:      'studylog',
            // Назва файлу: <module>+ДД.ММ.txt  (напр. listening+10.06.txt)
            // Поля рядка (через TAB):
            // timestamp  module  exercise_type  level  theme
            // result(correct|wrong|skip)  score_total  score_max
            // time_spent_sec  attempt_number
            // wrong_answer  correct_answer  explanation_shown(0|1)
            // transcript_shown(0|1)  slow_mode_used(0|1)  tts_replays
            // task_text  answer_text  ai_feedback_text
            // session_id
            fields: [
                'timestamp', 'module', 'exercise_type', 'level', 'theme',
                'result', 'score_total', 'score_max',
                'time_spent_sec', 'attempt_number',
                'wrong_answer', 'correct_answer',
                'explanation_shown', 'transcript_shown', 'slow_mode_used', 'tts_replays',
                'task_text', 'answer_text', 'ai_feedback_text',
                'session_id'
            ],
            separator: '\t',
        }
    }
};

// ── Глобальна функція отримання API-ключа ───────────────────
// Використовувати у всіх модулях замість прямого localStorage.
// Пріоритет: 1) HARDCODED_KEYS (файл) → 2) localStorage (браузер)
function getApiKey(provider) {
    const hardcoded = (HARDCODED_KEYS[provider] || '').trim();
    if (hardcoded) return hardcoded;

    const storageKeyMap = {
        openai:    SETTINGS_CONFIG.storageKeys.apiKeyOpenai,
        google:    SETTINGS_CONFIG.storageKeys.apiKeyGoogle,
        anthropic: SETTINGS_CONFIG.storageKeys.apiKeyAnthro,
    };
    const lsKey = storageKeyMap[provider] || `sp_api_key_${provider}`;
    return (localStorage.getItem(lsKey) || '').trim();
}

// ── Перевірка: чи ключ провайдера захардкоджений у файлі ────
function isKeyHardcoded(provider) {
    return !!(HARDCODED_KEYS[provider] || '').trim();
}


// ── Глобальна функція отримання пріоритетних тем ─────────────
// Повертає єдиний список тем для всіх вправ з безпечним fallback.
function getPriorityThemes() {
    const themes = Array.isArray(SETTINGS_CONFIG?.priorityThemes)
        ? SETTINGS_CONFIG.priorityThemes
        : [];

    if (themes.length) return themes;

    return [
        { value: 'Travel',         label: '✈️ Подорожі'                  },
        { value: 'Office',         label: '💼 Офіс / Робота'             },
        { value: 'Restaurant',     label: '🍽️ Ресторан / Кафе'           },
        { value: 'SmallTalk',      label: '💬 Small Talk'                },
        { value: 'Family',         label: "👨‍👩‍👧 Сім'я"                  },
        { value: 'Shopping',       label: '🛍️ Шопінг / Магазини'        },
        { value: 'Health',         label: "🏥 Здоров'я / Медицина"       },
        { value: 'Emergencies',    label: '🚨 Надзвичайні ситуації'      },
        { value: 'Sport',          label: '⚽ Спорт / Фітнес'            },
        { value: 'Education',      label: '📚 Навчання / Освіта'         },
        { value: 'Technology',     label: '💻 Технології / Гаджети'      },
        { value: 'Nature',         label: '🌿 Природа / Екологія'        },
        { value: 'Entertainment',  label: '🎬 Розваги / Кіно / Музика'   },
        { value: 'Food',           label: '🍕 Їжа / Кулінарія'          },
        { value: 'Transport',      label: '🚌 Транспорт / Дорога'        },
        { value: 'Home',           label: '🏠 Дім / Побут'              },
        { value: 'Hobbies',        label: '🎨 Хобі / Дозвілля'          },
        { value: 'Culture',        label: '🎭 Культура / Традиції'       },
        { value: 'Finance',        label: '💰 Фінанси / Гроші'           },
        { value: 'SocialMedia',    label: '📱 Соцмережі / Інтернет'      },
    ];
}

// ── Глобальна функція отримання мовної конфігурації ─────────
// Використовувати у всіх модулях для отримання поточних мов.
// Повертає об'єкт з даними про мову навчання, рідну та допоміжну,
// а також готові рядки для AI-промптів.
function getLangConfig() {
    const SK    = SETTINGS_CONFIG.storageKeys;
    const langs = SETTINGS_CONFIG.languages;

    const targetId = (localStorage.getItem(SK.targetLang) || 'es').trim();
    const nativeId = (localStorage.getItem(SK.nativeLang) || 'uk').trim();
    const helperId = (localStorage.getItem(SK.helperLang) || 'none').trim();

    const target = langs.target.find(l => l.id === targetId) || langs.target[0];
    const native = langs.native.find(l => l.id === nativeId) || langs.native[0];
    const helper = langs.helper.find(l => l.id === helperId) || langs.helper[0];

    // Готовий рядок для вставки в промпт — пояснює роль допоміжної мови
    const helperClause = (helper.id !== 'none' && helper.nameEn)
        ? ` The learner knows ${helper.nameEn} well — use it as a linguistic bridge where helpful: draw parallels, cognates, or structural similarities between ${helper.nameEn} and ${target.nameEn} to aid comprehension.`
        : '';

    return {
        target,                 // { id, label, flag, bcp47, nameEn, nameNative }
        native,                 // { id, label, nameEn }
        helper,                 // { id, label, nameEn }
        // Готові рядки для промптів — використовуй у *_set.js:
        teacherRole:  `professional ${target.nameEn} teacher`,
        targetName:   target.nameEn,        // 'Spanish'
        targetNative: target.nameNative,    // 'Español'
        uiLanguage:   native.nameEn,        // 'Ukrainian'
        helperClause,                       // ' When needed, add brief hints in English.'
        speechLang:   target.bcp47,         // 'es-ES'
    };
}


// ── Глобальна функція режиму теми для grammar-модуля ─────────
function getGrammarThemeDefaultMode() {
    const mode = (SETTINGS_CONFIG && SETTINGS_CONFIG.grammarThemeDefaultMode) || 'random';
    return mode === 'manual' ? 'manual' : 'random';
}


// ── Глобальна функція отримання переліку рівнів ─────────────
// Повертає масив { value, label } для заповнення <select> у вправах.
// Якщо allowedLevels вказано — фільтрує лише допустимі рівні.
function getExerciseLevels(allowedLevels) {
    const all = Array.isArray(SETTINGS_CONFIG?.exerciseLevels) && SETTINGS_CONFIG.exerciseLevels.length
        ? SETTINGS_CONFIG.exerciseLevels
        : [
            { value: 'A1', label: 'A1 — Початківець'       },
            { value: 'A2', label: 'A2 — Елементарний'      },
            { value: 'B1', label: 'B1 — Середній'          },
            { value: 'B2', label: 'B2 — Вище середнього'   },
            { value: 'C1', label: 'C1 — Просунутий'        },
        ];
    if (!allowedLevels || !allowedLevels.length) return all;
    return all.filter(l => allowedLevels.includes(l.value));
}


// ── Глобальна функція дефолтного рівня для вправ ───────────
// Повертає CEFR-рівень з sett_set.js, з перевіркою допустимих
// значень для конкретного модуля (allowedLevels).
function getDefaultExerciseLevel(allowedLevels = ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const valid = Array.isArray(allowedLevels) && allowedLevels.length
        ? allowedLevels
        : ['A1', 'A2', 'B1', 'B2', 'C1'];

    const configured = String(SETTINGS_CONFIG?.defaultExerciseLevel || '').trim().toUpperCase();
    if (valid.includes(configured)) return configured;

    if (valid.includes('B1')) return 'B1';
    return valid[0];
}
