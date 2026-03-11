from bottle import route, run, static_file, response, request
import os
import sys
import json
from datetime import datetime

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
# За замовчуванням — корінь проекту, тому studylog/techlog будуть поруч з іншими файлами.
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

        today = datetime.now().strftime('%d.%m')
        fname = os.path.join(folder, f'{module}+{today}.txt')

        with open(fname, 'a', encoding='utf-8') as f:
            f.write(line + '\n')

        response.content_type = 'application/json'
        return json.dumps({"ok": True})

    except Exception as e:
        response.status = 500
        response.content_type = 'application/json'
        return json.dumps({"error": str(e)})

# ── Статичні файли (має бути ОСТАННІМ роутом) ─────────────────
@route('/<filename:path>')
def static_files(filename):
    return static_file(filename, root=BASE_DIR)

# ── Запуск ────────────────────────────────────────────────────
print(f"[SpanishHub] Starting user={USER_DIR} port={PORT} dir={BASE_DIR} log_dir={LOG_DIR}")
run(host='0.0.0.0', port=PORT, debug=False, quiet=True)
