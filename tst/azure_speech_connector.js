// ============================================================
//  azure_speech_connector.js — Azure Cognitive Services Speech
//  Spanish AI Hub
//  Підключати після sett_set.js
//
//  Публічний інтерфейс ідентичний OpenAIRealtimeConnector:
//    connect(configStr, systemPrompt)  — configStr: 'key|region'
//    disconnect()
//    interrupt()
//    startRecording() / stopRecording() / saveRecording(sessionId)
//    onTranscript({ role, text, partial, final })
//    onStateChange(state)  — 'connecting'|'ready'|'listening'|'speaking'|'closed'|'error'
//    onError(err)
//
//  Для TTS без коннектора: azureTTS(text, lang) — статичний метод
// ============================================================

class AzureSpeechConnector {

    // Azure Speech SDK (lazy-load)
    static SDK_CDN = 'https://aka.ms/csspeech/jsbrowserpackageraw';

    constructor({ onTranscript, onStateChange, onError }) {
        this._onTranscript  = onTranscript  || (() => {});
        this._onStateChange = onStateChange || (() => {});
        this._onError       = onError       || (() => {});

        this._key    = '';
        this._region = 'eastus';
        this._sdk    = null;

        this._recognizer  = null;
        this._synthesizer = null;
        this._stream      = null;

        // Запис аудіо (той самий підхід, що й в OpenAIRealtimeConnector)
        this._recCtx     = null;
        this._recDest    = null;
        this._recMicNode = null;
        this._recorder   = null;
        this._recChunks  = [];
        this.recording   = false;

        this._module     = 'phone';
    }

    // ── Підключення ───────────────────────────────────────────
    // configStr: 'KEY|REGION', наприклад 'abc123...|eastus'
    async connect(configStr, systemPrompt) {
        const [key, region] = (configStr || '').split('|');
        this._key    = (key    || '').trim();
        this._region = (region || 'eastus').trim();
        this._systemPrompt = systemPrompt || '';

        if (!this._key) {
            this._onError(new Error('Azure Speech ключ відсутній. Формат: "key|region"'));
            this._setState('error');
            return;
        }

        this._setState('connecting');

        try {
            await this._loadSDK();
            await this._startRecognition();
        } catch (e) {
            this._onError(e);
            this._setState('error');
        }
    }

    // ── Lazy-load Azure Speech SDK ────────────────────────────
    async _loadSDK() {
        if (window.SpeechSDK) { this._sdk = window.SpeechSDK; return; }
        return new Promise((resolve, reject) => {
            const s   = document.createElement('script');
            s.src     = AzureSpeechConnector.SDK_CDN;
            s.onload  = () => {
                this._sdk = window.SpeechSDK;
                if (!this._sdk) { reject(new Error('Azure Speech SDK не завантажився')); return; }
                this._log('SDK завантажено', 'success');
                resolve();
            };
            s.onerror = () => reject(new Error('Не вдалось завантажити Azure Speech SDK'));
            document.head.appendChild(s);
        });
    }

    // ── Ініціалізація розпізнавання ───────────────────────────
    async _startRecognition() {
        const SDK  = this._sdk;
        const lang = (typeof getLangConfig === 'function') ? getLangConfig().speechLang : 'es-ES';

        const config = SDK.SpeechConfig.fromSubscription(this._key, this._region);
        config.speechRecognitionLanguage = lang;
        config.speechSynthesisLanguage   = lang;
        config.speechSynthesisVoiceName  = this._getVoiceName(lang);

        // Мікрофон
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (e) {
            this._onError(new Error('Мікрофон недоступний: ' + e.message));
            this._setState('error');
            return;
        }

        const audioConfig = SDK.AudioConfig.fromStreamInput(this._stream);
        this._recognizer  = new SDK.SpeechRecognizer(config, audioConfig);

        // Синтезатор TTS (для speak())
        const outConfig       = SDK.AudioConfig.fromDefaultSpeakerOutput();
        this._synthesizer     = new SDK.SpeechSynthesizer(config, outConfig);

        // ── Обробники STT ──────────────────────────────────────
        this._recognizer.recognizing = (_s, e) => {
            if (e.result.reason === SDK.ResultReason.RecognizingSpeech && e.result.text) {
                this._onTranscript({ role: 'user', text: e.result.text, partial: true, final: false });
                this._setState('listening');
            }
        };

        this._recognizer.recognized = (_s, e) => {
            if (e.result.reason === SDK.ResultReason.RecognizedSpeech && e.result.text) {
                this._onTranscript({ role: 'user', text: e.result.text, partial: false, final: true });
            } else if (e.result.reason === SDK.ResultReason.NoMatch) {
                this._log('NoMatch — тихо або нерозбірливо', 'warn');
            }
        };

        this._recognizer.canceled = (_s, e) => {
            const detail = e.errorDetails || 'Azure STT скасовано';
            this._log('canceled: ' + detail, 'error');
            if (e.errorCode !== SDK.CancellationErrorCode.EndOfStream) {
                this._onError(new Error(detail));
                this._setState('error');
            }
        };

        this._recognizer.sessionStarted = () => {
            this._setState('ready');
            this._log('session started', 'success');
            if (this.recording) this._connectMicToRec();
        };

        this._recognizer.sessionStopped = () => {
            this._setState('closed');
            this._log('session stopped', 'info');
        };

        // Стартуємо безперервне розпізнавання
        await new Promise((resolve, reject) => {
            this._recognizer.startContinuousRecognitionAsync(
                () => { this._setState('listening'); this._log('recognition started', 'success'); resolve(); },
                (err) => { reject(new Error(err)); }
            );
        });
    }

    // ── Визначення голосу за мовою ────────────────────────────
    _getVoiceName(lang) {
        const stored = (typeof SETTINGS_CONFIG !== 'undefined')
            ? (localStorage.getItem(SETTINGS_CONFIG.storageKeys.voice) || '')
            : '';
        // Перевіряємо чи збережений голос — Azure Neural (містить "Neural")
        if (stored && stored.includes('Neural')) return stored;

        const prefix = lang.split('-')[0];
        const defaults = {
            es: 'es-ES-AlvaroNeural',
            en: 'en-US-JennyNeural',
            fr: 'fr-FR-DeniseNeural',
            de: 'de-DE-KatjaNeural',
            it: 'it-IT-ElsaNeural',
            pt: 'pt-PT-RaquelNeural',
            pl: 'pl-PL-ZofiaNeural',
            la: 'es-ES-AlvaroNeural',  // Latin — Spanish fallback
        };
        return defaults[prefix] || 'es-ES-AlvaroNeural';
    }

    // ── TTS через Azure SDK (для use через коннектор) ─────────
    async speak(text) {
        if (!this._synthesizer || !text) return;
        const clean = (typeof stripMarkdown === 'function') ? stripMarkdown(text) : text;
        if (!clean) return;

        this._setState('speaking');
        return new Promise(resolve => {
            this._synthesizer.speakTextAsync(
                clean,
                result => {
                    if (result.reason === this._sdk.ResultReason.SynthesizingAudioCompleted) {
                        this._onTranscript({ role: 'assistant', text, partial: false, final: true });
                    } else {
                        this._log('TTS result: ' + result.reason, 'warn');
                    }
                    this._setState('listening');
                    resolve();
                },
                err => {
                    this._log('TTS error: ' + err, 'error');
                    this._setState('listening');
                    resolve();
                }
            );
        });
    }

    // ── Interrupt (зупинити TTS, продовжити STT) ──────────────
    interrupt() {
        if (!this._sdk || !this._key) return;
        // Закриваємо старий синтезатор і відкриваємо новий
        try { if (this._synthesizer) this._synthesizer.close(); } catch (_) {}
        const lang   = (typeof getLangConfig === 'function') ? getLangConfig().speechLang : 'es-ES';
        const cfg    = this._sdk.SpeechConfig.fromSubscription(this._key, this._region);
        cfg.speechSynthesisVoiceName = this._getVoiceName(lang);
        const out    = this._sdk.AudioConfig.fromDefaultSpeakerOutput();
        this._synthesizer = new this._sdk.SpeechSynthesizer(cfg, out);
        this._log('interrupt: synthesizer reset', 'info');
    }

    // ── Запис аудіо ───────────────────────────────────────────
    startRecording() {
        if (this.recording) return;
        this.recording  = true;
        this._recChunks = [];

        this._recCtx  = new AudioContext({ sampleRate: 48000 });
        this._recDest = this._recCtx.createMediaStreamDestination();

        if (this._stream) this._connectMicToRec();

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus' : 'audio/webm';
        this._recorder = new MediaRecorder(this._recDest.stream, { mimeType, audioBitsPerSecond: 32000 });
        this._recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) this._recChunks.push(e.data);
        };
        this._recorder.start(5000);
        this._log('recording started (' + mimeType + ')', 'success');
    }

    _connectMicToRec() {
        if (!this._stream || !this._recCtx || !this._recDest || this._recMicNode) return;
        this._recMicNode = this._recCtx.createMediaStreamSource(this._stream);
        this._recMicNode.connect(this._recDest);
        this._log('mic connected to rec mixer', 'info');
    }

    stopRecording() {
        if (!this.recording) return;
        this.recording = false;
        if (this._recorder && this._recorder.state !== 'inactive') this._recorder.stop();
        this._log('recording stopped', 'info');
    }

    async saveRecording(sessionId) {
        if (this.recording) this.stopRecording();

        await new Promise(resolve => {
            if (!this._recorder || this._recorder.state === 'inactive') { resolve(); return; }
            this._recorder.onstop = resolve;
            setTimeout(resolve, 1000);
        });

        if (!this._recChunks.length) { this._log('saveRecording: немає даних', 'warn'); return null; }

        sessionId      = sessionId || Date.now().toString(36);
        const ts       = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
        const filename = `dialog_${ts}_${sessionId}.webm`;
        const blob     = new Blob(this._recChunks, { type: 'audio/webm' });
        const module   = this._module || 'phone';

        try {
            const resp = await fetch(window.location.origin + '/upload-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'audio/webm',
                    'X-Module':     module,
                    'X-Session':    sessionId,
                    'X-Filename':   filename,
                },
                body: blob,
            });
            if (resp.ok) {
                this._log('uploaded: ' + filename + ' (' + (blob.size / 1024).toFixed(0) + ' KB)', 'success');
            } else {
                this._log('upload HTTP ' + resp.status + ' — скачую локально', 'warn');
                this._downloadBlob(blob, filename);
            }
        } catch (e) {
            this._log('upload failed: ' + e.message + ' — скачую локально', 'warn');
            this._downloadBlob(blob, filename);
        }

        this._recChunks  = [];
        this._recMicNode = null;
        this._recorder   = null;
        this._recCtx?.close().catch(() => {});
        this._recCtx = this._recDest = null;
        return filename;
    }

    _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    // ── Відключення ───────────────────────────────────────────
    disconnect() {
        if (this._recognizer) {
            this._recognizer.stopContinuousRecognitionAsync(
                () => this._recognizer.close(),
                () => { try { this._recognizer.close(); } catch (_) {} }
            );
            this._recognizer = null;
        }
        try { if (this._synthesizer) this._synthesizer.close(); } catch (_) {}
        this._synthesizer = null;

        if (this._stream) { this._stream.getTracks().forEach(t => t.stop()); this._stream = null; }
        this._recCtx?.close().catch(() => {});
        this._recCtx = this._recDest = this._recMicNode = this._recorder = null;
        this._setState('closed');
        this._log('disconnected', 'info');
    }

    // ── Утиліти ───────────────────────────────────────────────
    _setState(state) { this._onStateChange(state); }

    _log(msg, type) {
        if (typeof window.addLog === 'function') window.addLog('[NAD/Azure] ' + msg, type || 'info');
    }

    // ── Статичний REST TTS (без коннектора) ───────────────────
    // Використовується в speakText() з sett_set.js для Azure онлайн-режиму.
    // key     — Azure Speech ключ
    // region  — Azure регіон, напр. 'eastus'
    // text    — чистий текст (без Markdown)
    // lang    — BCP-47, напр. 'es-ES'
    // voice   — назва Neural голосу, напр. 'es-ES-AlvaroNeural'
    // speed   — 0.5–1.5
    // returns — Promise<boolean> (true якщо відтворення запущено)
    static async restTTS(key, region, text, lang, voice, speed, { onLoading, onStart, onEnd } = {}) {
        if (!key || !region || !text) return false;

        const safeText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        // Конвертуємо speed (0.5–1.5) у SSML rate (-50% до +50%)
        const ratePct  = Math.round((speed - 1.0) * 100);
        const rateStr  = (ratePct >= 0 ? '+' : '') + ratePct + '%';

        const ssml = `<speak version='1.0' xml:lang='${lang}' `
            + `xmlns='http://www.w3.org/2001/10/synthesis'>`
            + `<voice name='${voice}'>`
            + `<prosody rate='${rateStr}'>${safeText}</prosody>`
            + `</voice></speak>`;

        if (onLoading) onLoading();
        try {
            const r = await fetch(
                `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
                {
                    method: 'POST',
                    headers: {
                        'Ocp-Apim-Subscription-Key': key,
                        'Content-Type':              'application/ssml+xml',
                        'X-Microsoft-OutputFormat':  'audio-16khz-128kbitrate-mono-mp3',
                    },
                    body: ssml,
                }
            );
            if (!r.ok) {
                console.warn('[AzureTTS] HTTP ' + r.status);
                return false;
            }
            const url   = URL.createObjectURL(await r.blob());
            const audio = new Audio(url);
            audio.onplay  = () => { if (onStart) onStart(); };
            audio.onended = () => { URL.revokeObjectURL(url); if (onEnd) onEnd(); };
            audio.play();
            return true;
        } catch (e) {
            console.warn('[AzureTTS] fetch error:', e.message);
            return false;
        }
    }

    // ── Pronunciation Assessment (одноразовий запис, повертає бали) ──────────
    // key          — Azure Speech ключ
    // region       — Azure регіон (eastus тощо)
    // targetPhrase — фраза для порівняння (reference text)
    // lang         — BCP-47, напр. 'es-ES'
    // Повертає Promise<{transcript, accuracyScore, fluencyScore, completenessScore, prosodyScore, pronunciationScore}>
    static async assessPronunciation(key, region, targetPhrase, lang) {
        if (!window.SpeechSDK) {
            await new Promise((resolve, reject) => {
                const s   = document.createElement('script');
                s.src     = AzureSpeechConnector.SDK_CDN;
                s.onload  = resolve;
                s.onerror = () => reject(new Error('Azure Speech SDK не завантажився'));
                document.head.appendChild(s);
            });
        }
        const SDK = window.SpeechSDK;

        const speechConfig = SDK.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechRecognitionLanguage = lang;

        const pronunciationConfig = new SDK.PronunciationAssessmentConfig(
            targetPhrase,
            SDK.PronunciationAssessmentGradingSystem.HundredMark,
            SDK.PronunciationAssessmentGranularity.Word,
            true  // enableMiscue
        );

        const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer  = new SDK.SpeechRecognizer(speechConfig, audioConfig);
        pronunciationConfig.applyTo(recognizer);

        return new Promise((resolve, reject) => {
            recognizer.recognizeOnceAsync(result => {
                try {
                    if (result.reason !== SDK.ResultReason.RecognizedSpeech) {
                        // Canceled = помилка з'єднання/авторизації → reject щоб клієнт показав помилку
                        if (result.reason === SDK.ResultReason.Canceled) {
                            const details = SDK.CancellationDetails.fromResult(result);
                            const msg = details.errorDetails || String(details.reason);
                            if (typeof window.addLog === 'function')
                                window.addLog(`[Azure/assess] Canceled: ${msg}`, 'error');
                            reject(new Error('Azure: ' + msg));
                            return;
                        }
                        // NoMatch — нема мови/тиша → повертаємо нулі без виключення
                        const detail = result.errorDetails || result.reason;
                        if (typeof window.addLog === 'function')
                            window.addLog(`[Azure/assess] NoMatch reason=${result.reason} details=${detail}`, 'warn');
                        resolve({
                            transcript: '',
                            accuracyScore: 0, fluencyScore: 0,
                            completenessScore: 0, prosodyScore: 0, pronunciationScore: 0,
                        });
                        return;
                    }
                    const pa = SDK.PronunciationAssessmentResult.fromResult(result);
                    resolve({
                        transcript:         result.text || '',
                        accuracyScore:      Math.round(pa.accuracyScore      || 0),
                        fluencyScore:       Math.round(pa.fluencyScore       || 0),
                        completenessScore:  Math.round(pa.completenessScore  || 0),
                        prosodyScore:       Math.round(pa.prosodyScore       || 0),
                        pronunciationScore: Math.round(pa.pronunciationScore || 0),
                    });
                } catch (e) {
                    reject(e);
                } finally {
                    recognizer.close();
                }
            }, err => {
                recognizer.close();
                reject(new Error(String(err)));
            });
        });
    }

    // ── Pronunciation Assessment з пословними та фонемними даними ───────────
    // Аналогічний assessPronunciation(), але повертає також масив слів з фонемами.
    // words: [{word, accuracyScore, errorType, badPhonemes}]
    // badPhonemes — фонеми з AccuracyScore < 65
    static async assessPronunciationWithWords(key, region, targetPhrase, lang) {
        if (!window.SpeechSDK) {
            await new Promise((resolve, reject) => {
                const s   = document.createElement('script');
                s.src     = AzureSpeechConnector.SDK_CDN;
                s.onload  = resolve;
                s.onerror = () => reject(new Error('Azure Speech SDK не завантажився'));
                document.head.appendChild(s);
            });
        }
        const SDK = window.SpeechSDK;

        const speechConfig = SDK.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechRecognitionLanguage = lang;

        const pronunciationConfig = new SDK.PronunciationAssessmentConfig(
            targetPhrase,
            SDK.PronunciationAssessmentGradingSystem.HundredMark,
            SDK.PronunciationAssessmentGranularity.Phoneme,
            true  // enableMiscue
        );

        const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer  = new SDK.SpeechRecognizer(speechConfig, audioConfig);
        pronunciationConfig.applyTo(recognizer);

        return new Promise((resolve, reject) => {
            recognizer.recognizeOnceAsync(result => {
                try {
                    if (result.reason !== SDK.ResultReason.RecognizedSpeech) {
                        if (result.reason === SDK.ResultReason.Canceled) {
                            const details = SDK.CancellationDetails.fromResult(result);
                            const msg = details.errorDetails || String(details.reason);
                            if (typeof window.addLog === 'function')
                                window.addLog(`[Azure/assessWords] Canceled: ${msg}`, 'error');
                            reject(new Error('Azure: ' + msg));
                            return;
                        }
                        const detail = result.errorDetails || result.reason;
                        if (typeof window.addLog === 'function')
                            window.addLog(`[Azure/assessWords] NoMatch reason=${result.reason} details=${detail}`, 'warn');
                        resolve({
                            transcript: '', words: [],
                            accuracyScore: 0, fluencyScore: 0,
                            completenessScore: 0, prosodyScore: 0, pronunciationScore: 0,
                        });
                        return;
                    }
                    const pa = SDK.PronunciationAssessmentResult.fromResult(result);
                    const words = (pa.detailedResults || [])
                        .flatMap(r => r.Words || [])
                        .map(w => {
                            const phonemes = w.Phonemes || [];
                            const badPhonemes = phonemes
                                .filter(p => (p.AccuracyScore || 0) < 65)
                                .map(p => p.Phoneme || '')
                                .filter(Boolean);
                            return {
                                word:          w.Word        || '',
                                accuracyScore: Math.round(w.AccuracyScore || 0),
                                errorType:     w.ErrorType   || 'None',
                                badPhonemes,
                            };
                        });
                    resolve({
                        transcript:         result.text || '',
                        accuracyScore:      Math.round(pa.accuracyScore      || 0),
                        fluencyScore:       Math.round(pa.fluencyScore       || 0),
                        completenessScore:  Math.round(pa.completenessScore  || 0),
                        prosodyScore:       Math.round(pa.prosodyScore       || 0),
                        pronunciationScore: Math.round(pa.pronunciationScore || 0),
                        words,
                    });
                } catch (e) {
                    reject(e);
                } finally {
                    recognizer.close();
                }
            }, err => {
                recognizer.close();
                reject(new Error(String(err)));
            });
        });
    }

    // ── Cancelable варіант assessPronunciation ────────────────────────────────
    // Повертає { promise, recognizer } щоб клієнт міг закрити recognizer достроково.
    static assessPronunciationCancelable(key, region, targetPhrase, lang) {
        let recognizer = null;
        const promise = (async () => {
            if (!window.SpeechSDK) {
                await new Promise((resolve, reject) => {
                    const s   = document.createElement('script');
                    s.src     = AzureSpeechConnector.SDK_CDN;
                    s.onload  = resolve;
                    s.onerror = () => reject(new Error('Azure Speech SDK не завантажився'));
                    document.head.appendChild(s);
                });
            }
            const SDK = window.SpeechSDK;
            const speechConfig = SDK.SpeechConfig.fromSubscription(key, region);
            speechConfig.speechRecognitionLanguage = lang;
            const pronunciationConfig = new SDK.PronunciationAssessmentConfig(
                targetPhrase,
                SDK.PronunciationAssessmentGradingSystem.HundredMark,
                SDK.PronunciationAssessmentGranularity.Word,
                true
            );
            const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
            recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);
            pronunciationConfig.applyTo(recognizer);
            return new Promise((resolve, reject) => {
                recognizer.recognizeOnceAsync(result => {
                    try {
                        if (result.reason !== SDK.ResultReason.RecognizedSpeech) {
                            if (result.reason === SDK.ResultReason.Canceled) {
                                const details = SDK.CancellationDetails.fromResult(result);
                                const msg = details.errorDetails || String(details.reason);
                                if (typeof window.addLog === 'function')
                                    window.addLog(`[Azure/assess] Canceled: ${msg}`, 'error');
                                reject(new Error('Azure: ' + msg));
                                return;
                            }
                            const detail = result.errorDetails || result.reason;
                            if (typeof window.addLog === 'function')
                                window.addLog(`[Azure/assess] NoMatch reason=${result.reason} details=${detail}`, 'warn');
                            resolve({ transcript: '', accuracyScore: 0, fluencyScore: 0, completenessScore: 0, prosodyScore: 0, pronunciationScore: 0 });
                            return;
                        }
                        const pa = SDK.PronunciationAssessmentResult.fromResult(result);
                        resolve({
                            transcript:         result.text || '',
                            accuracyScore:      Math.round(pa.accuracyScore      || 0),
                            fluencyScore:       Math.round(pa.fluencyScore       || 0),
                            completenessScore:  Math.round(pa.completenessScore  || 0),
                            prosodyScore:       Math.round(pa.prosodyScore       || 0),
                            pronunciationScore: Math.round(pa.pronunciationScore || 0),
                        });
                    } catch(e) { reject(e); } finally { try { recognizer.close(); } catch(_) {} }
                }, err => {
                    try { recognizer.close(); } catch(_) {}
                    reject(new Error(String(err)));
                });
            });
        })();
        return { promise, get recognizer() { return recognizer; } };
    }
}

if (typeof window !== 'undefined') window.AzureSpeechConnector = AzureSpeechConnector;
