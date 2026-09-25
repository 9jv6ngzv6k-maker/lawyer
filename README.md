# Халбаев и партнёры — сайт

Одностраничный сайт юриста по спорам военнослужащих (выплаты при ранении, ВВК, МСЭ, жильё, банкротство).
Перенесён из артефакта Cowork «Халбаев и партнёры»: однофайловый HTML (≈4 МБ со встроенными шрифтами и видео) разложен на обычные исходники. Вёрстка и поведение не менялись.

## Структура

```
index.html               разметка страницы (секции, шаблоны дел, форма заявки)
assets/css/site.css      все стили + @font-face
assets/js/data.js        контент: направления, дела, вопросы (window.SITE)
assets/js/background.js  видео-подложка: выбор кодека, параллакс, пауза во фоне
assets/js/volumes.js     анимация «томов» (штампы, раскрытие)
assets/js/app.js         основная логика: навигация, модалки, реестр дел, форма
assets/fonts/            Playfair Display, EB Garamond, Onest, JetBrains Mono (woff2, кириллица + латиница)
assets/img/poster.jpg    постер видео-подложки
assets/img/og.png        картинка для соцсетей (Open Graph / Twitter), 1200×630
assets/video/            bg.webm (VP9), bg.mp4 и bg-small.mp4 (H.264, для ширины ≤700px)
404.html                 страница «не найдено» (лёгкая, те же шрифты и цвета)
favicon.svg              иконка сайта (щит с мечами из логотипа; светлая/тёмная тема)
apple-touch-icon.png     иконка 180×180 для iOS / закладок
site.webmanifest         манифест (название, цвета, иконки)
robots.txt, sitemap.xml  для поисковиков (домен — плейсхолдер, см. «Публикация»)
.github/workflows/pages.yml  публикация на GitHub Pages
tools/split_artifact.py  скрипт, которым артефакт разобран на файлы
tools/og-template.html   шаблон картинки og.png
tools/render-images.js   рендер og.png и apple-touch-icon.png (Playwright)
```

## Запуск

Сборка не нужна — это статический сайт:

```sh
python3 -m http.server 8000
# открыть http://localhost:8000
```

## Публикация

### 1. Домен

Домен пока неизвестен — везде стоит плейсхолдер `https://example.ru`. Он встречается только в этих файлах:

- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, JSON-LD (`@id`, `url`, `image`, `logo`);
- `robots.txt` — строка `Sitemap:`;
- `sitemap.xml` — `<loc>`.

Заменить одной командой из корня репозитория (подставьте свой домен, без `/` в конце):

```sh
sed -i 's#https://example.ru#https://ваш-домен.ru#g' index.html robots.txt sitemap.xml
grep -rn 'example.ru' index.html robots.txt sitemap.xml   # проверка: пусто
```

Остальные ссылки на сайте относительные и от домена не зависят. Исключение — `404.html`: её ресурсы и ссылка «На главную» идут от корня (`/`), потому что страница открывается по любому несуществующему адресу. Поэтому сайт рассчитан на публикацию в корне домена (свой домен), а не в подпапке вида `user.github.io/lawyer/` — там у 404 не подгрузятся шрифты и ссылка на главную уведёт в корень `github.io`.

### 2. GitHub Pages

Workflow `.github/workflows/pages.yml` публикует сайт при пуше в ветку `main` (или вручную: Actions → Pages → Run workflow). Сборки нет; в публикацию копируются только файлы сайта: `index.html`, `404.html`, `assets/`, иконки, `site.webmanifest`, `robots.txt`, `sitemap.xml`, `.nojekyll`. Служебное (`variants/`, `docs/`, `tools/`, `orig.html`, `.claude/`, `CLAUDE.md`, README) наружу не попадает. Если появится новая страница (например, отдельная политика) — добавьте её в список `cp` в workflow и в `sitemap.xml`.

Однократно в настройках репозитория:

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Settings → Pages → Custom domain: ввести домен; у регистратора — DNS-записи по инструкции GitHub (A/AAAA на адреса GitHub Pages для корня домена или CNAME на `<user>.github.io` для поддомена). После проверки DNS включить **Enforce HTTPS**.
3. Создать ветку `main` (или влить в неё рабочую ветку) — после пуша сайт опубликуется.

`.nojekyll` отключает Jekyll, если сайт когда-нибудь будут публиковать режимом «Deploy from a branch».

### 3. Поисковики

- **Яндекс Вебмастер** (webmaster.yandex.ru): добавить сайт, подтвердить права (мета-тег или HTML-файл — положить в корень и добавить в список `cp` workflow), в «Индексирование → Файлы Sitemap» указать `https://домен/sitemap.xml`. Регион — «Россия» (работа по всей России).
- **Google Search Console**: добавить ресурс, подтвердить (DNS-запись или мета-тег), отправить sitemap.
- Проверить разметку: validator.schema.org (или «Валидатор микроразметки» в Вебмастере) и Rich Results Test; картинку для соцсетей — отладчиком ссылок Telegram/VK после публикации.

### Картинки для соцсетей и иконки

`assets/img/og.png` и `apple-touch-icon.png` рендерятся из `tools/og-template.html` и `favicon.svg`. После правки шаблона или логотипа:

```sh
node tools/render-images.js   # нужен Playwright с Chromium
```

Для публикации подойдёт и любой другой статический хостинг (Netlify, Vercel, nginx) — выложить те же файлы сайта в корень домена и настроить 404 на `404.html`.

## Форма заявки

Форма `#lead` проверяет поля и открывает почтовый клиент (`mailto:yujiklop74@yandex.ru`) с готовым текстом заявки; есть кнопка «Скопировать текст». Серверной отправки нет — адрес и логика в `assets/js/app.js` (обработчик `submit`).

## Обновление из новой версии артефакта

```sh
python3 tools/split_artifact.py путь/к/артефакту.html .
```

Скрипт перезаписывает `index.html` и `assets/js/*.js`. После импорта верните доработки под публикацию (сравните с `git diff`): блок SEO в `<head>` (title, description, canonical, Open Graph, JSON-LD, иконки, preload шрифтов), атрибуты постера (`width`/`height`/`fetchpriority`), отложенный старт видео в `assets/js/background.js` и ловушку фокуса меню в `assets/js/app.js`. FAQ в JSON-LD должен дословно совпадать с секцией «Вопросы».
