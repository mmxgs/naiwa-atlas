/**
 * 真实录屏：puppeteer 真实点击 + 逐帧截图。
 * 三个独立片段，剪辑时拼接。
 *   node record_ui.js
 * 输出 film/shots/ui/{filter,kmark,quiz}/*.jpg  + 每段 fps.json
 */
const puppeteer = require('puppeteer-core');
const { REPO, resolveBrowser } = require('./browser.cjs');
const path = require('path'); const http = require('http'); const fs = require('fs');

const ROOT = REPO;
const OUT = path.join(REPO, 'film/shots/ui');
const PORT = 8875;
const MIME = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
});

// 注入：点击波纹 + 隐藏滚动条
const INJECT = () => {
  const st = document.createElement('style');
  st.textContent = '::-webkit-scrollbar{display:none!important}html{scrollbar-width:none}';
  document.head.appendChild(st);
  window.__ripple = (x, y) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:18px;height:18px;margin:-9px 0 0 -9px;
      border-radius:50%;border:3px solid #E2342B;z-index:2147483647;pointer-events:none;
      box-shadow:0 0 0 2px rgba(255,255,255,.9);transition:all .42s cubic-bezier(.2,.8,.2,1);`;
    document.body.appendChild(d);
    requestAnimationFrame(() => {
      d.style.width = '96px'; d.style.height = '96px';
      d.style.margin = '-48px 0 0 -48px'; d.style.opacity = '0';
    });
    setTimeout(() => d.remove(), 620);
  };
};

const fps = 10;
const SPECS = JSON.parse(fs.readFileSync(path.join(REPO, 'film/data/specs.json'), 'utf8'));
async function record(page, dir, ms, events, label) {
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) { try { fs.unlinkSync(path.join(dir, f)); } catch (e) {} }
  const interval = 1000 / fps;
  const t0 = Date.now();
  let i = 0;
  const fired = new Set();
  const shots = [];
  while (Date.now() - t0 < ms) {
    const el = Date.now() - t0;
    // 到点触发事件
    for (let k = 0; k < events.length; k++) {
      if (!fired.has(k) && el >= events[k].at) { fired.add(k); events[k].fn().catch(() => {}); }
    }
    const s = Date.now();
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.jpg'), buf);
    shots.push(Date.now() - t0);
    i++;
    const spend = Date.now() - s;
    if (spend < interval) await new Promise(r => setTimeout(r, interval - spend));
  }
  const realFps = i / (ms / 1000);
  console.log(`  ${label}: ${i} 帧 / ${ms}ms → 实测 ${realFps.toFixed(1)} fps`);
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ frames: i, ms, realFps: +realFps.toFixed(2) }));
  return realFps;
}

// 在元素中心点击（带波纹）
async function tapAt(page, sel, offsetY = 0) {
  const box = await page.evaluate((s, oy) => {
    const el = typeof s === 'string' ? document.querySelector(s) : null;
    if (!el) return null;
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 + oy };
  }, sel, offsetY);
  if (!box) return false;
  await page.evaluate((s2, x, y) => {
    window.__ripple(x, y);
    const el = document.querySelector(s2);
    if (el) el.click();
  }, sel, box.x, box.y);
  return true;
}

// 按文字点击 chip
async function tapChip(page, text) {
  const box = await page.evaluate((t) => {
    const c = [...document.querySelectorAll('.chip')].find(e => e.textContent.trim().startsWith(t));
    if (!c) return null;
    c.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, text);
  if (!box) return false;
  await page.evaluate((x, y, t) => {
    window.__ripple(x, y);
    const c = [...document.querySelectorAll('.chip')].find(e => e.textContent.trim().startsWith(t));
    if (c) c.click();
  }, box.x, box.y, text);
  return true;
}

(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: resolveBrowser(),
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=2'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(INJECT);
  // 预热：滚到底再回顶，触发 lazy load
  await page.evaluate(() => new Promise(r => { scrollTo(0, document.body.scrollHeight); setTimeout(() => { scrollTo(0, 0); r(); }, 1600); }));
  await new Promise(r => setTimeout(r, 1600));

  console.log('=== A 筛选 ===');
  await page.evaluate(() => {
    const b = document.querySelector('.atlas-bar');
    b.scrollIntoView({ block: 'start', behavior: 'instant' });
    scrollBy(0, -120);
  });
  await new Promise(r => setTimeout(r, 900));
  await record(page, path.join(OUT, 'filter'), 3200, [
    { at: 900, fn: () => tapChip(page, '异形') },
  ], 'filter');

  console.log('=== B 打卡 ===');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.evaluate(() => { location.reload(); });
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2200));
  await page.evaluate(INJECT);
  await page.evaluate(() => {
    const c = document.querySelector('#spec-001');
    c.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 900));
  const before = await page.evaluate(() => {
    const b = document.querySelector('button.mark[data-id="001"]');
    return { cls: b ? b.className : null, txt: b ? b.textContent.trim() : null };
  });
  console.log('  before:', JSON.stringify(before));
  await record(page, path.join(OUT, 'kmark'), 3000, [
    { at: 800, fn: () => tapAt(page, 'button.mark[data-id="001"]') },
  ], 'kmark');
  const after = await page.evaluate(() => {
    const b = document.querySelector('button.mark[data-id="001"]');
    return { cls: b ? b.className : null, txt: b ? b.textContent.trim() : null };
  });
  console.log('  after :', JSON.stringify(after));

  console.log('=== C 自测 ===');
  await page.evaluate(() => {
    document.getElementById('quiz').scrollIntoView({ block: 'start', behavior: 'instant' });
    scrollBy(0, -80);
  });
  await new Promise(r => setTimeout(r, 900));
  await record(page, path.join(OUT, 'quiz'), 5200, [
    { at: 700, fn: () => tapAt(page, '#qStart') },
    {
      at: 2400, fn: async () => {
        // 从当前题目图片反查正确标本名，再点对应选项（保证"答对"）
        const ans = await page.evaluate((specs) => {
          const src = (document.getElementById('qImg') || {}).getAttribute
            ? document.getElementById('qImg').getAttribute('src') : '';
          if (!src) return null;
          const img = src.replace(/^assets\//, '');
          const hits = specs.filter(s => s.img === img);
          return hits.length === 1 ? hits[0].name : null;
        }, SPECS);
        const box = await page.evaluate((name) => {
          const all = [...document.querySelectorAll('.opt')];
          const b = name ? all.find(x => x.dataset.v === name) : null;
          const o = b || all[0];
          if (!o) return null;
          o.scrollIntoView({ block: 'center', behavior: 'instant' });
          const r = o.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, ans);
        if (!box) return;
        console.log('    quiz 目标答案:', ans || '(反查失败，取第一项)');
        await page.evaluate((x, y, name) => {
          window.__ripple(x, y);
          const all = [...document.querySelectorAll('.opt')];
          const b = name ? all.find(z => z.dataset.v === name) : all[0];
          if (b) b.click();
        }, box.x, box.y, ans);
      }
    },
  ], 'quiz');

  await browser.close(); server.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
