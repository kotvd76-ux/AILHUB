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
    openai:       '',   // напр. 'sk-proj-...'
    google:       '',   // напр. 'AIzaSy...'
    anthropic:    '',   // напр. 'sk-ant-...'
    pollinations: '',   // напр. 'pk_...' — publishable key з enter.pollinations.ai
    azureKey:     '',   // напр. 'abc123...' — Azure Speech ключ
    azureRegion:  '',   // напр. 'eastus'   — Azure регіон (westeurope, eastus тощо)
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

    // ── Глобальні слова для генерації seed-контексту (noun + verb + theme) ──
    // Єдине джерело для всіх модулів. Використовувати через getSeedNouns/getSeedVerbs.
    seedNouns: ['людина', 'дитина', 'родина', 'тварина', 'річ', 'думка', 'мета', 'почуття', 'енергія', 'час'],
    seedVerbs: ['малювати', 'говорити', 'мати', 'хотіти', 'вчитися', 'робити', 'йти', 'брати', 'бачити', 'знати'],

    // ── Глобальні рівні CEFR для всіх вправ ─────────────────
    // Єдине джерело переліку рівнів у всіх модулях.
    exerciseLevels: [
        { value: 'A1', label: 'A1 — Початківець'       },
        { value: 'A2', label: 'A2 — Елементарний'      },
        { value: 'B1', label: 'B1 — Середній'          },
        { value: 'B2', label: 'B2 — Вище середнього'   },
        { value: 'C1', label: 'C1 — Просунутий'        },
    ],

    // ── Глобальні CEFR-профілі (єдине джерело для всіх модулів) ──
    // Використовувати через getExerciseLevelProfile(level).
    levelProfiles: {
        A1: {
            pace: 'Дуже повільно й чітко',
            lexicon: 'лише базова лексика',
            grammar: 'найпростіші граматичні форми',
            sentences: '1 речення 5–7 слів',
            constraints: 'без складних конструкцій',
        },
        A2: {
            pace: 'Повільно й чітко',
            lexicon: 'розповсюджена побутова лексика',
            grammar: 'прості форми теперішнього, минулого й майбутнього',
            sentences: '1–2 короткі речення по 5–8 слів',
            constraints: 'мінімум складних структур',
        },
        B1: {
            pace: 'Помірний навчальний темп',
            lexicon: 'розмовна лексика середнього рівня',
            grammar: 'основні часові й модальні форми',
            sentences: '2–3 речення по 7–11 слів',
            constraints: 'базові складнопідрядні',
        },
        B2: {
            pace: 'Майже природний темп',
            lexicon: 'різноманітна лексика та сталі вирази',
            grammar: 'широкий набір граматичних структур',
            sentences: '3–4 речення по 10–15 слів',
            constraints: 'аргументація й складні підрядні',
        },
        C1: {
            pace: 'Природний темп носія',
            lexicon: 'багата ідіоматична та абстрактна лексика',
            grammar: 'повний спектр граматики',
            sentences: '4–6 речень по 14–20 слів',
            constraints: 'складний синтаксис і точне нюансування',
        },
    },

    // Режим теми для модуля граматики за замовчуванням:
    // 'random' — випадкова тема, якщо користувач не обрав вручну.
    grammarThemeDefaultMode: 'random',

    // ── Провайдери ШІ ────────────────────────────────────────
    providers: [
        { id: 'openai',       label: 'OpenAI (ChatGPT)',    icon: 'fa-robot'  },
        { id: 'google',       label: 'Google Gemini',        icon: 'fa-google' },
        { id: 'anthropic',    label: 'Anthropic Claude',     icon: 'fa-brain'  },
        { id: 'pollinations', label: 'Pollinations.ai',      icon: 'fa-leaf'   },
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
        ],
        pollinations: [
            { id: 'openai',        name: 'OpenAI GPT-4o mini (дефолт)' },
            { id: 'openai-large',  name: 'OpenAI GPT-4o (велика)'      },
            { id: 'claude',        name: 'Claude Sonnet'                },
            { id: 'claude-large',  name: 'Claude Opus'                  },
            { id: 'gemini',        name: 'Gemini Flash'                 },
            { id: 'gemini-large',  name: 'Gemini Pro'                   },
            { id: 'deepseek',      name: 'DeepSeek V3'                  },
            { id: 'mistral',       name: 'Mistral'                      },
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
        },
        pollinations: {
            desc: 'Pollinations TTS (OpenAI-сумісний)',
            list: [
                { id: 'alloy',     name: 'Alloy',     icon: 'fa-person'        },
                { id: 'shimmer',   name: 'Shimmer',   icon: 'fa-person-dress'  },
                { id: 'nova',      name: 'Nova',      icon: 'fa-star'          },
                { id: 'echo',      name: 'Echo',      icon: 'fa-circle-dot'    },
                { id: 'fable',     name: 'Fable',     icon: 'fa-book'          },
                { id: 'onyx',      name: 'Onyx',      icon: 'fa-gem'           },
                { id: 'coral',     name: 'Coral',     icon: 'fa-fish'          },
                { id: 'sage',      name: 'Sage',      icon: 'fa-leaf'          },
                { id: 'rachel',    name: 'Rachel',    icon: 'fa-user'          },
                { id: 'bella',     name: 'Bella',     icon: 'fa-user'          },
                { id: 'dorothy',   name: 'Dorothy',   icon: 'fa-user'          },
                { id: 'sarah',     name: 'Sarah',     icon: 'fa-user'          },
            ]
        },
        azure: {
            desc: 'Azure Neural TTS — найбільш природній голос',
            list: [
                { id: 'es-ES-AlvaroNeural',   name: 'Alvaro (es-ES ♂)',  icon: 'fa-person'       },
                { id: 'es-ES-ElviraNeural',   name: 'Elvira (es-ES ♀)',  icon: 'fa-person-dress' },
                { id: 'es-MX-JorgeNeural',    name: 'Jorge (es-MX ♂)',   icon: 'fa-person'       },
                { id: 'es-MX-DaliaNeural',    name: 'Dalia (es-MX ♀)',   icon: 'fa-person-dress' },
                { id: 'en-US-JennyNeural',    name: 'Jenny (en-US ♀)',   icon: 'fa-person-dress' },
                { id: 'en-US-GuyNeural',      name: 'Guy (en-US ♂)',     icon: 'fa-person'       },
                { id: 'fr-FR-DeniseNeural',   name: 'Denise (fr-FR ♀)',  icon: 'fa-person-dress' },
                { id: 'de-DE-KatjaNeural',    name: 'Katja (de-DE ♀)',   icon: 'fa-person-dress' },
                { id: 'it-IT-ElsaNeural',     name: 'Elsa (it-IT ♀)',    icon: 'fa-person-dress' },
                { id: 'pt-PT-RaquelNeural',   name: 'Raquel (pt-PT ♀)',  icon: 'fa-person-dress' },
                { id: 'pl-PL-ZofiaNeural',    name: 'Zofia (pl-PL ♀)',   icon: 'fa-person-dress' },
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
        apiKeyHf:           'sp_api_key_hf',
        apiKeyPollinations:      'sp_api_key_pollinations',
        apiKeyOpenaiImg:         'sp_api_key_openai_img',
        apiKeyGoogleImg:         'sp_api_key_google_img',
        pollinationsImageModel:  'sp_pollinations_img_model',
        imageModel:   'sp_image_model',
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

        // ── Сервіс режим ───────────────────────────────────
        serviceMode:     'sp_service_mode',      // '1' | '0'

        // ── Azure Speech ────────────────────────────────────
        azureSpeechKey:    'sp_azure_speech_key',     // Azure Speech ключ
        azureSpeechRegion: 'sp_azure_speech_region',  // Azure регіон (eastus тощо)

        // ── Озвучка (TTS) — незалежний провайдер ────────────
        // 'openai' | 'azure' | 'pollinations' | 'offline'
        ttsProvider: 'sp_tts_provider',

        // ── AI Вимова (Pronunciation TTS) ───────────────────
        // 'same' | 'openai' | 'azure' | 'pollinations' | 'offline'
        // 'same' — використовує той самий ttsProvider
        pronunciationProvider: 'sp_pronunciation_provider',

        // ── Провайдер розпізнавання мовлення (Real-time STT) ─
        sttProvider: 'sp_stt_provider',  // 'openai'|'azure'|'gemini'
    },

    // ── Плейсхолдери для полів API-ключів ────────────────────
    apiPlaceholders: {
        openai:       'sk-...',
        google:       'AIzaSy...',
        anthropic:    'sk-ant-...',
        pollinations: 'pk_...',
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
        openai:       SETTINGS_CONFIG.storageKeys.apiKeyOpenai,
        google:       SETTINGS_CONFIG.storageKeys.apiKeyGoogle,
        anthropic:    SETTINGS_CONFIG.storageKeys.apiKeyAnthro,
        pollinations: SETTINGS_CONFIG.storageKeys.apiKeyPollinations,
        azure:        SETTINGS_CONFIG.storageKeys.azureSpeechKey,
    };
    const lsKey = storageKeyMap[provider] || `sp_api_key_${provider}`;
    return (localStorage.getItem(lsKey) || '').trim();
}

// ── Azure Speech конфігурація (ключ + регіон) ────────────────
// Пріоритет: 1) HARDCODED_KEYS → 2) localStorage
function getAzureSpeechConfig() {
    const hKey    = (HARDCODED_KEYS.azureKey    || '').trim();
    const hRegion = (HARDCODED_KEYS.azureRegion || '').trim();
    if (hKey) return { key: hKey, region: hRegion || 'eastus' };

    const SK = SETTINGS_CONFIG.storageKeys;
    const key    = (localStorage.getItem(SK.azureSpeechKey)    || '').trim();
    const region = (localStorage.getItem(SK.azureSpeechRegion) || 'eastus').trim();
    return { key, region };
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

// ── Глобальні слова для генерації seed-контексту ─────────────
// Повертають єдиний список іменників/дієслів для всіх модулів.
function getSeedNouns() {
    return Array.isArray(SETTINGS_CONFIG?.seedNouns) ? SETTINGS_CONFIG.seedNouns : [];
}
function getSeedVerbs() {
    return Array.isArray(SETTINGS_CONFIG?.seedVerbs) ? SETTINGS_CONFIG.seedVerbs : [];
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

// ── Глобальні CEFR-профілі (єдине джерело для модулів) ─────────
// Повертає об'єкт профілів за рівнями A1–C1.
function getExerciseLevelProfiles() {
    const fallback = {
        A1: { pace: 'Дуже повільно й чітко', lexicon: 'лише базова лексика', grammar: 'найпростіші граматичні форми', sentences: '1 речення 4–6 слів', constraints: 'без складних конструкцій' },
        A2: { pace: 'Повільно й чітко', lexicon: 'базова побутова лексика', grammar: 'прості форми теперішнього, минулого й майбутнього', sentences: '1–2 короткі речення по 5–8 слів', constraints: 'мінімум складних структур' },
        B1: { pace: 'Помірний навчальний темп', lexicon: 'розмовна лексика середнього рівня', grammar: 'основні часові й модальні форми', sentences: '2–3 речення по 7–11 слів', constraints: 'базові складнопідрядні' },
        B2: { pace: 'Майже природний темп', lexicon: 'різноманітна лексика та сталі вирази', grammar: 'широкий набір граматичних структур', sentences: '3–4 речення по 10–15 слів', constraints: 'аргументація й складні підрядні' },
        C1: { pace: 'Природний темп носія', lexicon: 'багата ідіоматична та абстрактна лексика', grammar: 'повний спектр граматики', sentences: '4–6 речень по 14–20 слів', constraints: 'складний синтаксис і точне нюансування' },
    };
    return SETTINGS_CONFIG?.levelProfiles || fallback;
}

// Повертає профіль для конкретного CEFR-рівня.
function getExerciseLevelProfile(level = 'B1') {
    const profiles = getExerciseLevelProfiles();
    const key = String(level || 'B1').trim().toUpperCase();
    return profiles[key] || profiles.B1 || profiles.A2 || Object.values(profiles)[0];
}


// ── Очищення Markdown-розмітки перед TTS ────────────────────
// Видаляє службові символи Markdown, залишаючи розділові знаки
// (крапки, коми, питальники) — вони потрібні для правильної інтонації TTS.
// Використовувати ТІЛЬКИ перед передачею тексту в TTS, не для відображення.
function stripMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/(\*{1,3}|_{1,3})([\s\S]*?)\1/g, '$2')  // **bold**, *italic*, ***both***
        .replace(/^#{1,6}\s+/gm, '')                       // ## заголовки
        .replace(/```[\s\S]*?```/g, '')                    // ```code blocks```
        .replace(/`([^`]+)`/g, '$1')                       // `inline code`
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')           // [link](url) → text
        .replace(/^[\s]*[-*+]\s+/gm, '')                   // - bullet points
        .replace(/^\s*\d+\.\s+/gm, '')                     // 1. нумеровані списки
        .replace(/^>\s+/gm, '')                            // > цитати
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// ── Визначення мови тексту для TTS ──────────────────────────
// Кирилиця → рідна мова інтерфейсу (uk-UA або інша native).
// Все інше → мова навчання з getLangConfig().speechLang.
function detectSpeechLang(text) {
    if (/[\u0400-\u04FF]/.test(text)) {
        // Кирилиця — визначаємо рідну мову
        const nativeId = (localStorage.getItem(SETTINGS_CONFIG.storageKeys.nativeLang) || 'uk').trim();
        const nativeBcp47Map = { uk: 'uk-UA', en: 'en-US', pl: 'pl-PL' };
        return nativeBcp47Map[nativeId] || 'uk-UA';
    }
    return getLangConfig().speechLang; // мова навчання: 'es-ES', 'en-GB' тощо
}

// ── Вибір офлайн-голосу (єдине місце логіки) ─────────────────
// Повертає найкращий SpeechSynthesisVoice для заданої мови:
//   1. Збережений device-голос з налаштувань (SK.voiceNative)
//   2. Google-голос для мови
//   3. Будь-який голос для мови
//   4. null — браузерний дефолт
// voices — масив з window.speechSynthesis.getVoices()
// lang   — BCP-47 рядок, наприклад 'es-ES'
function selectOfflineVoice(voices, lang) {
    const SK        = SETTINGS_CONFIG.storageKeys;
    const savedId   = localStorage.getItem(SK.voiceNative);
    if (savedId) {
        const match = voices.find(v => v.name === savedId || v.voiceURI === savedId);
        if (match) return match;
    }
    const prefix = lang.split('-')[0];
    const google = voices.find(v => v.lang?.startsWith(prefix) && v.name.includes('Google'));
    return google || voices.find(v => v.lang?.startsWith(prefix)) || null;
}

// ── Глобальна функція озвучення тексту ──────────────────────
// Автоматично визначає мову, очищує Markdown.
// forceLang  — примусова мова (BCP-47), якщо відома заздалегідь.
// callbacks  — { onLoading, onStart, onEnd } — необов'язкові UI-хуки.
// speedOverride — замінює sp_speed з localStorage (для повільного режиму).
// Використовувати у всіх модулях замість локальних speak-функцій.
async function speakText(text, forceLang, { onLoading, onStart, onEnd, speedOverride } = {}) {
    if (!text) { console.warn('[speakText] text порожній'); return; }
    const clean    = stripMarkdown(text);
    if (!clean) { console.warn('[speakText] після stripMarkdown порожній'); return; }
    console.log('[speakText] text:', JSON.stringify(clean.slice(0,80)));
    const lang = forceLang || detectSpeechLang(clean);
    const SK   = SETTINGS_CONFIG.storageKeys;

    // ttsProvider — окремий від AI-провайдера (читаємо sp_tts_provider)
    // Fallback: якщо не задано — legacyфallback через старий sp_tts_mode + sp_provider
    const ttsProvider = localStorage.getItem(SK.ttsProvider) || (() => {
        const legacyMode = localStorage.getItem(SK.ttsMode);
        if (legacyMode === 'online') return localStorage.getItem(SK.provider) || 'openai';
        return 'offline';
    })();
    const provider = ttsProvider;  // alias для getApiKey()

    const speed  = speedOverride ?? (parseFloat(localStorage.getItem(SK.speed)) || SETTINGS_CONFIG.speed.default);
    const voice  = localStorage.getItem(SK.voice) || 'alloy';
    const apiKey = getApiKey(provider);

    // Online TTS — тільки для мови навчання (не для кирилиці)
    if (ttsProvider !== 'offline' && !/[Ѐ-ӿ]/.test(clean)) {

        // Azure Neural TTS (REST API — inline, без залежності від azure_speech_connector.js)
        if (provider === 'azure') {
            const { key: azKey, region: azRegion } = getAzureSpeechConfig();
            if (azKey && azRegion) {
                const voiceMap = {
                    es: 'es-ES-AlvaroNeural', en: 'en-US-JennyNeural',
                    fr: 'fr-FR-DeniseNeural', de: 'de-DE-KatjaNeural',
                    it: 'it-IT-ElsaNeural',   pt: 'pt-PT-RaquelNeural',
                    pl: 'pl-PL-ZofiaNeural',
                };
                const prefix  = lang.split('-')[0];
                const azVoice = (voice && voice.includes('Neural'))
                    ? voice
                    : (voiceMap[prefix] || 'es-ES-AlvaroNeural');

                const safeText = clean
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                const ratePct  = Math.round((speed - 1.0) * 100);
                const rateStr  = (ratePct >= 0 ? '+' : '') + ratePct + '%';
                const ssml = `<speak version='1.0' xml:lang='${lang}' xmlns='http://www.w3.org/2001/10/synthesis'>`
                           + `<voice name='${azVoice}'><prosody rate='${rateStr}'>${safeText}</prosody></voice></speak>`;

                if (onLoading) onLoading();
                try {
                    const r = await fetch(
                        `https://${azRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
                        {
                            method: 'POST',
                            headers: {
                                'Ocp-Apim-Subscription-Key': azKey,
                                'Content-Type':             'application/ssml+xml',
                                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                            },
                            body: ssml,
                        }
                    );
                    if (r.ok) {
                        const url   = URL.createObjectURL(await r.blob());
                        const audio = new Audio(url);
                        audio.onplay  = () => { if (onStart) onStart(); };
                        audio.onended = () => { URL.revokeObjectURL(url); if (onEnd) onEnd(); };
                        audio.play();
                        return;
                    }
                    const warnMsg = r.status === 401
                        ? '[speakText/azure] HTTP 401 — Azure ключ невірний або прострочений, перевір Налаштування'
                        : '[speakText/azure] HTTP ' + r.status;
                    console.warn(warnMsg);
                    if (typeof window.addLog === 'function') window.addLog(warnMsg, 'warn');
                } catch (e) { console.warn('[speakText/azure] fetch error:', e.message); }
            }
        }

        // OpenAI TTS
        if (provider === 'openai' && apiKey) {
            if (onLoading) onLoading();
            try {
                const r = await fetch('https://api.openai.com/v1/audio/speech', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'tts-1', voice, input: clean, speed: Math.max(0.25, Math.min(4, speed)) })
                });
                if (r.ok) {
                    const url = URL.createObjectURL(await r.blob());
                    const audio = new Audio(url);
                    audio.onplay  = () => { if (onStart) onStart(); };
                    audio.onended = () => { URL.revokeObjectURL(url); if (onEnd) onEnd(); };
                    audio.play();
                    return;
                }
            } catch (_) { /* fallback до offline */ }
        }

        // Pollinations TTS (OpenAI-сумісний, анонімний або з pk_ ключем)
        if (provider === 'pollinations') {
            if (onLoading) onLoading();
            try {
                const polKey = getApiKey('pollinations');
                const headers = { 'Content-Type': 'application/json' };
                if (polKey) headers['Authorization'] = 'Bearer ' + polKey;
                const r = await fetch('https://gen.pollinations.ai/v1/audio/speech', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        input: clean,
                        voice: voice || 'nova',
                        speed: Math.max(0.25, Math.min(4, speed)),
                        response_format: 'mp3'
                    })
                });
                if (r.ok) {
                    const url = URL.createObjectURL(await r.blob());
                    const audio = new Audio(url);
                    audio.onplay  = () => { if (onStart) onStart(); };
                    audio.onended = () => { URL.revokeObjectURL(url); if (onEnd) onEnd(); };
                    audio.play();
                    return;
                }
            } catch (_) { /* fallback до offline */ }
        }
    }

    // Offline TTS (Web Speech API)
    // Голоси завантажуються асинхронно — чекаємо якщо ще не готові
    const getVoices = () => new Promise(resolve => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) { resolve(voices); return; }
        window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
        // timeout-fallback — якщо onvoiceschanged не спрацює
        setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
    });

    const voices = await getVoices();
    console.log('[speakText] voices count:', voices.length, '| lang:', lang, '| ttsProvider:', ttsProvider);
    window.speechSynthesis.cancel();

    const u  = new SpeechSynthesisUtterance(clean);
    u.lang   = lang;
    u.rate   = speed;

    // Вибір голосу через централізований хелпер selectOfflineVoice()
    const selected = selectOfflineVoice(voices, lang);
    if (selected) { u.voice = selected; console.log('[speakText] голос:', selected.name); }
    else { console.warn('[speakText] жодного голосу для мови:', lang); }

    u.onerror = e => console.error('[speakText] utterance error:', e.error);
    u.onstart = () => { console.log('[speakText] озвучення почалось'); if (onStart) onStart(); };
    u.onend   = () => { console.log('[speakText] озвучення завершено'); if (onEnd)  onEnd();  };

    console.log('[speakText] speak() викликано, voice:', u.voice?.name || 'default', 'lang:', u.lang);
    window.speechSynthesis.speak(u);
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
