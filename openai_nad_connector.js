// ============================================================
//  openai_realtime_connector.js — OpenAI Realtime API (NAD)
//  Spanish AI Hub
//  Підключати після sett_set.js, перед chat_set.js
//
//  Публічний інтерфейс ідентичний GeminiLiveConnector:
//    connect(apiKey, systemPrompt)
//    disconnect()
//    interrupt()
//    startRecording() / stopRecording() / saveRecording(sessionId)
//    onTranscript({ role, text, partial, final })
//    onStateChange(state)  — 'connecting'|'ready'|'listening'|'speaking'|'closed'|'error'
//    onError(err)
// ============================================================

class OpenAIRealtimeConnector {

    static WS_URL     = 'wss://api.openai.com/v1/realtime';
    static MODEL      = 'gpt-4o-realtime-preview';
    static SAMPLE_RATE = 24000;   // OpenAI: 24kHz PCM16 і вхід і вихід
    static CHUNK_SIZE  = 2048;

    constructor({ onTranscript, onStateChange, onError }) {
        this._onTranscript  = onTranscript  || (() => {});
        this._onStateChange = onStateChange || (() => {});
        this._onError       = onError       || (() => {});

        this._ws            = null;
        this._ctx           = null;   // AudioContext (вхід)
        this._stream        = null;
        this._processor     = null;

        this._outCtx        = null;   // AudioContext (вихід)
        this._nextPlayTime  = 0;

        this._userTranscript = '';
        this._aiTranscript   = '';
        this._currentItemId  = null;

        // Запис аудіо (той самий підхід що і в GeminiLiveConnector)
        this._recCtx        = null;
        this._recDest       = null;
        this._recMicNode    = null;
        this._recorder      = null;
        this._recChunks     = [];
        this._recNextPlay   = 0;
        this.recording      = false;
    }

    // ── Підключення ───────────────────────────────────────────
    connect(apiKey, systemPrompt) {
        this._systemPrompt = systemPrompt;
        this._setState('connecting');

        const model = (typeof CHAT_CONFIG !== 'undefined' && CHAT_CONFIG.nad?.openai?.model)
            ? CHAT_CONFIG.nad.openai.model
            : OpenAIRealtimeConnector.MODEL;

        const url = `${OpenAIRealtimeConnector.WS_URL}?model=${encodeURIComponent(model)}`;
        this._ws  = new WebSocket(url, ['realtime', 'openai-insecure-api-key.' + apiKey, 'openai-beta.realtime-v1']);

        this._ws.onopen    = () => this._sendSetup();
        this._ws.onmessage = (event) => {
            try { this._handleMessage(JSON.parse(event.data)); }
            catch(e) { this._log('ws parse error: ' + e.message, 'error'); }
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

    // ── Session setup ─────────────────────────────────────────
    _sendSetup() {
        const cfgVoice = (typeof CHAT_CONFIG !== 'undefined' && CHAT_CONFIG.nad?.openai?.voices)
            ? CHAT_CONFIG.nad.openai.voices[0]
            : 'alloy';
        const storedVoice = (typeof SETTINGS_CONFIG !== 'undefined')
            ? (localStorage.getItem(SETTINGS_CONFIG.storageKeys.voice) || cfgVoice)
            : cfgVoice;

        // Надсилаємо session.update одразу після відкриття
        this._send({
            type: 'session.update',
            session: {
                modalities:          ['audio', 'text'],
                voice:               storedVoice,
                instructions:        this._systemPrompt,
                input_audio_format:  'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: { model: 'whisper-1', language: 'es' },
                turn_detection: {
                    type:               'server_vad',
                    threshold:           0.5,
                    prefix_padding_ms:   300,
                    silence_duration_ms: 800,
                    create_response:     true,
                }
            }
        });
        this._log('session.update sent model=' + OpenAIRealtimeConnector.MODEL, 'info');
    }

    // ── Обробка подій ─────────────────────────────────────────
    _handleMessage(msg) {
        switch(msg.type) {

            case 'session.created':
            case 'session.updated':
                if(msg.type === 'session.created') {
                    this._log('session created — ок', 'success');
                    this._setState('ready');
                    this._initOutCtx();
                    this._startMic();
                }
                break;

            // Аудіо від AI
            case 'response.audio.delta':
                if(msg.delta) this._enqueueAudio(msg.delta);
                break;

            // Транскрипт AI (streaming)
            case 'response.audio_transcript.delta':
                this._aiTranscript += (msg.delta || '');
                this._onTranscript({ role: 'assistant', text: this._aiTranscript, partial: true, final: false });
                break;

            case 'response.audio_transcript.done':
                this._onTranscript({ role: 'assistant', text: msg.transcript || this._aiTranscript, partial: false, final: true });
                this._aiTranscript = '';
                break;

            // Транскрипт користувача
            case 'conversation.item.input_audio_transcription.delta':
                this._userTranscript += (msg.delta || '');
                this._onTranscript({ role: 'user', text: this._userTranscript, partial: true, final: false });
                break;

            case 'conversation.item.input_audio_transcription.completed':
                this._onTranscript({ role: 'user', text: msg.transcript || this._userTranscript, partial: false, final: true });
                this._userTranscript = '';
                break;

            // Стани
            case 'input_audio_buffer.speech_started':
                this._setState('listening');
                break;

            case 'response.created':
            case 'response.audio.delta':
                this._setState('speaking');
                break;

            case 'response.done':
            case 'response.audio.done':
                this._setState('listening');
                break;

            case 'input_audio_buffer.speech_stopped':
                // VAD зупинився — чекаємо відповідь
                break;

            case 'error':
                this._log('API error: ' + JSON.stringify(msg.error), 'error');
                this._onError(new Error((msg.error||{}).message || 'OpenAI Realtime error'));
                this._setState('error');
                break;
        }
    }

    // ── Мікрофон → WebSocket ──────────────────────────────────
    async _startMic() {
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                audio: { channelCount: 1, sampleRate: OpenAIRealtimeConnector.SAMPLE_RATE }
            });
        } catch(e) {
            this._onError(new Error('Мікрофон недоступний: ' + e.message));
            this._setState('error');
            return;
        }

        this._ctx       = new AudioContext({ sampleRate: OpenAIRealtimeConnector.SAMPLE_RATE });
        const source    = this._ctx.createMediaStreamSource(this._stream);
        this._processor = this._ctx.createScriptProcessor(OpenAIRealtimeConnector.CHUNK_SIZE, 1, 1);

        this._processor.onaudioprocess = (e) => {
            if(this._ws?.readyState !== WebSocket.OPEN) return;
            const f32   = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(f32.length);
            for(let i = 0; i < f32.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
            }
            this._send({
                type:  'input_audio_buffer.append',
                audio: this._toBase64(new Uint8Array(pcm16.buffer))
            });
        };

        source.connect(this._processor);
        this._processor.connect(this._ctx.destination);
        this._setState('listening');
        this._log('mic started', 'success');

        if(this.recording) this._connectMicToRec();
    }

    // ── Відтворення PCM 24kHz ─────────────────────────────────
    _initOutCtx() {
        this._outCtx       = new AudioContext({ sampleRate: OpenAIRealtimeConnector.SAMPLE_RATE });
        this._nextPlayTime = this._outCtx.currentTime;
    }

    _enqueueAudio(b64) {
        const raw     = atob(b64);
        const bytes   = new Uint8Array(raw.length);
        for(let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const int16   = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for(let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

        // Відтворення
        const buf = this._outCtx.createBuffer(1, float32.length, OpenAIRealtimeConnector.SAMPLE_RATE);
        buf.copyToChannel(float32, 0);
        const src  = this._outCtx.createBufferSource();
        src.buffer = buf;
        src.connect(this._outCtx.destination);
        const startAt      = Math.max(this._outCtx.currentTime, this._nextPlayTime);
        src.start(startAt);
        this._nextPlayTime = startAt + buf.duration;

        // Паралельно в rec-мікшер
        if(this.recording && this._recCtx && this._recDest) {
            const recBuf = this._recCtx.createBuffer(1, float32.length, OpenAIRealtimeConnector.SAMPLE_RATE);
            recBuf.copyToChannel(float32, 0);
            const recSrc = this._recCtx.createBufferSource();
            recSrc.buffer = recBuf;
            recSrc.connect(this._recDest);
            const recStart    = Math.max(this._recCtx.currentTime, this._recNextPlay || 0);
            recSrc.start(recStart);
            this._recNextPlay = recStart + recBuf.duration;
        }

        this._setState('speaking');
    }

    // ── Ручна відправка (interrupt) ───────────────────────────
    // OpenAI Realtime: truncate поточної відповіді і скинути буфер
    interrupt() {
        this._send({ type: 'response.cancel' });
        this._send({ type: 'input_audio_buffer.clear' });
        this._log('interrupt: response.cancel + buffer.clear', 'info');
    }

    // ── Запис аудіо (ідентично GeminiLiveConnector) ──────────
    startRecording() {
        if(this.recording) return;
        this.recording    = true;
        this._recChunks   = [];
        this._recNextPlay = 0;

        this._recCtx  = new AudioContext({ sampleRate: 48000 });
        this._recDest = this._recCtx.createMediaStreamDestination();

        if(this._stream) this._connectMicToRec();

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus' : 'audio/webm';
        this._recorder = new MediaRecorder(this._recDest.stream, { mimeType, audioBitsPerSecond: 32000 });
        this._recorder.ondataavailable = (e) => {
            if(e.data && e.data.size > 0) this._recChunks.push(e.data);
        };
        this._recorder.start(5000);
        this._log('recording started (' + mimeType + ' 32kbps)', 'success');
    }

    _connectMicToRec() {
        if(!this._stream || !this._recCtx || !this._recDest || this._recMicNode) return;
        this._recMicNode = this._recCtx.createMediaStreamSource(this._stream);
        this._recMicNode.connect(this._recDest);
        this._log('mic connected to rec mixer', 'info');
    }

    stopRecording() {
        if(!this.recording) return;
        this.recording = false;
        if(this._recorder && this._recorder.state !== 'inactive') this._recorder.stop();
        this._log('recording stopped', 'info');
    }

    async saveRecording(sessionId) {
        if(this.recording) this.stopRecording();

        await new Promise(resolve => {
            if(!this._recorder || this._recorder.state === 'inactive') { resolve(); return; }
            this._recorder.onstop = resolve;
            setTimeout(resolve, 1000);
        });

        if(this._recChunks.length === 0) { this._log('saveRecording: немає даних', 'warn'); return null; }

        sessionId      = sessionId || Date.now().toString(36);
        const ts       = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
        const filename = `dialog_${ts}_${sessionId}.webm`;
        const blob     = new Blob(this._recChunks, { type: 'audio/webm' });

        const serverUrl = (typeof SETTINGS_CONFIG !== 'undefined')
            ? (localStorage.getItem(SETTINGS_CONFIG.storageKeys.logServerUrl) || '').trim()
            : '';

        if(serverUrl) {
            try {
                const fd = new FormData();
                fd.append('file', blob, filename);
                fd.append('session_id', sessionId);
                fd.append('track', 'dialog');
                fd.append('timestamp', new Date().toISOString());
                const resp = await fetch(serverUrl + '/audio', { method: 'POST', body: fd });
                this._log('uploaded: ' + filename + ' (' + (blob.size/1024).toFixed(0) + ' KB) → HTTP ' + resp.status, resp.ok ? 'success' : 'warn');
            } catch(e) {
                this._log('upload failed: ' + e.message + ' — скачую локально', 'warn');
                this._downloadBlob(blob, filename);
            }
        } else {
            this._downloadBlob(blob, filename);
            this._log('saved locally: ' + filename + ' (' + (blob.size/1024).toFixed(0) + ' KB)', 'success');
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

    // ── Утиліти ───────────────────────────────────────────────
    _send(obj) {
        if(this._ws?.readyState === WebSocket.OPEN) this._ws.send(JSON.stringify(obj));
    }

    _setState(state) { this._onStateChange(state); }

    _log(msg, type) {
        if(typeof window.addLog === 'function') window.addLog('[NAD/OpenAI] ' + msg, type || 'info');
    }

    _toBase64(uint8) {
        let s = '';
        for(let i = 0; i < uint8.length; i++) s += String.fromCharCode(uint8[i]);
        return btoa(s);
    }

    // ── Відключення ───────────────────────────────────────────
    disconnect() {
        if(this._recorder && this._recorder.state !== 'inactive') this._recorder.stop();
        this._recCtx?.close().catch(() => {});
        this._recCtx = this._recDest = this._recMicNode = this._recorder = null;

        this._processor?.disconnect();
        this._stream?.getTracks().forEach(t => t.stop());
        this._ctx?.close().catch(() => {});
        this._outCtx?.close().catch(() => {});
        this._ws?.close(1000, 'user disconnect');
        this._ws = this._ctx = this._outCtx = this._processor = this._stream = null;
        this._log('disconnected', 'info');
    }
}

if(typeof window !== 'undefined') window.OpenAIRealtimeConnector = OpenAIRealtimeConnector;
