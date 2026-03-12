/**
 * logger.js — Спільний модуль логування Spanish AI Hub
 * ──────────────────────────────────────────────────────
 * Підключати ПІСЛЯ sett_set.js на кожній сторінці:
 *   <script src="sett_set.js"></script>
 *   <script src="logger.js"></script>
 *
 * Всі параметри логування читаються виключно з SETTINGS_CONFIG.logging
 * (sett_set.js). Жодних захардкоджених значень тут немає.
 *
 * API:
 *   Logger.tech(module, eventType, description, extra?)
 *   Logger.techError(module, eventType, description, extra?)
 *   Logger.study(module, data{})
 *   Logger.exportTech(module?)   — завантажити techlog як .txt
 *   Logger.exportStudy(module?)  — завантажити studylog як .txt
 *   Logger.isTechEnabled()       — bool
 *   Logger.isStudyEnabled()      — bool
 *   Logger.clearBuffers()        — очистити обидва буфери
 *   Logger.bufferStats()         — { tech: {lines, modules}, study: {lines, modules} }
 *   Logger.techHeader()          — рядок заголовку техлогу (колонки)
 *   Logger.studyHeader()         — рядок заголовку навчального логу
 */

const Logger = (() => {
    'use strict';

    // ── Доступ до конфігу ──────────────────────────────────────
    // Єдине джерело правди — SETTINGS_CONFIG з sett_set.js.
    // Якщо sett_set.js не підключений — падаємо з помітною помилкою,
    // а не мовчки підставляємо захардкоджені значення.
    function CFG() {
        if (typeof SETTINGS_CONFIG === 'undefined') {
            console.error('[Logger] SETTINGS_CONFIG не знайдено. Підключіть sett_set.js перед logger.js');
            return null;
        }
        return SETTINGS_CONFIG;
    }

    function SK() {
        return CFG()?.storageKeys ?? null;
    }

    // LCFG — конфіг розділу logging з sett_set.js
    function LCFG() {
        const cfg = CFG();
        if (!cfg?.logging) {
            console.error('[Logger] SETTINGS_CONFIG.logging відсутній');
            return null;
        }
        return cfg.logging;
    }

    // Повертає конфіг конкретного лог-каналу ('techLog' | 'studyLog').
    // Якщо відсутній — помилка і null.
    function logCfg(channel) {
        const lcfg = LCFG();
        if (!lcfg) return null;
        if (!lcfg[channel]) {
            console.error(`[Logger] SETTINGS_CONFIG.logging.${channel} відсутній`);
            return null;
        }
        return lcfg[channel];
    }

    // ── Хелпери localStorage ───────────────────────────────────
    const ls = {
        get: (k, fallback = '') => localStorage.getItem(k) ?? fallback,
        set: (k, v)             => localStorage.setItem(k, String(v)),
        del: (k)                => localStorage.removeItem(k),
    };

    /** Поточна дата у форматі ДД.ММ */
    function dateSuffix() {
        const d  = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}.${mm}`;
    }

    /** ISO-timestamp для рядка логу */
    function ts() {
        return new Date().toISOString().replace('T', ' ').slice(0, 19);
    }

    /** Генерує унікальний ID сесії (8 символів HEX) */
    function makeSessionId() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11)
            .replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            ).slice(0, 8);
    }

    // Одна session_id на завантаження сторінки
    const SESSION_ID = makeSessionId();

    // ── Перевірки увімкненості ─────────────────────────────────
    function isTechEnabled() {
        const key = SK()?.techLogEnabled;
        if (!key) return false;
        return ls.get(key, '0') === '1';
    }

    function isStudyEnabled() {
        const key = SK()?.studyLogEnabled;
        if (!key) return false;
        return ls.get(key, '0') === '1';
    }

    // ── Читання/запис буфера ───────────────────────────────────
    function appendToBuffer(bufferKey, module, line, logType) {
        if (!bufferKey) {
            console.error('[Logger] bufferKey відсутній — перевірте storageKey у конфігурації');
            return;
        }
        const lcfg   = LCFG();
        if (!lcfg) return;
        const maxLen = lcfg.bufferMaxLines;
        if (!maxLen || typeof maxLen !== 'number') {
            console.error('[Logger] bufferMaxLines не вказано або некоректне у SETTINGS_CONFIG.logging');
            return;
        }

        let buf = {};
        try { buf = JSON.parse(ls.get(bufferKey, '{}')); } catch { buf = {}; }
        if (!Array.isArray(buf[module])) buf[module] = [];
        buf[module].push(line);

        // Авто-обрізка найстаріших записів при перевищенні ліміту
        while (Object.values(buf).reduce((s, a) => s + a.length, 0) > maxLen) {
            const oldestKey = Object.keys(buf).find(k => buf[k].length > 0);
            if (!oldestKey) break;
            buf[oldestKey].shift();
        }

        ls.set(bufferKey, JSON.stringify(buf));
        trySendToServer(module, line, logType);
    }

    // ── Відправка на локальний сервер ──────────────────────────
    async function trySendToServer(module, line, logType) {
        // Пріоритет URL:
        // 1. SETTINGS_CONFIG.logging.defaultServerUrl — захардкоджений у sett_set.js файлі інстансу
        // 2. localStorage (поле «Сервер логів» у settings.html)
        // 3. window.location.origin — fallback
        const hardcodedUrl = LCFG()?.defaultServerUrl?.trim() ?? '';
        const serverUrlKey = SK()?.logServerUrl;
        const lsUrl = serverUrlKey ? ls.get(serverUrlKey, '').trim() : '';
        const serverUrl = hardcodedUrl || lsUrl || window.location.origin;

        try {
            await fetch(`${serverUrl}/log`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ module, line, type: logType }),
                signal:  AbortSignal.timeout(2000),
            });
        } catch { /* сервер недоступний — ігноруємо */ }
    }

    // ── PUBLIC: Технічний лог ──────────────────────────────────
    function tech(module, eventType, description, extra = null) {
        if (!isTechEnabled()) return;

        const cfg = logCfg('techLog');
        if (!cfg) return;

        const line = [
            ts(),
            module,
            'INFO',
            eventType,
            description,
            extra ? JSON.stringify(extra) : ''
        ].join(cfg.separator);

        appendToBuffer(cfg.storageKey, module, line, 'tech');
    }

    function techError(module, eventType, description, extra = null) {
        if (!isTechEnabled()) return;

        const cfg = logCfg('techLog');
        if (!cfg) return;

        const line = [
            ts(),
            module,
            'ERROR',
            eventType,
            description,
            extra ? JSON.stringify(extra) : ''
        ].join(cfg.separator);

        appendToBuffer(cfg.storageKey, module, line, 'tech');
    }

    // ── PUBLIC: Навчальний лог ─────────────────────────────────
    function study(module, data) {
        if (!isStudyEnabled()) return;

        const cfg = logCfg('studyLog');
        if (!cfg) return;

        const d = data ?? {};

        const line = [
            ts(),
            module,
            d.exercise_type     ?? '',
            d.level             ?? '',
            d.theme             ?? '',
            d.result            ?? '',
            d.score_total       ?? '',
            d.score_max         ?? '',
            d.time_spent_sec    ?? '',
            d.attempt_number    ?? '',
            (d.wrong_answer     ?? '').replace(/\t/g, ' '),
            (d.correct_answer   ?? '').replace(/\t/g, ' '),
            d.explanation_shown ?? 0,
            d.transcript_shown  ?? 0,
            d.slow_mode_used    ?? 0,
            d.tts_replays       ?? 0,
            (d.task_text        ?? '').replace(/\t/g, ' '),
            (d.answer_text      ?? '').replace(/\t/g, ' '),
            (d.ai_feedback_text ?? '').replace(/\t/g, ' '),
            SESSION_ID
        ].join(cfg.separator);

        appendToBuffer(cfg.storageKey, module, line, 'study');
    }

    // ── PUBLIC: Експорт (завантажити файл) ─────────────────────
    function exportLog(type, filterModule = null) {
        const channel = type === 'tech' ? 'techLog' : 'studyLog';
        const cfg     = logCfg(channel);
        if (!cfg) return;

        let buf = {};
        try { buf = JSON.parse(ls.get(cfg.storageKey, '{}')); } catch { return; }

        const modules = filterModule ? [filterModule] : Object.keys(buf);

        modules.forEach((mod, i) => {
            const lines = buf[mod];
            if (!lines || lines.length === 0) return;
            const filename = `${cfg.folder}_${mod}+${dateSuffix()}.txt`;
            setTimeout(() => _downloadText(lines.join('\n'), filename), i * 300);
        });
    }

    function exportTech(filterModule = null)  { exportLog('tech',  filterModule); }
    function exportStudy(filterModule = null) { exportLog('study', filterModule); }

    // ── Завантаження файлу ─────────────────────────────────────
    function _downloadText(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // ── Очистка буферів ────────────────────────────────────────
    function clearBuffers() {
        const tCfg = logCfg('techLog');
        const sCfg = logCfg('studyLog');
        if (tCfg) ls.del(tCfg.storageKey);
        if (sCfg) ls.del(sCfg.storageKey);
    }

    // ── Статистика буфера (для UI settings.html) ───────────────
    function bufferStats() {
        const tCfg = logCfg('techLog');
        const sCfg = logCfg('studyLog');

        const readBuf = (key) => {
            if (!key) return {};
            try { return JSON.parse(ls.get(key, '{}')); } catch { return {}; }
        };

        const count = obj => Object.values(obj).reduce((s, a) => s + a.length, 0);

        const tBuf = readBuf(tCfg?.storageKey);
        const sBuf = readBuf(sCfg?.storageKey);

        return {
            tech:  { lines: count(tBuf), modules: Object.keys(tBuf) },
            study: { lines: count(sBuf), modules: Object.keys(sBuf) },
        };
    }

    // ── Рядки заголовків (колонки) для UI/експорту ─────────────
    function techHeader() {
        const cfg = logCfg('techLog');
        if (!cfg) return '';
        return (cfg.fields ?? []).join(cfg.separator);
    }

    function studyHeader() {
        const cfg = logCfg('studyLog');
        if (!cfg) return '';
        return (cfg.fields ?? []).join(cfg.separator);
    }

    // ── Public API ─────────────────────────────────────────────
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
