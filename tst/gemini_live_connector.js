// ============================================================
//  gemini_live_connector.js — Gemini Live API (Native Audio)
//  Spanish AI Hub
//  Підключати після sett_set.js, перед chat_set.js
// ============================================================

class GeminiLiveConnector {

    // ── Константи протоколу ───────────────────────────────────
    static WS_URL      = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
    // Формат: models/{model} — обов'язковий для BidiGenerateContent
    static MODEL       = 'models/gemini-2.5-flash-native-audio-preview-12-2025';
    static IN_RATE     = 16000;   // мікрофон → Gemini: 16 kHz PCM16 mono
    static OUT_RATE    = 24000;   // Gemini → динамік: 24 kHz PCM16 mono
    static CHUNK_SIZE  = 2048;    // ScriptProcessor buffer size

    // ─────────────────────────────────────────────────────────
    constructor({ onTranscript, onStateChange, onError, onRecordingChange }) {
        this._onTranscript      = onTranscript      || (() => {});
        this._onStateChange     = onStateChange     || (() => {});
        this._onError           = onError           || (() => {});
        this._onRecordingChange = onRecordingChange || (() => {});

        this._ws             = null;
        this._inCtx          = null;
        this._stream         = null;
        this._processor      = null;

        this._outCtx         = null;
        this._audioQueue     = [];
        this._isPlaying      = false;
        this._nextPlayTime   = 0;

        this._userTranscript = '';
        this._aiTranscript   = '';
        this._pttActive      = false;  // PTT стан

        // ── Запис аудіо (мікс мікрофон + AI в один файл) ────
        this._recCtx         = null;   // AudioContext для мікшування (48kHz)
        this._recDest        = null;   // MediaStreamDestination
        this._recMicNode     = null;   // мікрофон → recCtx
        this._recAiNode      = null;   // буфери AI → recCtx
        this._recorder       = null;   // MediaRecorder → WebM/Opus
        this._recChunks      = [];     // Blob chunks
        this.recording       = false;
    }

    // ── Підключення ───────────────────────────────────────────
    connect(apiKey, systemPrompt) {
        this._systemPrompt = systemPrompt;
        this._setState('connecting');

        const url = `${GeminiLiveConnector.WS_URL}?key=${encodeURIComponent(apiKey)}`;
        this._ws  = new WebSocket(url);

        this._ws.onopen    = () => this._sendSetup();
        this._ws.onmessage = async (event) => {
            try {
                const text = event.data instanceof Blob
                    ? await event.data.text()
                    : event.data;
                this._handleMessage(JSON.parse(text));
            } catch (e) {
                this._log('ws parse error: ' + e.message, 'error');
            }
        };
        this._ws.onerror = () => {
            this._setState('error');
            this._onError(new Error('WebSocket error'));
        };
        this._ws.onclose = (ev) => {
            this._setState('closed');
            this._log('ws closed code=' + ev.code + (ev.reason ? ' reason=' + ev.reason : ''), 'info');
        };
    }

    // ── Setup — точна структура за офіційною документацією ────
    _sendSetup() {
        // Валідні голоси для Gemini Native Audio — OpenAI-голоси (alloy, shimmer тощо) не підтримуються
        const GEMINI_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Zephyr'];
        const rawVoice = (typeof SETTINGS_CONFIG !== 'undefined')
            ? (localStorage.getItem(SETTINGS_CONFIG.storageKeys.voice) || 'Charon')
            : 'Charon';
        const storedVoice = GEMINI_VOICES.includes(rawVoice) ? rawVoice : 'Charon';

        // Додаємо англомовну інструкцію щодо мови на початок промпту
        const langPrefix = 'IMPORTANT: The user speaks ONLY Spanish (es-ES). ' +
            'All user audio input is in Spanish language. ' +
            'Never transcribe user speech as Ukrainian or English. ' +
            'Always interpret user audio as Spanish, even if pronunciation is imperfect.\n\n';

        this._send({
            setup: {
                model: GeminiLiveConnector.MODEL,
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: storedVoice }
                        }
                    }
                },
                systemInstruction: {
                    parts: [{ text: langPrefix + this._systemPrompt }]
                },
                inputAudioTranscription:  {},  // language_code не підтримується Gemini
                outputAudioTranscription: {},
                realtimeInputConfig: {
                    automaticActivityDetection: { disabled: true }  // PTT — ручне керування
                }
            }
        });
        this._log('setup sent model=' + GeminiLiveConnector.MODEL, 'info');
    }


    // ── Обробка вхідних повідомлень ───────────────────────────
    _handleMessage(msg) {
        if (msg.setupComplete) {
            this._log('setupComplete — ок', 'success');
            this._setState('ready');
            this._initOutCtx();
            this._startMic();
            return;
        }

        const sc = msg.serverContent;
        if (!sc) return;

        if (sc.modelTurn?.parts) {
            for (const part of sc.modelTurn.parts) {
                if (part.inlineData?.mimeType?.startsWith('audio/pcm')) {
                    this._enqueueAudio(part.inlineData.data);
                }
            }
        }

        if (sc.outputTranscription) {
            const { text = '', finished = false } = sc.outputTranscription;
            this._aiTranscript += text;
            // Передаємо partial=true для проміжного тексту (streaming)
            // і final=true коли Gemini завершив фразу
            this._onTranscript({
                role:    'assistant',
                text:    this._aiTranscript,
                partial: !finished,
                final:   !!finished
            });
            if (finished) this._aiTranscript = '';
        }

        if (sc.inputTranscription) {
            const { text = '', finished = false } = sc.inputTranscription;
            this._userTranscript += text;
            this._onTranscript({
                role:    'user',
                text:    this._userTranscript,
                partial: !finished,
                final:   !!finished
            });
            if (finished) this._userTranscript = '';
        }

        if (sc.interrupted) {
            this._clearAudioQueue();
            this._setState('listening');
        }

        if (sc.turnComplete) {
            this._setState('listening');
        }
    }

    // ── Мікрофон → WebSocket ──────────────────────────────────
    async _startMic() {
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                audio: { channelCount: 1, sampleRate: GeminiLiveConnector.IN_RATE }
            });
        } catch (e) {
            this._onError(new Error('Мікрофон недоступний: ' + e.message));
            this._setState('error');
            return;
        }

        this._inCtx     = new AudioContext({ sampleRate: GeminiLiveConnector.IN_RATE });
        const source    = this._inCtx.createMediaStreamSource(this._stream);
        this._processor = this._inCtx.createScriptProcessor(GeminiLiveConnector.CHUNK_SIZE, 1, 1);

        this._processor.onaudioprocess = (e) => {
            if (this._ws?.readyState !== WebSocket.OPEN) return;

            const f32   = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(f32.length);
            for (let i = 0; i < f32.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
            }

            if (!this._pttActive) return;  // PTT: шлемо тільки поки кнопка натиснута
            this._send({
                realtimeInput: {
                    audio: {
                        mimeType: `audio/pcm;rate=${GeminiLiveConnector.IN_RATE}`,
                        data: this._toBase64(new Uint8Array(pcm16.buffer))
                    }
                }
            });
        };

        source.connect(this._processor);
        this._processor.connect(this._inCtx.destination);
        this._setState('ready');
        this._log('mic started', 'success');

        // Авто-запис якщо recordingMode === 'auto'
        const recMode = (typeof CHAT_CONFIG !== 'undefined')
            ? (CHAT_CONFIG.nad?.recordingMode || 'off') : 'off';
        if (recMode === 'auto') {
            this.startRecording();
            this._onRecordingChange && this._onRecordingChange(true);
        } else {
            // Підключаємо мікрофон до запису якщо вже активний вручну
            if (this.recording) this._connectMicToRec();
        }
    }

    // ── Відтворення PCM 24 kHz ────────────────────────────────
    _initOutCtx() {
        this._outCtx       = new AudioContext({ sampleRate: GeminiLiveConnector.OUT_RATE });
        this._nextPlayTime = this._outCtx.currentTime;
    }

    _enqueueAudio(b64) {
        const raw     = atob(b64);
        const bytes   = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const int16   = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

        this._audioQueue.push(float32);
        if (!this._isPlaying) this._drainQueue();
        this._setState('speaking');
    }

    _drainQueue() {
        if (!this._outCtx || this._audioQueue.length === 0) {
            this._isPlaying = false;
            return;
        }
        this._isPlaying = true;

        while (this._audioQueue.length > 0) {
            const chunk = this._audioQueue.shift();
            const buf   = this._outCtx.createBuffer(1, chunk.length, GeminiLiveConnector.OUT_RATE);
            buf.copyToChannel(chunk, 0);

            const src    = this._outCtx.createBufferSource();
            src.buffer   = buf;
            src.connect(this._outCtx.destination);

            const startAt      = Math.max(this._outCtx.currentTime, this._nextPlayTime);
            src.start(startAt);
            this._nextPlayTime = startAt + buf.duration;

            src.onended = () => {
                if (this._audioQueue.length > 0) this._drainQueue();
                else this._isPlaying = false;
            };

            // Паралельно подаємо той самий чанк у rec-мікшер
            if (this.recording && this._recCtx && this._recDest) {
                const recBuf = this._recCtx.createBuffer(1, chunk.length, GeminiLiveConnector.OUT_RATE);
                recBuf.copyToChannel(chunk, 0);
                const recSrc = this._recCtx.createBufferSource();
                recSrc.buffer = recBuf;
                recSrc.connect(this._recDest);
                const recStart = Math.max(this._recCtx.currentTime, this._recNextPlay || 0);
                recSrc.start(recStart);
                this._recNextPlay = recStart + recBuf.duration;
            }
        }
    }

    _clearAudioQueue() {
        this._audioQueue   = [];
        this._isPlaying    = false;
        this._nextPlayTime = this._outCtx ? this._outCtx.currentTime : 0;
    }

    // ── Запис аудіо (один мікс-файл WebM/Opus) ───────────────

    startRecording() {
        if (this.recording) return;
        this.recording    = true;
        this._recChunks   = [];
        this._recNextPlay = 0;

        // Окремий AudioContext 48kHz для запису (браузерний стандарт)
        this._recCtx  = new AudioContext({ sampleRate: 48000 });
        this._recDest = this._recCtx.createMediaStreamDestination();

        // Підключаємо мікрофон якщо вже є потік
        if (this._stream) this._connectMicToRec();

        // Запускаємо MediaRecorder на мікшований потік
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus' : 'audio/webm';
        this._recorder = new MediaRecorder(this._recDest.stream, {
            mimeType,
            audioBitsPerSecond: 32000
        });
        this._recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) this._recChunks.push(e.data);
        };
        this._recorder.start(5000); // chunk кожні 5 сек
        this._log('recording started (' + mimeType + ' 32kbps)', 'success');
    }

    // Підключити мікрофон до rec-контексту через ресемплінг
    _connectMicToRec() {
        if (!this._stream || !this._recCtx || !this._recDest || this._recMicNode) return;
        // MediaStreamSource автоматично ресемплює з 16kHz → 48kHz
        this._recMicNode = this._recCtx.createMediaStreamSource(this._stream);
        this._recMicNode.connect(this._recDest);
        this._log('mic connected to rec mixer', 'info');
    }

    stopRecording() {
        if (!this.recording) return;
        this.recording = false;
        if (this._recorder && this._recorder.state !== 'inactive') {
            this._recorder.stop();
        }
        this._log('recording stopped', 'info');
    }

    // Зберегти один мікс-файл і відправити на сервер або скачати
    async saveRecording(sessionId) {
        // Зупиняємо якщо ще пишемо
        if (this.recording) this.stopRecording();

        // Чекаємо поки MediaRecorder злити останній chunk (max 1s)
        await new Promise(resolve => {
            if (!this._recorder || this._recorder.state === 'inactive') { resolve(); return; }
            this._recorder.onstop = resolve;
            setTimeout(resolve, 1000);
        });

        if (this._recChunks.length === 0) {
            this._log('saveRecording: немає даних', 'warn');
            return null;
        }

        sessionId = sessionId || Date.now().toString(36);
        const ts  = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
        const filename = `dialog_${ts}_${sessionId}.webm`;
        const blob = new Blob(this._recChunks, { type: 'audio/webm' });

        // Аудіо завжди шлємо на той самий origin що обслуговує сторінку —
        // це гарантує що CORS не блокує (Bottle-сервер на роутері).
        const serverUrl = window.location.origin;

        // Визначаємо модуль з this._module (якщо задано) або 'chat'
        const module = this._module || 'chat';

        try {
            const resp = await fetch(serverUrl + '/upload-audio', {
                method:  'POST',
                headers: {
                    'Content-Type': 'audio/webm',
                    'X-Module':     module,
                    'X-Session':    sessionId,
                    'X-Filename':   filename,
                },
                body: blob,
            });
            if (resp.ok) {
                this._log('uploaded: ' + filename + ' (' + (blob.size/1024).toFixed(0) + ' KB) → HTTP ' + resp.status, 'success');
            } else {
                this._log('upload HTTP ' + resp.status + ' — скачую локально', 'warn');
                this._downloadBlob(blob, filename);
            }
        } catch(e) {
            this._log('upload failed: ' + e.message + ' — скачую локально', 'warn');
            this._downloadBlob(blob, filename);
        }

        // Очищаємо
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

    // ── Утиліти ───────────────────────────────────────────────
    _send(obj) {
        if (this._ws?.readyState === WebSocket.OPEN) {
            this._ws.send(JSON.stringify(obj));
        }
    }

    _setState(state) { this._onStateChange(state); }

    _log(msg, type) {
        if (typeof window.addLog === 'function') window.addLog('[NAD] ' + msg, type || 'info');
    }

    _toBase64(uint8) {
        let s = '';
        for (let i = 0; i < uint8.length; i++) s += String.fromCharCode(uint8[i]);
        return btoa(s);
    }

    // ── Ручна відправка ───────────────────────────────────────
    // ── PTT: ручне керування мікрофоном ──────────────────────
    startSpeaking() {
        if (this._pttActive) return;
        if (this._ws?.readyState !== WebSocket.OPEN) {
            this._log('PTT: ws не відкритий (state=' + this._ws?.readyState + ')', 'warn');
            return;
        }
        if (!this._stream) {
            this._log('PTT: мікрофон не ініціалізовано', 'warn');
            return;
        }
        this._pttActive = true;
        this._send({ realtimeInput: { activityStart: {} } });
        this._setState('listening');
        this._log('PTT: activityStart', 'info');
    }

    stopSpeaking() {
        if (!this._pttActive) return;
        this._pttActive = false;
        if (this._ws?.readyState === WebSocket.OPEN) {
            this._send({ realtimeInput: { activityEnd: {} } });
        }
        this._setState('ready');
        this._log('PTT: activityEnd', 'info');
    }

    interrupt() { this.stopSpeaking(); }

    // ── Відключення ───────────────────────────────────────────
    disconnect() {
        if (this._recorder && this._recorder.state !== 'inactive') this._recorder.stop();
        this._recCtx?.close().catch(() => {});
        this._recCtx = this._recDest = this._recMicNode = this._recorder = null;
        this._processor?.disconnect();
        this._stream?.getTracks().forEach(t => t.stop());
        this._inCtx?.close().catch(() => {});
        this._clearAudioQueue();
        this._outCtx?.close().catch(() => {});
        this._ws?.close(1000, 'user disconnect');
        this._ws = this._inCtx = this._outCtx = this._processor = this._stream = null;
        this._log('disconnected', 'info');
    }
}

if (typeof window !== 'undefined') window.GeminiLiveConnector = GeminiLiveConnector;
