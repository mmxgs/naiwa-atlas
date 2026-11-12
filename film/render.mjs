/**
 * 渲染器：给定时间点渲染单帧。
 *   node render.mjs --stills 1.2,3.0,6.5     → out/stills/*.png
 *   node render.mjs --from 0 --to 80 --fps 30 → out/frames.mp4（全片）
 *   node render.mjs --from 0 --to 8          → 只渲一段，调试用
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const { REPO, resolveBrowser, resolveFfmpeg } = require('./browser.cjs');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = REPO;
const FILM = path.join(ROOT, 'film');
const PORT = 8900 + Math.floor(Math.random() * 80);
const ENTRY = process.argv.includes('--entry') ? process.argv[process.argv.indexOf('--entry')+1] : 'film.html';
const W = 1080, H = 1920;

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
      if (u === '/') u = '/film/src/film.html';
      const f = path.join(ROOT, u);
      fs.readFile(f, (e, d) => {
        if (e) { rq.writeHead(404); rq.end('nf'); return; }
        rq.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        rq.end(d);
      });
    });
    s.listen(PORT, '127.0.0.1', () => res(s));
  });
}

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const has = k => args.includes(k);

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    executablePath: resolveBrowser(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none',
           '--force-color-profile=srgb', '--disable-lcd-text'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  page.on('response', r => { if (r.status() >= 400) console.error('HTTP', r.status(), r.url()); });
  page.on('requestfailed', r => console.error('REQFAIL', r.url(), r.failure()?.errorText));

  await page.goto(`http://127.0.0.1:${PORT}/film/src/${ENTRY}`, { waitUntil: 'networkidle0', timeout: 90000 });
  await page.waitForFunction('window.__READY__ === true', { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 600));

  const meta = await page.evaluate(() => window.FILM);
  const DUR = meta.DUR, FPS = meta.FPS;

  // ── 模式 A：单帧/联系表 ──────────────────────────────
  if (has('--stills')) {
    const times = arg('--stills').split(',').map(Number);
    const dir = path.join(FILM, 'out', 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (const t of times) {
      await page.evaluate(tt => window.renderAt(tt), t);
      await new Promise(r => setTimeout(r, 90));
      const f = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
      await page.screenshot({ path: f, type: 'png' });
      console.log('still', t, '->', path.basename(f));
    }
    await browser.close(); server.close();
    return;
  }

  // ── 模式 B：全片/片段 ────────────────────────────────
  const from = Number(arg('--from', 0));
  const to = Number(arg('--to', DUR));
  const fps = Number(arg('--fps', FPS));
  const scale = Number(arg('--scale', 1));
  const outName = arg('--out', `video_${from}_${to}.mp4`);
  const outPath = path.join(FILM, 'out', outName);
  fs.mkdirSync(path.join(FILM, 'out'), { recursive: true });

  if (scale !== 1) {
    await page.evaluate(s => {
      const st = document.getElementById('stage');
      st.style.transform = `scale(${s})`;
      st.style.transformOrigin = '0 0';
    }, scale);
    await page.setViewport({ width: Math.round(W * scale), height: Math.round(H * scale), deviceScaleFactor: 1 });
  }

  const total = Math.round((to - from) * fps);
  console.log(`render ${from}s → ${to}s @${fps}fps = ${total} frames, scale ${scale}`);

  const ff = spawn(resolveFfmpeg(), [
    '-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', outPath,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const ffDone = new Promise((res, rej) => {
    ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)));
  });

  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const t = from + i / fps;
    await page.evaluate(tt => window.renderAt(tt), t);
    const buf = await page.screenshot({ type: 'png', optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      const eta = i > 0 ? el / i * (total - i) : 0;
      console.log(`  ${i}/${total}  ${(el / Math.max(i, 1) * 1000).toFixed(0)}ms/frame  eta ${eta.toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  await ffDone;
  console.log('done →', outPath);

  await browser.close(); server.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
