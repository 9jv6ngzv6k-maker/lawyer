#!/usr/bin/env python3
"""Разбирает однофайловый артефакт сайта на исходники проекта.

Использование: python3 tools/split_artifact.py path/to/artifact.html [out_dir]

Шрифты, картинка-постер и видео из base64 выносятся в assets/,
CSS и JS — в отдельные файлы, index.html ссылается на них.
"""
import base64, hashlib, re, sys
from pathlib import Path

src = Path(sys.argv[1]).read_text(encoding="utf-8")
out = Path(sys.argv[2] if len(sys.argv) > 2 else ".")
for d in ("assets/css", "assets/js", "assets/fonts", "assets/img", "assets/video"):
    (out / d).mkdir(parents=True, exist_ok=True)

def write_bin(rel, b64):
    (out / rel).write_bytes(base64.b64decode(b64))
    return rel

# 1. Обёртка хостинга артефактов: её reset-стили сохраняем как базовые.
m = re.match(r'<!doctype html><html><head>.*?<style>(.*?)</style></head><body>', src, re.S)
wrapper_css = m.group(1)
body = src[m.end():]

# 2. Видео из <script type="application/octet-stream" id="vbg-*">.
videos = {"vbg-webm": "assets/video/bg.webm", "vbg-mp4": "assets/video/bg.mp4",
          "vbg-mp4s": "assets/video/bg-small.mp4"}
def vid(mm):
    write_bin(videos[mm.group(1)], mm.group(2).strip())
    return ""
body = re.sub(r'<script type="application/octet-stream" id="(vbg-[a-z0-9]+)">(.*?)</script>', vid, body, flags=re.S)

# Загрузчик видео: вместо декодирования base64 — обычные URL.
old_b64 = "function b64(id){var el=D.getElementById(id);return el?el.textContent.trim():'';}"
assert old_b64 in body
body = body.replace(old_b64, "var VIDEO={'vbg-webm':'"+videos["vbg-webm"]+"','vbg-mp4':'"+videos["vbg-mp4"]+"','vbg-mp4s':'"+videos["vbg-mp4s"]+"'};\nfunction b64(id){return VIDEO[id]||'';}")
old_blob = "try{var bin=atob(src),n=bin.length,u=new Uint8Array(n);for(var i=0;i<n;i++)u[i]=bin.charCodeAt(i);v.src=URL.createObjectURL(new Blob([u],{type:type}));}catch(e){return;}"
assert old_blob in body
body = body.replace(old_blob, "var so=D.createElement('source');so.src=src;so.type=type;v.appendChild(so);")

# 3. Постер (jpeg).
imgs = iter(["assets/img/poster.jpg"] + [f"assets/img/image-{i}.jpg" for i in range(2, 50)])
body = re.sub(r'data:image/jpeg;base64,([A-Za-z0-9+/=]+)', lambda mm: write_bin(next(imgs), mm.group(1)), body)

# 4. Шрифты: имя по семейству/начертанию + короткий хеш.
def font(mm):
    rule = mm.group(0)
    fam = re.search(r"font-family:'([^']+)'", rule).group(1).lower().replace(" ", "-")
    sty = re.search(r"font-style:(\w+)", rule).group(1)
    wt = re.search(r"font-weight:([\d ]+)", rule).group(1).replace(" ", "-")
    data = re.search(r'base64,([A-Za-z0-9+/=]+)', rule).group(1)
    name = f"{fam}-{sty}-{wt}-{hashlib.sha1(data.encode()).hexdigest()[:8]}.woff2"
    write_bin("assets/fonts/" + name, data)
    return re.sub(r'url\(data:font/woff2;base64,[A-Za-z0-9+/=]+\)', f"url(../fonts/{name})", rule)
body = re.sub(r'@font-face\{[^}]*\}', font, body)

# 5. Head: всё до первого видимого элемента.
head_end = body.index('<style')
head = body[:head_end]
body = body[head_end:]

# 6. Главный <style> → site.css.
sm = re.match(r'<style>(.*?)</style>', body, re.S)
(out / "assets/css/site.css").write_text(
    "/* База (прежде задавалась обёрткой артефакта) */\n" + wrapper_css + "\n\n" + sm.group(1).strip() + "\n", encoding="utf-8")
body = body[sm.end():]

# 7. Скрипты тела страницы → отдельные файлы (порядок сохраняется).
names = iter(["data.js", "background.js", "volumes.js", "app.js"] + [f"script-{i}.js" for i in range(5, 50)])
def js(mm):
    code = mm.group(1)
    if code.strip().startswith("window.SITE="):
        name = "data.js"
    else:
        name = next(n for n in names if n != "data.js")
    (out / "assets/js" / name).write_text(code.strip() + "\n", encoding="utf-8")
    return f'<script src="assets/js/{name}"></script>'
body = re.sub(r'<script>(.*?)</script>', js, body, flags=re.S)
body = re.sub(r'\s*</body></html>\s*$', "\n</body>\n</html>\n", body)

head = head.replace('<meta charset="utf-8">', '').strip()
html = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n' + head +
        '\n<link rel="preload" href="assets/img/poster.jpg" as="image">'
        '\n<link rel="stylesheet" href="assets/css/site.css">\n</head>\n<body>\n' + body.lstrip())
(out / "index.html").write_text(html, encoding="utf-8")
print("ok")
