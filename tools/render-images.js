// Рендер служебных картинок сайта через Playwright (Chromium):
//   assets/img/og.png        1200×630 — из tools/og-template.html
//   apple-touch-icon.png     180×180  — логотип из favicon.svg на фоне цвета бумаги
// Запуск из корня репозитория: node tools/render-images.js
// Путь к Chromium можно переопределить переменной CHROMIUM.
const path = require('path');
const { execSync } = require('child_process');
let pw; try { pw = require('playwright'); } catch (e) { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const root = path.resolve(__dirname, '..');
const url = f => 'file://' + path.join(root, f);
(async () => {
  const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await pw.chromium.launch(require('fs').existsSync(exe) ? { executablePath: exe } : {});
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.goto(url('tools/og-template.html'));
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: path.join(root, 'assets/img/og.png') });
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1, colorScheme: 'light' });
  const svg = require('fs').readFileSync(path.join(root, 'favicon.svg'), 'utf8').replace('<svg ', '<svg width="124" height="124" ').replace('stroke-width:8', 'stroke-width:6'); // на 180 px — ближе к логотипу в шапке
  await icon.setContent('<body style="margin:0;background:#F3F5F8;display:grid;place-items:center;width:180px;height:180px">' + svg + '</body>');
  await icon.screenshot({ path: path.join(root, 'apple-touch-icon.png') });
  await browser.close();
  console.log('ok: assets/img/og.png, apple-touch-icon.png');
})();
