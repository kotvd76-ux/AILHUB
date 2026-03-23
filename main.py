from bottle import route, run, static_file, response, request
import os
import re
import sys
import json
from datetime import datetime
import urllib.request
import urllib.parse

# ── Параметри з командного рядка ─────────────────────────────
# Використання: python3 main.py <user_dir> <port>
# Приклад:      python3 main.py kvd 8080
if len(sys.argv) < 3:
    print("Usage: python3 main.py <user_dir> <port>")
    print("Example: python3 main.py kvd 8080")
    sys.exit(1)

USER_DIR = sys.argv[1]                                        # kvd | kgd | kov | tst
PORT     = int(sys.argv[2])                                   # 8080 | 8085 | 8095 | 8100

# Прод-режим: /opt/share/nginx/html/<user>
# Локальний debug (GitHub/репо): якщо прод-папки немає — беремо директорію цього файлу.
base_dir_prod = f'/opt/share/nginx/html/{USER_DIR}'
base_dir_local = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = base_dir_prod if os.path.isdir(base_dir_prod) else base_dir_local

# Можна явно перевизначити кореневу директорію логів через HUB_LOG_DIR.
# За замовчуванням пишемо прямо в BASE_DIR, тобто папки `techlog/` і `studylog/`
# будуть у корені проєкту/інстансу.
LOG_DIR = os.environ.get('HUB_LOG_DIR', '').strip() or BASE_DIR

# ── Головна сторінка ───────────────────────────────────────────
@route('/')
def root():
    return static_file('index.html', root=BASE_DIR)

# ── Статус роутера ────────────────────────────────────────────
@route('/status')
def status():
    try:
        with os.popen("free -m | awk '/Mem:/ {print $4}'") as f:
            ram = f.read().strip()
    except Exception:
        ram = '0'
    try:
        with os.popen("cat /proc/loadavg | awk '{print $1}'") as f:
            load = f.read().strip()
        cpu = min(round(float(load or 0) * 100, 1), 100)
    except Exception:
        cpu = 0

    response.content_type = 'application/json'
    response.set_header('Access-Control-Allow-Origin', '*')
    return json.dumps({"cpu": cpu, "ram_free": int(ram or 0)})

# ── Лог-сервер (POST /log) ────────────────────────────────────
@route('/log', method=['POST', 'OPTIONS'])
def receive_log():
    response.set_header('Access-Control-Allow-Origin', '*')
    response.set_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.set_header('Access-Control-Allow-Headers', 'Content-Type')

    if request.method == 'OPTIONS':
        return ''  # preflight CORS

    try:
        data    = request.json or {}
        module  = data.get('module', 'unknown')
        line    = data.get('line', '')
        logtype = data.get('type', 'tech')   # 'tech' | 'study'

        if not line:
            response.status = 400
            return json.dumps({"error": "empty line"})

        folder = os.path.join(LOG_DIR, logtype + 'log')
        os.makedirs(folder, exist_ok=True)

        today = datetime.now().strftime('%Y-%m-%d')
        # Один файл на день для всіх модулів цього типу логу.
        fname = os.path.join(folder, f'{today}.txt')

        with open(fname, 'a', encoding='utf-8') as f:
            f.write(line + '\n')

        response.content_type = 'application/json'
        return json.dumps({"ok": True})

    except Exception as e:
        response.status = 500
        response.content_type = 'application/json'
        return json.dumps({"error": str(e)})

# ── Список лог-файлів (GET /logs/<logtype>) ───────────────────
@route('/logs/<logtype>', method=['GET', 'OPTIONS'])
def list_logs(logtype):
    response.set_header('Access-Control-Allow-Origin', '*')
    if request.method == 'OPTIONS':
        return ''
    folder = os.path.join(LOG_DIR, logtype + 'log')
    if not os.path.isdir(folder):
        response.content_type = 'application/json'
        return json.dumps([])
    files = sorted(
        [f for f in os.listdir(folder) if f.endswith('.txt')],
        reverse=True
    )
    response.content_type = 'application/json'
    return json.dumps(files)

# ── Читання лог-файлу (GET /logs/<logtype>/<filename>) ────────
@route('/logs/<logtype>/<filename>', method=['GET', 'OPTIONS'])
def read_log(logtype, filename):
    response.set_header('Access-Control-Allow-Origin', '*')
    if request.method == 'OPTIONS':
        return ''
    # Дозволяємо тільки безпечні імена: цифри, літери, дефіс, крапка
    if not re.match(r'^[\w\-\.]+\.txt$', filename):
        response.status = 400
        response.content_type = 'application/json'
        return json.dumps({"error": "invalid filename"})
    folder   = os.path.join(LOG_DIR, logtype + 'log')
    filepath = os.path.join(folder, filename)
    # Захист від path traversal
    if not os.path.abspath(filepath).startswith(os.path.abspath(folder) + os.sep):
        response.status = 403
        response.content_type = 'application/json'
        return json.dumps({"error": "forbidden"})
    if not os.path.isfile(filepath):
        response.status = 404
        response.content_type = 'application/json'
        return json.dumps({"error": "not found"})
    response.content_type = 'text/plain; charset=utf-8'
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

# ── Завантаження аудіо (POST /upload-audio) ──────────────────
@route('/upload-audio', method=['POST', 'OPTIONS'])
def upload_audio():
    response.set_header('Access-Control-Allow-Origin', '*')
    response.set_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.set_header('Access-Control-Allow-Headers', 'Content-Type, X-Module, X-Session, X-Filename')

    if request.method == 'OPTIONS':
        return ''  # preflight CORS

    try:
        module     = request.headers.get('X-Module', 'chat')
        session_id = request.headers.get('X-Session', 'unknown')
        x_filename = request.headers.get('X-Filename', '').strip()
        # Sanitize: лише літери, цифри, дефіс, підкреслення
        module     = re.sub(r'[^\w\-]', '', module)[:32]
        session_id = re.sub(r'[^\w\-]', '', session_id)[:16]

        audio_data = request.body.read()
        if not audio_data:
            response.status = 400
            response.content_type = 'application/json'
            return json.dumps({"error": "empty audio"})

        # Ліміт 50 МБ — захист від випадкових великих файлів
        MAX_BYTES = 50 * 1024 * 1024
        if len(audio_data) > MAX_BYTES:
            response.status = 413
            response.content_type = 'application/json'
            return json.dumps({"error": "file too large"})

        folder = os.path.join(LOG_DIR, 'audio', module)
        os.makedirs(folder, exist_ok=True)

        # Якщо фронтенд передав ім'я файлу — використовуємо його (з sanitize),
        # інакше генеруємо з часу та session_id
        if x_filename and re.match(r'^[\w\-\.]+\.webm$', x_filename):
            safe_name = x_filename[:128]
        else:
            now       = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
            safe_name = f'{now}_{session_id}.webm'
        fname = os.path.join(folder, safe_name)

        with open(fname, 'wb') as f:
            f.write(audio_data)

        response.content_type = 'application/json'
        return json.dumps({"ok": True, "file": os.path.relpath(fname, LOG_DIR)})

    except Exception as e:
        response.status = 500
        response.content_type = 'application/json'
        return json.dumps({"error": str(e)})

# ── Список аудіо-файлів (GET /audio/<module>) ─────────────────
@route('/audio/<module>', method=['GET', 'OPTIONS'])
def list_audio(module):
    response.set_header('Access-Control-Allow-Origin', '*')
    if request.method == 'OPTIONS':
        return ''
    module = re.sub(r'[^\w\-]', '', module)[:32]
    folder = os.path.join(LOG_DIR, 'audio', module)
    if not os.path.isdir(folder):
        response.content_type = 'application/json'
        return json.dumps([])
    files = sorted(
        [f for f in os.listdir(folder) if f.endswith('.webm')],
        reverse=True
    )
    response.content_type = 'application/json'
    return json.dumps(files)

# ── Pollinations image proxy (POST /pol-image) ───────────────
# Браузер надсилає: { prompt, model?, seed?, width?, height? }
# Роут передає запит до image.pollinations.ai і повертає зображення.
# Токен береться з env POLLINATIONS_TOKEN або з тіла запиту (поле token).
@route('/pol-image', method=['POST', 'OPTIONS'])
def pol_image_proxy():
    response.set_header('Access-Control-Allow-Origin', '*')
    response.set_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.set_header('Access-Control-Allow-Headers', 'Content-Type')

    if request.method == 'OPTIONS':
        return ''

    try:
        data   = request.json or {}
        prompt = data.get('prompt', '').strip()
        if not prompt:
            response.status = 400
            response.content_type = 'application/json'
            return json.dumps({"error": "prompt is required"})

        model  = data.get('model',  'flux')
        seed   = int(data.get('seed',   0))
        width  = int(data.get('width',  480))
        height = int(data.get('height', 320))

        # Токен: env змінна пріоритетна, потім з запиту (для сумісності)
        token = os.environ.get('POLLINATIONS_TOKEN', '').strip() or data.get('token', '').strip()

        import urllib.parse
        params = f'width={width}&height={height}&seed={seed}&nologo=true&model={model}'
        if token:
            params += f'&token={urllib.parse.quote(token)}'

        url = f'https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?{params}'

        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw          = resp.read()
            content_type = resp.headers.get('Content-Type', 'image/jpeg')

        response.content_type = content_type
        return raw

    except urllib.error.HTTPError as e:
        response.status = e.code
        response.content_type = 'application/json'
        try:
            body = e.read().decode()
        except Exception:
            body = str(e)
        return json.dumps({"error": body})

    except Exception as e:
        response.status = 500
        response.content_type = 'application/json'
        return json.dumps({"error": str(e)})


# ── HuggingFace proxy (POST /hf-proxy) ───────────────────────
# Браузер не може викликати HF API через CORS — цей роут діє як посередник.
# Фронтенд надсилає: { model, inputs, parameters? }
# Роут перенаправляє запит до HF і повертає відповідь клієнту.
@route('/hf-proxy', method=['POST', 'OPTIONS'])
def hf_proxy():
    response.set_header('Access-Control-Allow-Origin', '*')
    response.set_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.set_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if request.method == 'OPTIONS':
        return ''  # preflight CORS

    try:
        data  = request.json or {}
        model = data.get('model', '').strip()
        if not model or not re.match(r'^[\w\-\.\/]+$', model):
            response.status = 400
            response.content_type = 'application/json'
            return json.dumps({"error": "invalid or missing model"})

        # Беремо HF_TOKEN з env або з тіла запиту (якщо переданий фронтендом)
        hf_token = os.environ.get('HF_TOKEN', '') or data.get('hf_token', '')

        payload = {}
        if 'inputs' in data:
            payload['inputs'] = data['inputs']
        if 'parameters' in data:
            payload['parameters'] = data['parameters']

        url     = f'https://api-inference.huggingface.co/models/{model}'
        headers = {'Content-Type': 'application/json'}
        if hf_token:
            headers['Authorization'] = f'Bearer {hf_token}'

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw          = resp.read()
            content_type = resp.headers.get('Content-Type', 'application/json')

        response.content_type = content_type
        return raw

    except urllib.error.HTTPError as e:
        response.status = e.code
        response.content_type = 'application/json'
        try:
            body = e.read().decode()
        except Exception:
            body = str(e)
        return json.dumps({"error": body})

    except Exception as e:
        response.status = 500
        response.content_type = 'application/json'
        return json.dumps({"error": str(e)})


# ── AI проксі ────────────────────────────────────────────────
# Ключі задаються env-змінними на роутері:
#   OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY
# Фронтенд викликає /ai/<provider>/... замість прямих API URL.

_AI_CFG = {
    'openai':    {'base': 'https://api.openai.com',                         'env': 'OPENAI_API_KEY'},
    'anthropic': {'base': 'https://api.anthropic.com',                      'env': 'ANTHROPIC_API_KEY'},
    'google':    {'base': 'https://generativelanguage.googleapis.com',       'env': 'GOOGLE_API_KEY'},
}

@route('/ai/keys', method=['GET', 'OPTIONS'])
def ai_keys():
    response.set_header('Access-Control-Allow-Origin', '*')
    response.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
    if request.method == 'OPTIONS':
        return ''
    result = {p: bool(os.environ.get(cfg['env'], '').strip()) for p, cfg in _AI_CFG.items()}
    response.content_type = 'application/json'
    return json.dumps(result)

@route('/ai/<provider>/<path:path>', method=['POST', 'GET', 'OPTIONS'])
def ai_proxy(provider, path):
    response.set_header('Access-Control-Allow-Origin', '*')
    response.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    response.set_header('Access-Control-Allow-Headers', 'Content-Type, anthropic-version')

    if request.method == 'OPTIONS':
        return ''

    if provider not in _AI_CFG:
        response.status = 400
        response.content_type = 'application/json'
        return json.dumps({'error': f'unknown provider: {provider}'})

    cfg     = _AI_CFG[provider]
    api_key = os.environ.get(cfg['env'], '').strip()
    if not api_key:
        response.status = 503
        response.content_type = 'application/json'
        return json.dumps({'error': f"{cfg['env']} not set on server"})

    # URL: зберігаємо query-параметри крім key= (Google); ключ додаємо серверний
    qs = dict(urllib.parse.parse_qsl(request.query_string))
    qs.pop('key', None)
    if provider == 'google':
        qs['key'] = api_key

    target = cfg['base'] + '/' + path
    if qs:
        target += '?' + urllib.parse.urlencode(qs)

    # Headers
    hdrs = {'Content-Type': request.content_type or 'application/json'}
    if provider == 'openai':
        hdrs['Authorization'] = f'Bearer {api_key}'
    elif provider == 'anthropic':
        hdrs['x-api-key']          = api_key
        hdrs['anthropic-version']  = '2023-06-01'

    body = request.body.read() or None

    try:
        req = urllib.request.Request(target, data=body, headers=hdrs, method=request.method)
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = resp.read()
            ct  = resp.headers.get('Content-Type', 'application/json')
        response.content_type = ct
        return raw

    except urllib.error.HTTPError as e:
        response.status = e.code
        response.content_type = 'application/json'
        try:
            err_body = e.read().decode('utf-8', errors='replace')
        except Exception:
            err_body = str(e)
        return json.dumps({'error': err_body})

    except Exception as e:
        response.status = 500
        response.content_type = 'application/json'
        return json.dumps({'error': str(e)})

# ── Статус логів (/logs/status) ───────────────────────────────
@route('/logs/status', method=['GET', 'OPTIONS'])
def logs_status():
    response.set_header('Access-Control-Allow-Origin', '*')
    if request.method == 'OPTIONS':
        return ''

    result = {
        'user_dir':         USER_DIR,
        'port':             PORT,
        'log_dir':          LOG_DIR,
        'log_dir_exists':   os.path.isdir(LOG_DIR),
        'log_dir_writable': os.access(LOG_DIR, os.W_OK),
        'logtypes':         {},
    }

    for logtype in ('tech', 'study', 'audio'):
        folder = os.path.join(LOG_DIR, logtype + ('log' if logtype != 'audio' else ''))
        entry  = {
            'path':     folder,
            'exists':   os.path.isdir(folder),
            'writable': os.access(folder, os.W_OK) if os.path.isdir(folder) else False,
            'files':    [],
        }
        if os.path.isdir(folder):
            ext   = '.txt' if logtype != 'audio' else '.webm'
            files = sorted([f for f in os.listdir(folder) if f.endswith(ext)], reverse=True)[:5]
            for fname in files:
                fpath = os.path.join(folder, fname)
                try:
                    sz = os.path.getsize(fpath)
                    mt = datetime.fromtimestamp(os.path.getmtime(fpath)).strftime('%Y-%m-%d %H:%M:%S')
                    lines = 0
                    if logtype != 'audio':
                        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
                            lines = sum(1 for _ in f)
                    entry['files'].append({'name': fname, 'size_bytes': sz, 'lines': lines, 'modified': mt})
                except Exception as ex:
                    entry['files'].append({'name': fname, 'error': str(ex)})
        result['logtypes'][logtype] = entry

    response.content_type = 'application/json'
    return json.dumps(result, ensure_ascii=False, indent=2)

# ── Статичні файли (має бути ОСТАННІМ роутом) ─────────────────
@route('/<filename:path>')
def static_files(filename):
    return static_file(filename, root=BASE_DIR)

# ── Запуск ────────────────────────────────────────────────────
os.makedirs(LOG_DIR, exist_ok=True)
print(f"[SpanishHub] Starting user={USER_DIR} port={PORT} dir={BASE_DIR} log_dir={LOG_DIR}")
run(host='0.0.0.0', port=PORT, debug=False, quiet=True)
