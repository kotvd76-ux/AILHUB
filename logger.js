/**
 * logger.js — Спільний модуль логування Spanish AI Hub
 * ──────────────────────────────────────────────────────
 * Підключати ПІСЛЯ sett_set.js на кожній сторінці:
 *   <script src="sett_set.js"></script>
 *   <script src="logger.js"></script>
 *
 * API:
 *   Logger.tech(module, eventType, description, extra?)
 *   Logger.study(module, data{})
 *   Logger.exportTech(module?)   — завантажити techlog як .txt
 *   Logger.exportStudy(module?)  — завантажити studylog як .txt
 *   Logger.isTechEnabled()       — bool
 *   Logger.isStudyEnabled()      — bool
 *   Logger.clearBuffers()        — очистити обидва буфери
 */

const Logger = (() => {
    'use strict';

    // ── Доступ до конфігу ──────────────────────────────────
    const CFG  = () => (typeof SETTINGS_CONFIG !== 'undefined' ? SETTINGS_CONFIG : null);
    const SK   = () => CFG()?.storageKeys ?? {};
    const LCFG = () => CFG()?.logging ?? {};

    // ── Хелпери ────────────────────────────────────────────
    const ls = {
        get: (k, fallback = '')  => localStorage.getItem(k) ?? fallback,
        set: (k, v)              => localStorage.setItem(k, String(v)),
        del: (k)                 => localStorage.removeItem(k),
    };

    /** Поточна дата у форматі ДД.ММ */
    function dateSuffix() {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}.${mm}`;
    }

    /** ISO-timestamp для рядка логу */
    function ts() {
        return new Date().toISOString().replace('T', ' ').slice(0, 19);
    }

    /** Генерує унікальний ID сесії (приблизний UUID v4) */
    function uuid() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11)
            .replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
    }

    // Поточна session_id — одна на завантаження сторінки
    const SESSION_ID = uuid().slice(0, 8);

    // ── Перевірки увімкненості ─────────────────────────────
    function isTechEnabled()  { return ls.get(SK().techLogEnabled,  '0') === '1'; }
    function isStudyEnabled() { return ls.get(SK().studyLogEnabled, '0') === '1'; }

    // ── Читання/запис буфера ───────────────────────────────
    /**
     * bufferKey   — ключ localStorage для цього типу логу
     * module      — ім'я модуля (phone, listening, settings...)
     * line        — готовий рядок лог-запису
     */
    function appendToBuffer(bufferKey, module, line, logType = 'tech') {
        const lcfg   = LCFG();
        const maxLen = lcfg.bufferMaxLines ?? 500;

        // Зберігаємо як об'єкт { module: [lines...], ... }
        let buf = {};
        try { buf = JSON.parse(ls.get(bufferKey, '{}')); } catch { buf = {}; }
        if (!Array.isArray(buf[module])) buf[module] = [];
        buf[module].push(line);

        // Авто-обрізка старих записів якщо перевищено ліміт
        const total = Object.values(buf).reduce((s, a) => s + a.length, 0);
        if (total > maxLen) {
            // Видаляємо перші рядки найстарішого модуля
            const oldestKey = Object.keys(buf).find(k => buf[k].length > 0);
            if (oldestKey) buf[oldestKey].shift();
        }

        ls.set(bufferKey, JSON.stringify(buf));

        // Спроба відправки на сервер (якщо налаштований)
        trySendToServer(lcfg, module, line, logType);
    }

    // ── Відправка на локальний сервер ──────────────────────
    async function trySendToServer(lcfg, module, line, logType = 'tech') {
        const serverUrl = ls.get(SK().logServerUrl ?? 'sp_log_server_url', '').trim();
        if (!serverUrl) return;

        try {
            await fetch(`${serverUrl}/log`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ module, line, type: logType }),
                // Тихий фейл — не блокуємо UI
                signal: AbortSignal.timeout(2000),
            });
        } catch { /* сервер недоступний — ігноруємо */ }
    }

    // ── PUBLIC: Технічний лог ──────────────────────────────
    /**
     * @param {string} module     — 'listening' | 'phone' | 'settings' | ...
     * @param {string} eventType  — 'session_start' | 'api_call' | 'tts_play' | 'error' | ...
     * @param {string} description — текстовий опис події
     * @param {object} [extra]    — будь-які додаткові дані (серіалізується в JSON)
     */
    function tech(module, eventType, description, extra = null) {
        if (!isTechEnabled()) return;

        const sep  = LCFG().techLog?.separator ?? '\t';
        const line = [
            ts(),
            module,
            'INFO',
            eventType,
            description,
            extra ? JSON.stringify(extra) : ''
        ].join(sep);

        const bufKey = LCFG().techLog?.storageKey ?? 'sp_techlog_buffer';
        appendToBuffer(bufKey, module, line, 'tech');
    }

    /**
     * Варіант для помилок — автоматично ставить level=ERROR
     */
    function techError(module, eventType, description, extra = null) {
        if (!isTechEnabled()) return;

        const sep  = LCFG().techLog?.separator ?? '\t';
        const line = [
            ts(),
            module,
            'ERROR',
            eventType,
            description,
            extra ? JSON.stringify(extra) : ''
        ].join(sep);

        const bufKey = LCFG().techLog?.storageKey ?? 'sp_techlog_buffer';
        appendToBuffer(bufKey, module, line, 'tech');
    }

    // ── PUBLIC: Навчальний лог ─────────────────────────────
    /**
     * @param {string} module — 'listening' | 'phone' | ...
     * @param {object} data   — поля навчального запису:
     *   {
     *     exercise_type,    // 'qa' | 'roleplay' | 'echo' | 'debate' | ...
     *     level,            // 'A2' | 'B1' | 'B2'
     *     theme,            // 'Travel' | 'Office' | ...
     *     result,           // 'correct' | 'wrong' | 'skip' | 'timeout'
     *     score_total,      // поточний рахунок
     *     score_max,        // максимально можливий рахунок
     *     time_spent_sec,   // секунди від показу питання до відповіді
     *     attempt_number,   // номер питання в сесії (1-based)
     *     wrong_answer,     // текст хибної відповіді або '' якщо correct
     *     correct_answer,   // текст правильної відповіді
     *     explanation_shown,// 0|1 — чи відкривав пояснення
     *     transcript_shown, // 0|1 — чи відкривав текст
     *     slow_mode_used,   // 0|1 — чи використовував "Повільно"
     *     tts_replays,      // кількість повторних прослуховувань
     *     task_text,        // текст/транскрипт завдання
     *     answer_text,      // текст/транскрипт відповіді учня
     *     ai_feedback_text, // текст фідбеку від ШІ
     *   }
     */
    function study(module, data) {
        if (!isStudyEnabled()) return;

        const sep = LCFG().studyLog?.separator ?? '\t';
        const d   = data ?? {};

        const line = [
            ts(),
            module,
            d.exercise_type    ?? '',
            d.level            ?? '',
            d.theme            ?? '',
            d.result           ?? '',
            d.score_total      ?? '',
            d.score_max        ?? '',
            d.time_spent_sec   ?? '',
            d.attempt_number   ?? '',
            (d.wrong_answer    ?? '').replace(/\t/g, ' '),
            (d.correct_answer  ?? '').replace(/\t/g, ' '),
            d.explanation_shown ?? 0,
            d.transcript_shown  ?? 0,
            d.slow_mode_used    ?? 0,
            d.tts_replays       ?? 0,
            (d.task_text        ?? '').replace(/\t/g, ' '),
            (d.answer_text      ?? '').replace(/\t/g, ' '),
            (d.ai_feedback_text ?? '').replace(/\t/g, ' '),
            SESSION_ID
        ].join(sep);

        const bufKey = LCFG().studyLog?.storageKey ?? 'sp_studylog_buffer';
        appendToBuffer(bufKey, module, line, 'study');
    }

    // ── PUBLIC: Експорт (завантажити файл) ─────────────────
    /**
     * Формує та завантажує .txt-файл(и) з буфера
     * @param {'tech'|'study'} type
     * @param {string|null}    filterModule — null = всі модулі
     */
    function exportLog(type, filterModule = null) {
        const lcfg  = LCFG();
        const cfg   = type === 'tech' ? lcfg.techLog : lcfg.studyLog;
        const bufKey = cfg?.storageKey ?? (type === 'tech' ? 'sp_techlog_buffer' : 'sp_studylog_buffer');
        const folder = cfg?.folder     ?? type === 'tech' ? 'techlog' : 'studylog';

        let buf = {};
        try { buf = JSON.parse(ls.get(bufKey, '{}')); } catch { return; }

        const modules = filterModule ? [filterModule] : Object.keys(buf);

        modules.forEach(mod => {
            const lines = buf[mod];
            if (!lines || lines.length === 0) return;

            const filename = `${folder}/${mod}+${dateSuffix()}.txt`;
            const content  = lines.join('\n');
            _downloadText(content, filename);
        });
    }

    function exportTech(filterModule = null)  { exportLog('tech',  filterModule); }
    function exportStudy(filterModule = null) { exportLog('study', filterModule); }

    // ── Завантаження файлу ─────────────────────────────────
    function _downloadText(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = filename.replace('/', '_'); // браузер не створює папки
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ── Очистка буферів ────────────────────────────────────
    function clearBuffers() {
        ls.del(LCFG().techLog?.storageKey  ?? 'sp_techlog_buffer');
        ls.del(LCFG().studyLog?.storageKey ?? 'sp_studylog_buffer');
    }

    // ── Статистика буфера (для UI) ─────────────────────────
    function bufferStats() {
        const tBuf = (() => { try { return JSON.parse(ls.get(LCFG().techLog?.storageKey  ?? 'sp_techlog_buffer',  '{}')); } catch { return {}; } })();
        const sBuf = (() => { try { return JSON.parse(ls.get(LCFG().studyLog?.storageKey ?? 'sp_studylog_buffer', '{}')); } catch { return {}; } })();

        const count = obj => Object.values(obj).reduce((s, a) => s + a.length, 0);

        return {
            tech:  { lines: count(tBuf),  modules: Object.keys(tBuf)  },
            study: { lines: count(sBuf),  modules: Object.keys(sBuf)  },
        };
    }

    // ── Заголовок файлу (колонки) ──────────────────────────
    function techHeader() {
        const cfg = LCFG().techLog;
        return (cfg?.fields ?? []).join(cfg?.separator ?? '\t');
    }
    function studyHeader() {
        const cfg = LCFG().studyLog;
        return (cfg?.fields ?? []).join(cfg?.separator ?? '\t');
    }

    // ── Public API ─────────────────────────────────────────
    return {
        tech,
        techError,
        study,
        exportTech,
        exportStudy,
        clearBuffers,
        bufferStats,
        isTechEnabled,
        isStudyEnabled,
        techHeader,
        studyHeader,
        SESSION_ID,
    };

})();
