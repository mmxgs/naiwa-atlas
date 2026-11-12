/**
 * 长图截图：把 poster.html 整页截成一张 PNG。
 *   node shoot_poster.js            → out/naiwa_atlas_poster.png (2x)
 *   node shoot_poster.js --scale 1  → 1x
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const { REPO, resolveBrowser } = require('./browser.cjs');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = REPO;
const OUT = path.join(ROOT, 'film/out');
const PORT = 8900 + Math.floor(Math.random() * 80);
const W = 1080;

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SCALE = parseFloat(arg('--scale', '2'));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp4': 'video/mp4',
};

function serve() {
  return new Promise(res => {
    const s = http.createServer((req, rq) => {
      let u = decodeURIComponent(req.url.split('?')[0]);
      if (u === '/') u = '/film/src/poster.html';
      const f = path.join(ROOT, u);
      fs.readFile(f, (e, d) => {
        if (e) { rq.writeHead(404); rq.end('nf'); return; }
        rq.writeHead(200, {
          'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        });
        rq.end(d);
      });
    });
    s.listen(PORT, '127.0.0.1', () => res(s));
  });
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    executablePath: resolveBrowser(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none',
           '--force-color-profile=srgb', '--disable-lcd-text'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: 1600, deviceScaleFactor: SCALE });

  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));

  await page.goto(`http://127.0.0.1:${PORT}/film/src/poster.html`, { waitUntil: 'networkidle0' });

  // 等脚本把图都排完
  try {
    await page.waitForFunction('window.__ready === true', { timeout: 30000 });
  } catch {
    console.warn('WARN: __ready 未置位，按已加载内容截图');
  }
  await new Promise(r => setTimeout(r, 600));

  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`画布 ${W} × ${h}（${SCALE}x 输出 ${W * SCALE} × ${h * SCALE}）`);

  const file = path.join(OUT, 'naiwa_atlas_poster.png');
  await page.screenshot({ path: file, fullPage: true, type: 'png', captureBeyondViewport: true });

  const stat = fs.statSync(file);
  console.log(`done → ${file}`);
  console.log(`      ${(stat.size / 1048576).toFixed(2)} MB`);

  // 同时出一张压缩预览（长图整张缩到宽 620，方便快速看版式）
  await browser.close();
  server.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
