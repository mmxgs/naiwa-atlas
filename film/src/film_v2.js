/* 《奶娃图鉴》V2 · 52 秒 / 6 幕 · 每帧是 t 的纯函数 */
const W = 1080, H = 1920, DUR = 52.0, FPS = 30;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const p = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeOut4 = k => 1 - Math.pow(1 - k, 4);
const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const backOut = k => { const c = 2.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
function rnd(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

const $ = s => document.querySelector(s);
const mk = (tag, cls, html, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
};
function place(el, { x = 0, y = 0, w = null, rot = 0, scale = 1, op = 1, z = 1 } = {}) {
  el.style.position = 'absolute';
  if (w != null) el.style.width = w + 'px';
  el.style.left = x + 'px'; el.style.top = y + 'px';
  el.style.transformOrigin = 'center center';
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`;
  el.style.opacity = op; el.style.zIndex = z;
}

let SPECS = [];
const A = f => `/film/app/assets/${f}`;
const byId = id => SPECS.find(s => s.id === id) || {};
const imgOf = id => A(byId(id).img || 'figure01_3.webp');

/* ── 字幕表 ─────────────────────────────────────── */
const SUBS = [
  [0.55, 3.05, '朋友发来一份复习资料。'],
  [3.25, 3.96, '打开，是七十五只奶蛙。'],
  [4.30, 7.05, '有人把它当成一门学科在学。'],
  [7.30, 9.60, '而且，是真的在学。'],
  [9.85, 12.60, '所以它被编成了一本教材。'],
  [12.85, 15.85, '课程、图号、出处，一样不少。'],
  [16.25, 20.40, '七十五种变体，每一个都有编号。'],
  [20.75, 24.80, '越往后，形体剩得越少。'],
  [25.10, 28.60, '但只要眼睛和笑还在，它就还是它。'],
  [29.35, 32.40, '这份东西，推倒重做了四次。'],
  [32.75, 35.90, '从研究，到课程，到图鉴。'],
  [36.20, 40.50, '其中一版，连文件都没留下。'],
  [41.20, 43.30, '能筛。'],
  [43.80, 45.90, '能打卡。'],
  [46.30, 48.80, '还能考。'],
];

/* ══════════════ 幕1 · 钩子 0–4 ══════════════ */
const A1 = {
  t0: 0, t1: 4.0,
  build(r) {
    r.innerHTML = '';
    // PDF 图标
    const pdf = mk('div', '', `
      <div style="width:250px;height:320px;background:var(--red);position:relative;
        display:flex;align-items:flex-end;justify-content:center;padding-bottom:16px;
        box-shadow:0 0 0 8px #fff, 10px 12px 0 rgba(43,38,32,.18), 0 24px 50px rgba(43,38,32,.26)">
        <span class="mono" style="font-size:34px;color:#fff">PDF</span>
        <div style="position:absolute;right:0;top:0;width:0;height:0;
          border-left:64px solid var(--paper);border-bottom:64px solid #B32219"></div>
      </div>`, r);
    place(pdf, { x: W / 2, y: 820, op: 0 });
    const cap = mk('div', 'mono', '期中复习资料-1副本.pdf<br><span style="font-size:22px;opacity:.7">18.5 MB</span>', r);
    place(cap, { x: W / 2, y: 1090, w: 760, op: 0 });
    cap.style.textAlign = 'center'; cap.style.fontSize = '34px'; cap.style.lineHeight = '1.7';
    cap.style.color = 'var(--ink2)';
    A1.el = { pdf, cap };

    // 12 张闪现
    const ids = ['013', '014', '021', '012', '009', '008', '011', '022', '026', '045', '047', '050'];
    A1.flash = ids.map((id, i) => {
      const box = mk('div', '', '', r);
      box.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0;';
      const im = mk('div', '', '', box);
      const sz = 560 + rnd(i * 3) * 420;
      im.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;
        left:${(rnd(i * 7) * 460 + 60)}px;top:${(rnd(i * 11) * 900 + 260)}px;
        background:#fff;box-shadow:0 0 0 8px #fff, 0 18px 40px rgba(43,38,32,.3);overflow:hidden`;
      im.innerHTML = `<img src="${imgOf(id)}" style="width:100%;height:100%;object-fit:cover">`;
      return box;
    });

    // 收拢的书 + 75
    const book = mk('div', '', '', r);
    place(book, { x: W / 2, y: 800, op: 0 });
    book.style.cssText += `width:640px;height:810px;background:#fff;
      box-shadow:0 0 0 8px #fff, 22px 24px 0 rgba(43,38,32,.16), 0 40px 80px rgba(43,38,32,.26);
      overflow:hidden;`;
    book.innerHTML = `<img src="/film/shots/m_cover.png" style="width:100%;height:100%;object-fit:cover;object-position:top">`;
    const num = mk('div', 'huge', '75', r);
    place(num, { x: W / 2, y: 1400, op: 0 });
    num.style.fontSize = '230px'; num.style.color = 'var(--red)';
    const numCap = mk('div', 'mono', 'SPECIMENS / 标本', r);
    place(numCap, { x: W / 2, y: 1540, op: 0 });
    numCap.style.fontSize = '22px'; numCap.style.color = 'var(--ink2)';
    A1.el.book = book; A1.el.num = num; A1.el.numCap = numCap;
  },
  render(t) {
    const { pdf, cap, book, num, numCap } = A1.el;
    // PDF 砸下
    const k0 = p(t, 0.02, 0.42);
    const s0 = backOut(k0);
    const kFade = p(t, .78, 1.12);
    pdf.style.opacity = clamp(k0 * 4) * (1 - easeOut(kFade));
    if (kFade > 0) {
      pdf.style.transform = `translate(-50%,-50%) translateY(${lerp(-260, 0, backOut(k0))}px) scale(${lerp(1, .82, easeOut(kFade))}) rotate(-2deg)`;
      cap.style.opacity = easeOut(p(t, .30, .70)) * (1 - easeOut(p(t, .55, .85)));
    }
    pdf.style.transform = `translate(-50%,-50%) translateY(${lerp(-260, 0, s0)}px) scale(${lerp(1.5, 1, s0)}) rotate(${lerp(-7, -2, s0)}deg)`;
    cap.style.opacity = easeOut(p(t, 0.30, 0.70)) * (1 - easeOut(p(t, 0.62, 0.92)));

    // 12 张闪现（1.35 → 2.43），首张承担"打开"动作
    A1.flash.forEach((box, i) => {
      const t0 = 1.05 + i * .11, t1 = t0 + .12;
      box.style.opacity = (t >= t0 && t < t1) ? 1 : 0;
      if (t >= t0 && t < t1 && i === 0) {
        const kk = (t - t0) / .12;
        box.firstElementChild.style.transform = `scale(${lerp(.55, 1, easeOut4(kk))})`;
        box.firstElementChild.style.transformOrigin = 'center';
      }
    });

    // 收拢
    const kb = p(t, 2.52, 3.10);
    const sb = backOut(kb);
    book.style.opacity = clamp(kb * 3);
    book.style.transform = `translate(-50%,-50%) scale(${lerp(.5, 1, sb)}) rotate(${lerp(6, -1.5, sb)}deg)`;

    const kn = p(t, 3.05, 3.55);
    const sn = backOut(kn);
    num.style.opacity = clamp(kn * 4);
    num.style.transform = `translate(-50%,-50%) scale(${lerp(1.6, 1, sn)})`;
    numCap.style.opacity = easeOut(p(t, 3.30, 3.75)) * .9;
  }
};

/* ══════════════ 幕2 · 动机 + 正名 4–16 ══════════════ */
const A2 = {
  t0: 4.0, t1: 16.0,
  build(r) {
    r.innerHTML = '';
    // 引文块
    const q = mk('div', '', '', r);
    place(q, { x: W / 2, y: 720, w: 900, op: 0 });
    q.innerHTML = `
      <div style="border-left:12px solid var(--red);padding:10px 0 10px 34px">
        <div style="font-size:88px;font-weight:900;line-height:1.24;color:var(--ink)">「桌桌你<br>给我好好学」</div>
        <div class="mono" style="font-size:22px;color:var(--ink2);margin-top:26px;letter-spacing:.1em">— 视频号文案 · 2026-11-11 · #奶蛙学</div>
      </div>`;
    A2.el = { q };

    const q2 = mk('div', '', '', r);
    place(q2, { x: W / 2, y: 1240, w: 900, op: 0 });
    q2.style.fontSize = '54px'; q2.style.fontWeight = '900'; q2.style.color = 'var(--red)';
    q2.style.textAlign = 'center'; q2.innerHTML = '而且，是真的在学。';
    A2.el.q2 = q2;

    // 标题
    const title = mk('div', '', '', r);
    place(title, { x: W / 2, y: 620, w: W, op: 1 });
    title.style.display = 'flex'; title.style.justifyContent = 'center';
    A2.chars = ['奶', '娃', '图', '鉴'].map((c) => {
      const s = mk('span', '', c, title);
      s.style.fontSize = '206px'; s.style.fontWeight = '900'; s.style.lineHeight = '1';
      s.style.display = 'inline-block'; s.style.opacity = 0;
      s.style.textShadow = '5px 5px 0 rgba(226,52,43,.20)';
      return s;
    });
    A2.el.title = title;

    const en = mk('div', 'mono', 'A FIELD GUIDE TO MILK FROG VARIANTS', r);
    place(en, { x: W / 2, y: 772, w: 940, op: 0 });
    en.style.fontSize = '23px'; en.style.color = 'var(--red)';
    en.style.textAlign = 'center'; en.style.letterSpacing = '.16em';
    A2.el.en = en;

    // 双写法注
    const note = mk('div', '', '', r);
    place(note, { x: W / 2, y: 960, w: 900, op: 0 });
    note.style.textAlign = 'center';
    note.innerHTML = `
      <div style="font-size:36px;line-height:1.9;color:var(--ink2)">
        教材写作 <b style="color:var(--ink);font-size:44px">奶蛙</b><br>
        社群常写作 <b style="color:var(--ink);font-size:44px">奶娃</b>
      </div>`;
    A2.el.note = note;

    const bars = mk('div', 'bars', '', r);
    place(bars, { x: W / 2, y: 1090, w: 860, op: 0 });
    A2.el.bars = bars;

    // 教材语法三件套
    const trio = [
      ['COURSE', '课程 · 变体识别｜必修 第一册'],
      ['FIGURE', '外部图版 01 · 奶娃 papa'],
      ['EVIDENCE', '证据 B 级 · 外部图版'],
    ];
    A2.trio = trio.map(([k, v], i) => {
      const row = mk('div', '', '', r);
      place(row, { x: W / 2, y: 1240 + i * 150, w: 900, op: 0 });
      row.innerHTML = `<div style="background:#fff;border:3px solid var(--ink);padding:22px 28px;
        box-shadow:9px 9px 0 rgba(43,38,32,.14)">
        <span class="mono" style="font-size:19px;color:var(--red);letter-spacing:.18em">${k}</span>
        <div style="font-size:38px;font-weight:700;color:var(--ink);margin-top:6px">${v}</div></div>`;
      return row;
    });

    // 中间实物：三要素拼出来的一张真卡（按真实数据重排，不缩截图）
    const card = mk('div', '', '', r);
    place(card, { x: W / 2, y: 748, w: 660, op: 0 });
    card.style.height = '730px';
    card.style.background = '#fff';
    card.style.overflow = 'hidden';
    card.style.boxShadow = '0 0 0 5px #fff, 12px 14px 0 rgba(43,38,32,.13), 0 26px 60px rgba(43,38,32,.20)';
    card.innerHTML = `
      <div style="position:relative">
        <img src="/film/app/assets/vg_04.webp" style="width:100%;height:458px;object-fit:cover;
          object-position:center 26%;display:block">
        <div style="position:absolute;left:0;top:0;right:0;display:flex;justify-content:space-between;
          padding:12px 22px;background:rgba(255,255,255,.95);border-bottom:3px solid var(--ink)">
          <span class="mono" style="font-size:26px;letter-spacing:.08em;color:var(--ink)">SPEC 003 <span style="opacity:.4">/ 75</span></span>
          <span class="mono" style="font-size:26px;color:var(--red);letter-spacing:.1em">本体</span>
        </div>
      </div>
      <div style="padding:24px 30px 0">
        <div style="font-size:58px;font-weight:900;line-height:1.04;color:var(--ink)">奶娃 papa</div>
        <div class="mono" style="font-size:29px;color:var(--red);margin-top:14px;letter-spacing:.05em">外部图版 01</div>
        <div style="margin-top:22px;display:inline-block;border:3px solid var(--ink);padding:8px 17px;
          font-size:26px;font-weight:700;color:var(--ink)">证据 B 级 · 外部图版</div>
      </div>`;
    A2.el.card = card;

    const credo = mk('div', '', '', r);
    place(credo, { x: W / 2, y: 900, w: 920, op: 0 });
    credo.style.textAlign = 'center';
    credo.innerHTML = `<div style="display:inline-block;background:var(--paper);padding:34px 40px;
      box-shadow:0 0 0 5px var(--ink), 14px 16px 0 rgba(43,38,32,.16)">
      <div style="font-size:60px;font-weight:900;line-height:1.40;color:var(--ink)">
        没有学分，没有期末<br>
        <span style="color:var(--red)">却真的有课本。</span></div>
      <div class="mono" style="font-size:20px;color:var(--ink2);margin-top:22px;letter-spacing:.1em">— v2 封面 · 原话</div>
    </div>`;
    A2.el.credo = credo;
  },
  render(t) {
    const { q, q2, en, note, bars, credo, title, card } = A2.el;

    // 4.0-7.2 引文
    const kq = p(t, .05, .70);
    const sq = backOut(kq);
    q.style.opacity = clamp(kq * 3);
    q.style.transform = `translate(-50%,-50%) translateY(${lerp(60, 0, sq)}px)`;
    const kq2 = p(t, 1.15, 1.70);
    q2.style.opacity = clamp(kq2 * 3);
    q2.style.transform = `translate(-50%,-50%) scale(${lerp(1.25, 1, backOut(kq2))})`;

    const qout = p(t, 2.95, 3.35);
    q.style.opacity = clamp(kq * 3) * (1 - easeOut(qout));
    q2.style.opacity = clamp(kq2 * 3) * (1 - easeOut(qout));

    // 7.2- 标题
    A2.chars.forEach((c, i) => {
      const k = p(t, 3.20 + i * .12, 3.80 + i * .12);
      const s = backOut(k);
      c.style.opacity = clamp(k * 4);
      c.style.transform = `translateY(${lerp(150, 0, s)}px) rotate(${lerp(-9, 0, s)}deg) scale(${lerp(.6, 1, s)})`;
    });
    const ke = p(t, 3.75, 4.45);
    en.style.opacity = easeOut(ke);
    en.style.letterSpacing = lerp(.5, .16, easeOut(ke)) + 'em';

    const kb = p(t, 4.30, 4.95);
    bars.style.opacity = easeOut(kb) * .95;
    bars.style.transform = `translate(-50%,-50%) scaleX(${easeOut(kb)})`;

    // 双写法注
    const kn = p(t, 3.95, 4.70);
    note.style.opacity = easeOut(kn);
    note.style.transform = `translate(-50%,-50%) translateY(${lerp(40, 0, easeOut4(kn))}px)`;

    // 三件套
    A2.trio.forEach((row, i) => {
      const k = p(t, 7.40 + i * .36, 7.95 + i * .36);
      const s = easeOut4(k);
      row.style.opacity = clamp(k * 2.4);
      row.style.transform = `translate(-50%,-50%) translateX(${lerp(380, 0, s)}px) rotate(${lerp(3, 0, s)}deg)`;
    });

    // 标本卡：要素拼成一张真卡
    const kcard = p(t, 8.02, 9.30);
    const sc2 = backOut(kcard);
    card.style.opacity = clamp(kcard * 2);
    card.style.transform = `translate(-50%,-50%) scale(${lerp(.86, 1, sc2)}) rotate(${lerp(2.4, -1.2, sc2)}deg)`;

    // 8.0 起标题组退到上方
    const up = p(t, 6.55, 7.25);
    const su = easeInOut(up);
    title.style.transform = `translate(-50%,-50%) translateY(${-380 * su}px) scale(${lerp(1, .46, su)})`;
    title.style.transformOrigin = 'center center';
    en.style.opacity = easeOut(ke) * (1 - su);
    note.style.opacity = easeOut(kn) * (1 - su);
    bars.style.opacity = easeOut(kb) * .95 * (1 - su);

    // 三件套退场，原话压场（提前 1.4s，原来只剩 0.1 秒）
    const out2 = p(t, 9.95, 10.35);
    A2.trio.forEach(row => { row.style.opacity = clamp(row.style.opacity) * (1 - easeOut(out2)); });
    const kc = p(t, 10.10, 10.75);
    credo.style.opacity = clamp(kc * 3);
    credo.style.transform = `translate(-50%,-50%) scale(${lerp(1.16, 1, backOut(kc))})`;
    const fadeC = p(t, 9.95, 10.42);
    if (fadeC > 0) {
      card.style.opacity = clamp(kcard * 2) * (1 - easeOut(fadeC) * .84);
      card.style.filter = `blur(${(easeOut(fadeC) * 2.2).toFixed(2)}px)`;
    }
    if (kc > 0) title.style.opacity = 1 - easeOut(kc) * .72;
  }
};

/* ══════════════ 幕3 · 看见 16–29 ══════════════ */
const A3 = {
  t0: 16.0, t1: 29.0,
  build(r) {
    r.innerHTML = '';
    // 3 张全屏特写
    const fids = ['014', '013', '021'];
    A3.cut = fids.map((id, i) => {
      const box = mk('div', '', '', r);
      box.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0;background:var(--paper2)';
      const im = mk('div', '', '', box);
      im.style.cssText = `position:absolute;left:0;top:0;width:1080px;height:1380px;overflow:hidden;
        background:#fff;box-shadow:0 22px 60px rgba(43,38,32,.3)`;
      im.innerHTML = `<img src="${imgOf(id)}" style="width:100%;height:100%;object-fit:contain;background:#fff">`;
      const tag = mk('div', 'mono', `SPEC.${id} · ${byId(id).name}`, box);
      tag.style.cssText = `position:absolute;left:0;right:0;bottom:300px;text-align:center;
        font-size:30px;color:var(--ink);letter-spacing:.12em`;
      return box;
    });

    // 3 组对照
    const PAIRS = [
      ['001', '008', '换皮', '只换了颜色', 'RESKIN', '高'],
      ['001', '012', '异形 · 轻', '换了物种', 'MORPH', '中'],
      ['001', '013', '异形 · 重', '连形状都没了', 'MORPH', '低'],
    ];
    A3.pairs = PAIRS.map(([a, b, label, sub, en, keep], i) => {
      const g = mk('div', '', '', r);
      g.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0';
      const head = mk('div', '', `${label}<span class="mono" style="font-size:19px;margin-left:14px;opacity:.6">${en}</span>
        <div style="font-size:30px;font-weight:500;color:var(--ink2);margin-top:8px">${sub}</div>`, g);
      place(head, { x: W / 2, y: 300, w: 940, op: 1 });
      head.style.fontSize = '52px'; head.style.fontWeight = '900'; head.style.textAlign = 'center';

      const cells = [a, b].map((id, j) => {
        const c = mk('div', '', '', g);
        place(c, { x: 300 + j * 480, y: 900, w: 420, op: 1 });
        c.style.height = '420px';
        c.style.cssText += `background:#fff;overflow:hidden;
          box-shadow:0 0 0 7px #fff, 10px 12px 0 rgba(43,38,32,.16), 0 24px 50px rgba(43,38,32,.2)`;
        c.innerHTML = `<img src="${imgOf(id)}" style="width:100%;height:100%;object-fit:cover">`;
        return c;
      });

      // 标本框：直接用 cell 的 outline
      cells.forEach(c => { c.style.outline = '0px solid var(--red)'; c.style.outlineOffset = '-4px'; });
      const marks = cells;

      // 判据条：三个特征 × 两张图（左=本体，右=变体）
      const keepMap = { '高': [1, 1, 1], '中': [1, 1, 0], '低': [1, 1, 0] };
      const flags = keepMap[keep] || [1, 1, 1];
      const FEATS = [['眼睛', 'var(--red)'], ['大笑', 'var(--orange)'], ['形体', 'var(--green)']];
      const crit = mk('div', '', '', g);
      place(crit, { x: W / 2, y: 1300, w: 880, op: 1 });
      crit.style.display = 'flex'; crit.style.gap = '14px'; crit.style.justifyContent = 'center';
      const cells2 = FEATS.map(([name, col], k) => {
        const c = mk('div', '', '', crit);
        const okR = flags[k];
        c.style.cssText = `flex:1;background:#fff;border:3px solid var(--ink);padding:14px 8px;text-align:center;
          box-shadow:7px 7px 0 rgba(43,38,32,.12)`;
        c.innerHTML = `
          <div class="mono" style="font-size:19px;color:${col};letter-spacing:.14em">${name}</div>
          <div style="font-size:46px;font-weight:900;margin-top:2px;line-height:1.05">
            <span style="color:var(--green)">✓</span><span style="color:rgba(43,38,32,.28)">/</span>
            <span style="color:${okR ? 'var(--green)' : 'var(--red)'}">${okR ? '✓' : '✗'}</span>
          </div>`;
        return c;
      });

      return { g, marks, cells, flags, crit, cells2 };
    });

    // 三分支
    const ROWS = [
      ['I', 'RESKIN', '换皮奶蛙', '仅皮肤、图标或封面变化', 'var(--orange)', '6'],
      ['II', 'MORPH', '异形奶蛙', '丢失大量形体，但保留眼睛与大笑', 'var(--green)', '19'],
      ['III', 'CROSSOVER', '客串角色', '本身不是奶蛙，因颜色或气质联动', 'var(--blue)', '8'],
    ];
    A3.rows = ROWS.map(([rn, en, cn, ds, col, n], i) => {
      const row = mk('div', '', '', r);
      place(row, { x: W / 2, y: 700 + i * 250, w: 940, op: 0 });
      row.style.cssText += `background:#fff;border:3px solid var(--ink);padding:26px 30px;
        box-shadow:10px 10px 0 rgba(43,38,32,.14)`;
      row.innerHTML = `
        <div style="position:absolute;left:0;top:0;bottom:0;width:12px;background:${col}"></div>
        <div class="mono" style="font-size:20px;color:${col}">${rn} / ${en}</div>
        <div style="font-size:48px;font-weight:900;color:var(--ink);margin-top:2px">${cn}
          <span class="huge" style="font-size:38px;color:${col};margin-left:14px">${n}</span></div>
        <div style="font-size:27px;color:var(--ink2);margin-top:6px">${ds}</div>`;
      return row;
    });

    const crit = mk('div', '', '', r);
    place(crit, { x: W / 2, y: 1520, w: 940, op: 0 });
    crit.style.cssText += `background:var(--red);color:#fff;padding:24px;text-align:center`;
    crit.innerHTML = `<div class="mono" style="font-size:20px;opacity:.85;letter-spacing:.2em">IDENTIFICATION</div>
      <div style="font-size:46px;font-weight:900;margin-top:4px">保留「眼睛」与「大笑」</div>`;
    A3.el = { crit };
  },
  render(t) {
    const { crit } = A3.el;
    // 16.0-18.6 三张特写
    A3.cut.forEach((box, i) => {
      const t0 = i * .78, t1 = t0 + .80;
      box.style.opacity = (t >= t0 && t < t1) ? 1 : 0;
      if (t >= t0 && t < t1) {
        const k = (t - t0) / .80;
        const im = box.firstElementChild;
        im.style.transform = `scale(${lerp(1.06, 1, easeOut(k))})`;
      }
    });

    // 18.6-24.0 三组对照
    A3.pairs.forEach(({ g, marks, crit, cells2 }, i) => {
      const t0 = 2.6 + i * 1.8, t1 = t0 + 1.8;
      const on = t >= t0 && t < t1;
      g.style.opacity = on ? 1 : 0;
      if (!on) return;
      const k = (t - t0) / 1.8;
      marks.forEach((m, j) => {
        const km = clamp((k - .18 - j * .14) / .30);
        m.style.outline = `${(6 * easeOut(km)).toFixed(1)}px solid var(--red)`;
      });
      cells2.forEach((c, j) => {
        const kc = clamp((k - .48 - j * .05) / .14);
        c.style.opacity = clamp(kc * 4);
        c.style.transform = `translateY(${lerp(24, 0, easeOut(kc))}px)`;
      });
    });

    // 24.0- 三分支
    A3.rows.forEach((row, i) => {
      const k = p(t, 8.0 + i * .34, 8.7 + i * .34);
      const s = easeOut4(k);
      row.style.opacity = clamp(k * 2.4);
      row.style.transform = `translate(-50%,-50%) translateX(${lerp(420, 0, s)}px) rotate(${lerp(4, 0, s)}deg)`;
    });

    const kc = p(t, 10.9, 11.6);
    crit.style.opacity = clamp(kc * 3);
    crit.style.transform = `translate(-50%,-50%) scale(${lerp(1.4, 1, backOut(kc))})`;
  }
};

/* ══════════════ 幕4 · 四轮 29–41 ══════════════ */
const A4 = {
  t0: 29.0, t1: 41.0,
  build(r) {
    r.innerHTML = '';
    const head = mk('div', '', '做了四稿', r);
    place(head, { x: W / 2, y: 340, w: 940, op: 0 });
    head.style.fontSize = '104px'; head.style.fontWeight = '900'; head.style.textAlign = 'center';
    A4.el = { head };

    const VERS = [
      { n: 'v1', label: '研究卷宗', sub: '奶娃学 · 一只 AI 画歪的蛙如何长成公共符号', img: '/film/shots/ver_v1_cover.png' },
      { n: 'v2', label: '通识课导论', sub: '奶蛙学 101 · 通识课导论（必修·第一册）', img: '/film/shots/ver_v2_cover.png' },
      { n: 'v3', label: '图鉴长页', sub: 'Cobalt Grid · 37 枚标本 · 已被覆盖', img: null },
      { n: 'v4', label: '图鉴 · 变体识别', sub: '奶娃图鉴 · 75 枚 · Sakura Chroma', img: '/film/shots/m_cover.png' },
    ];
    // 逐个全屏卡
    A4.cards = VERS.map((v, i) => {
      const card = mk('div', '', '', r);
      place(card, { x: W / 2, y: 880, w: 930, op: 0 });
      card.style.height = '700px';
      if (v.img) {
        card.style.cssText += `background:#fff;overflow:hidden;
          box-shadow:0 0 0 8px #fff, 14px 16px 0 rgba(43,38,32,.16), 0 30px 60px rgba(43,38,32,.24)`;
        card.innerHTML = `<img src="${v.img}" style="width:100%;height:100%;object-fit:contain;background:#fff">`;
      } else {
        // v3 空框：刻意做成"缺失"
        card.style.cssText += `background:repeating-linear-gradient(45deg,#E8E1D0 0 12px,#E2DAC7 12px 24px);
          border:4px dashed rgba(43,38,32,.45);display:flex;align-items:center;justify-content:center`;
        card.innerHTML = `<div style="text-align:center">
          <div style="font-size:64px;color:rgba(43,38,32,.35);font-weight:900">?</div>
          <div class="mono" style="font-size:20px;color:rgba(43,38,32,.6);margin-top:10px;letter-spacing:.14em">已覆盖 · 仅存记录</div></div>`;
      }
      const cap = mk('div', '', '', r);
      place(cap, { x: W / 2, y: 1350, w: 900, op: 0 });
      cap.innerHTML = `<div class="mono" style="font-size:22px;color:var(--red)">${v.n}</div>
        <div style="font-size:48px;font-weight:900;color:var(--ink);margin-top:4px">${v.label}</div>
        <div style="font-size:24px;color:var(--ink2);margin-top:8px">${v.sub}</div>`;
      cap.style.textAlign = 'center';
      return { card, cap };
    });

    // 2×2 并排
    const grid = mk('div', '', '', r);
    place(grid, { x: W / 2, y: 900, w: 900, op: 0 });
    grid.style.display = 'grid'; grid.style.gridTemplateColumns = '1fr 1fr';
    grid.style.gap = '26px';
    A4.gridCells = VERS.map((v) => {
      const c = mk('div', '', '', grid);
      c.style.cssText = 'height:270px;position:relative;overflow:hidden;background:#fff;' +
        'box-shadow:0 0 0 6px #fff, 8px 10px 0 rgba(43,38,32,.14)';
      if (v.img) {
        c.innerHTML = `<img src="${v.img}" style="width:100%;height:100%;object-fit:contain;background:#fff">
          <div class="mono" style="position:absolute;left:0;right:0;bottom:0;background:rgba(43,38,32,.86);
            color:#F0EBDE;font-size:17px;padding:5px 8px">${v.n} · ${v.label}</div>`;
      } else {
        c.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
          background:repeating-linear-gradient(45deg,#E8E1D0 0 10px,#E2DAC7 10px 20px)">
          <span class="mono" style="font-size:16px;color:rgba(43,38,32,.55);text-align:center;padding:0 8px">v3<br>已覆盖</span></div>`;
      }
      return c;
    });
    A4.el.grid = grid;

    const arrow = mk('div', 'mono', '研究 → 课程 → 图鉴', r);
    place(arrow, { x: W / 2, y: 1220, w: 940, op: 0 });
    arrow.style.fontSize = '30px'; arrow.style.color = 'var(--red)'; arrow.style.textAlign = 'center';
    A4.el.arrow = arrow;

    // 素材数字
    const mat = mk('div', '', '', r);
    place(mat, { x: W / 2, y: 1450, w: 900, op: 0 });
    mat.style.display = 'flex'; mat.style.justifyContent = 'space-between';
    mat.innerHTML = [['112', '素材文件'], ['70', '帧一手图版'], ['1.49', 'MB']].map(([n, l]) => `
      <div style="text-align:center;flex:1;border-left:2px solid rgba(43,38,32,.2)">
        <div class="huge" style="font-size:66px;color:var(--ink)">${n}</div>
        <div style="font-size:21px;color:var(--ink2)">${l}</div></div>`).join('');
    if (mat.firstElementChild) mat.firstElementChild.style.borderLeft = 'none';
    A4.el.mat = mat;
  },
  render(t) {
    const { head, grid, arrow, mat } = A4.el;
    const kh = p(t, .05, .70);
    head.style.opacity = clamp(kh * 3);
    head.style.transform = `translate(-50%,-50%) scale(${lerp(1.15, 1, backOut(kh))})`;

    // 四张逐个推演：1.8/1.6/1.6/1.6
    const SLOT = [[1.7, 3.0], [3.0, 4.4], [4.4, 5.8], [5.8, 7.2]];
    A4.cards.forEach(({ card, cap }, i) => {
      const [a, b] = SLOT[i];
      const k = p(t, a, a + .45);
      const out = p(t, b - .35, b);
      const on = t >= a && t < b;
      card.style.opacity = on ? clamp(k * 3) * (1 - easeOut(out)) : 0;
      cap.style.opacity = on ? clamp(k * 3) * (1 - easeOut(out)) : 0;
      if (on) {
        const s = easeOut4(k);
        card.style.transform = `translate(-50%,-50%) translateY(${lerp(120, 0, s)}px) rotate(${lerp(2.6, -1, s)}deg)`;
        cap.style.transform = `translate(-50%,-50%) translateY(${lerp(60, 0, s)}px)`;
      }
    });

    // 7.2 后并排
    const kg = p(t, 7.2, 8.1);
    grid.style.opacity = easeOut(kg);
    grid.style.transform = `translate(-50%,-50%) scale(${lerp(.92, 1, easeOut4(kg))})`;
    const ka = p(t, 8.2, 8.9);
    arrow.style.opacity = easeOut(ka);
    arrow.style.transform = `translate(-50%,-50%) translateY(${lerp(26, 0, easeOut4(ka))}px)`;

    const km = p(t, 9.6, 10.5);
    mat.style.opacity = easeOut(km);
    mat.style.transform = `translate(-50%,-50%) translateY(${lerp(50, 0, easeOut4(km))}px)`;
  }
};

/* ══════════════ 幕5 · 录屏 41–49 ══════════════ */
const UIS = [
  { dir: 'filter', n: 30, t0: 0.0, dur: 2.6, label: '筛选' },
  { dir: 'kmark', n: 28, t0: 2.6, dur: 2.6, label: '打卡' },
  { dir: 'quiz', n: 48, t0: 5.2, dur: 2.8, label: '自测' },
];
const A5 = {
  t0: 41.0, t1: 49.0,
  build(r) {
    r.innerHTML = '';
    A5.el = {};
    UIS.forEach((u, i) => {
      const win = mk('div', 'uiwin', '', r);
      place(win, { x: W / 2, y: 940, w: 800, op: 0 });
      win.style.height = '1120px';
      win.innerHTML = `<img src="/film/shots/ui/${u.dir}/0000.jpg">`;
      const tag = mk('div', 'mono', u.label, r);
      place(tag, { x: W / 2, y: 300, w: 900, op: 0 });
      tag.style.fontSize = '70px'; tag.style.color = 'var(--red)'; tag.style.textAlign = 'center';
      tag.style.letterSpacing = '.1em';
      A5.el['w' + i] = win;
      A5.el['t' + i] = tag;
    });
  },
  render(t) {
    UIS.forEach((u, i) => {
      const win = A5.el['w' + i], tag = A5.el['t' + i];
      const on = t >= u.t0 && t < u.t0 + u.dur;
      if (!on) { win.style.opacity = 0; tag.style.opacity = 0; return; }
      const k = (t - u.t0) / u.dur;
      const idx = Math.min(u.n - 1, Math.floor(k * u.n));
      const src = `/film/shots/ui/${u.dir}/${String(idx).padStart(4, '0')}.jpg`;
      const im = win.firstElementChild;
      if (im.getAttribute('src') !== src) im.setAttribute('src', src);
      win.style.opacity = 1;
      win.style.transform = 'translate(-50%,-50%)';
      const kt = p(t, u.t0, u.t0 + .35);
      tag.style.opacity = clamp(kt * 3);
      tag.style.transform = `translate(-50%,-50%) translateY(${lerp(-40, 0, easeOut4(kt))}px)`;
    });
  }
};

/* ══════════════ 幕6 · 收尾 49–52 ══════════════ */
const A6 = {
  t0: 49.0, t1: 52.0,
  build(r) {
    r.innerHTML = '';
    const l1 = mk('div', '', '奶蛙不叛', r);
    place(l1, { x: W / 2, y: 230, w: 940, op: 0 });
    l1.style.fontSize = '112px'; l1.style.fontWeight = '900'; l1.style.textAlign = 'center';
    l1.style.lineHeight = '1';

    const l2 = mk('div', '', '快乐永存。', r);
    place(l2, { x: W / 2, y: 348, w: 940, op: 0 });
    l2.style.fontSize = '112px'; l2.style.fontWeight = '900'; l2.style.textAlign = 'center';
    l2.style.lineHeight = '1'; l2.style.color = 'var(--red)';

    const bars = mk('div', 'bars', '', r);
    place(bars, { x: W / 2, y: 458, w: 620, op: 0 });

    // 收尾插图：027 西格玛奶蛙的大笑形象（全片最扭曲的变体，笑得最响）
    const plate = mk('div', '', '', r);
    place(plate, { x: W / 2, y: 1024, w: 640, op: 0 });
    plate.style.height = '993px';
    plate.style.background = '#fff';
    plate.style.padding = '10px';
    plate.style.border = '4px solid var(--ink)';
    plate.style.boxShadow = '18px 20px 0 rgba(43,38,32,.15), 0 34px 80px rgba(43,38,32,.22)';
    plate.innerHTML = `
      <img id="animImg" src="/film/shots/anim/f000.png"
        style="width:100%;height:100%;object-fit:contain;display:block">
      <div class="mono" style="position:absolute;left:-4px;top:-4px;background:var(--ink);color:var(--paper);
        font-size:21px;letter-spacing:.09em;padding:7px 15px">本体 · 大笑</div>`;
    A6.el2 = { plate };

    const url = mk('div', 'mono', 'naiwa-studies-101.app.workbuddy.host', r);
    place(url, { x: W / 2, y: 1592, w: 960, op: 0 });
    url.style.fontSize = '29px'; url.style.color = 'var(--ink)'; url.style.textAlign = 'center';
    url.style.letterSpacing = '.05em';

    const cta = mk('div', '', '完整 75 枚 · 见主页', r);
    place(cta, { x: W / 2, y: 1652, w: 940, op: 0 });
    cta.style.fontSize = '31px'; cta.style.fontWeight = '700'; cta.style.color = 'var(--red)';
    cta.style.textAlign = 'center';

    A6.el = { l1, l2, bars, url, cta, plate };
    A6.img = plate.querySelector('#animImg');
  },
  render(t) {
    const { l1, l2, bars, url, cta, plate } = A6.el;

    const k1 = p(t, .04, .52);
    l1.style.opacity = clamp(k1 * 3.5);
    l1.style.transform = `translate(-50%,-50%) scale(${lerp(1.18, 1, backOut(k1))})`;
    l1.style.clipPath = `inset(${(1 - easeOut(k1)) * 100}% 0 0 0)`;

    const k2 = p(t, .34, .82);
    l2.style.opacity = clamp(k2 * 3.5);
    l2.style.transform = `translate(-50%,-50%) scale(${lerp(1.18, 1, backOut(k2))})`;
    l2.style.clipPath = `inset(${(1 - easeOut(k2)) * 100}% 0 0 0)`;

    const k3 = p(t, .95, 1.40);
    bars.style.opacity = easeOut(k3) * .95;
    bars.style.transform = `translate(-50%,-50%) scaleX(${easeOut(k3)})`;

    // 大笑动画：砸进来，落定后逐帧播放
    // 帧与笑声同源（同一条 14s 原片的 30fps），起点对齐：画面 t=0.40 ↔ 源 0.415s
    const kp = p(t, .58, .98);
    const sp = backOut(kp);
    plate.style.opacity = clamp(kp * 3);
    plate.style.transform = `translate(-50%,-50%)
      translateY(${lerp(240, 0, sp)}px)
      scale(${lerp(1.30, 1, sp)})
      rotate(${lerp(-7, -1.6, sp)}deg)`;
    const fi = Math.max(0, Math.min(78, Math.round((t + .015) * 30) - 12));
    if (A6.fi !== fi) {
      A6.fi = fi;
      A6.img.src = '/film/shots/anim/f' + String(fi).padStart(3, '0') + '.png';
    }

    const k4 = p(t, 1.15, 1.62);
    url.style.opacity = easeOut(k4);
    cta.style.opacity = easeOut(p(t, 1.38, 1.86));
  }
};

/* ── 时间轴 ─────────────────────────────────────── */
const SCENES = [['a1', A1], ['a2', A2], ['a3', A3], ['a4', A4], ['a5', A5], ['a6', A6]];
const subsEl = () => document.getElementById('subsInner');

function boot() {
  SCENES.forEach(([id, S]) => { S.root = document.getElementById(id); S.build(S.root); });
}

window.renderAt = function (t) {
  t = clamp(t, 0, DUR - 1e-6);
  let cur = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const [id, S] = SCENES[i];
    const on = t >= S.t0 && t < S.t1;
    S.root.classList.toggle('on', on);
    if (on) {
      S.render(t - S.t0);
      cur = i;
      const br = 0.0022 * Math.sin(t * 1.05 + i * 1.7);
      const dx = 2.0 * Math.sin(t * 0.63 + i * 2.1);
      const dy = 2.4 * Math.cos(t * 0.47 + i * 0.9);
      S.root.style.transformOrigin = 'center center';
      S.root.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${(1 + br).toFixed(5)})`;
    }
  }
  const pg = document.getElementById('pgno');
  if (pg) pg.textContent = String(cur + 1).padStart(2, '0') + ' / 06';

  // 字幕
  const si = subsEl();
  const hit = SUBS.find(([a, b]) => t >= a && t < b);
  if (hit) {
    const [a, b, txt] = hit;
    if (si.dataset.txt !== txt) { si.textContent = txt; si.dataset.txt = txt; }
    const ki = easeOut(p(t, a, a + .22));
    const ko = 1 - easeOut(p(t, b - .18, b));
    si.style.opacity = Math.min(ki, ko);
    si.style.transform = `translateY(${lerp(14, 0, ki)}px)`;
  } else {
    si.style.opacity = 0;
    si.dataset.txt = '';
  }
  return true;
};

window.FILM = { DUR, FPS, W, H };

const ANIM_N = 79;
const preloadAnim = () => Promise.all(
  Array.from({ length: ANIM_N }, (_, i) => new Promise(res => {
    const im = new Image();
    im.onload = im.onerror = () => res(true);
    im.src = '/film/shots/anim/f' + String(i).padStart(3, '0') + '.png';
  }))
);

fetch('/film/data/specs.json').then(r => r.json()).then(d => {
  SPECS = d; boot(); return preloadAnim();
}).catch(() => { boot(); return preloadAnim(); })
  .then(() => { window.__READY__ = true; });
