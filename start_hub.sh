#!/bin/sh

# Затримка щоб завантажилися системні служби
sleep 10

# Зупиняємо всі попередні інстанси
killall python3 2>/dev/null
sleep 2

PYTHON=/opt/bin/python3
SCRIPT=/opt/share/nginx/html/main.py

# ── API ключі ─────────────────────────────────────────────────
# HuggingFace токен для /hf-proxy. Отримати: https://huggingface.co/settings/tokens
export HF_TOKEN=""

# ── Запуск інстансів ─────────────────────────────────────────
# Формат: python3 main.py <user_dir> <port>
# Логи кожного інстансу пишуться у власну директорію

$PYTHON $SCRIPT kvd 8080 >> /opt/share/nginx/html/kvd/log_auto.txt 2>&1 &
echo "Started kvd on port 8080 (PID $!)"

$PYTHON $SCRIPT kgd 8085 >> /opt/share/nginx/html/kgd/log_auto.txt 2>&1 &
echo "Started kgd on port 8085 (PID $!)"

$PYTHON $SCRIPT kov 8095 >> /opt/share/nginx/html/kov/log_auto.txt 2>&1 &
echo "Started kov on port 8095 (PID $!)"

$PYTHON $SCRIPT tst 8100 >> /opt/share/nginx/html/tst/log_auto.txt 2>&1 &
echo "Started tst on port 8100 (PID $!)"
