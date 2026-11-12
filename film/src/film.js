/* 奶娃图鉴 · 创作手记 —— 每帧是 t 的纯函数 */

const W = 1080, H = 1920;
const DUR = 80.0;          // 总时长（秒）
const FPS = 30;

// ── 工具 ────────────────────────────────────────────────
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const p = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeOut4 = k => 1 - Math.pow(1 - k, 4);
const easeIn = k => k * k * k;
const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const backOut = k => { const c = 1.70158 + 1; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const smooth = k => k * k * (3 - 2 * k);
// 确定性伪随机
function rnd(seed) { let x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

const $ = (s, r = document) => r.querySelector(s);
const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };

function mk(tag, cls, html, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
// 绝对定位助手
function place(el, { x = 0, y = 0, w = null, rot = 0, scale = 1, op = 1, z = 1 } = {}) {
  el.style.position = 'absolute';
  if (w != null) el.style.width = w + 'px';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.transformOrigin = 'center center';
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`;
  el.style.opacity = op;
  el.style.zIndex = z;
}

const CAT_COLOR = { '本体': '#E2342B', '换皮': '#F08A2C', '异形': '#6FA83C', '客串': '#3A8ED6', '十二奶肖': '#9B5BC7', '奶字母': '#E2342B' };

// ── 数据（由 specs.json 内联） ─────────────────────────
let SPECS = [];
function loadSpecs() {
  if (window.__SPECS__) { SPECS = window.__SPECS__; return; }
  return fetch('/film/data/specs.json').then(r => r.json()).then(d => { SPECS = d; window.__SPECS__ = d; });
}

// ══════════════════════════════════════════════════════
// S1 · 聊天记录  0 – 5.0
// ══════════════════════════════════════════════════════
const S1 = {
  t0: 0, t1: 5.0,
  build(root) {
    root.innerHTML = '';
    const date = mk('div', 't mono', '2026 · 11 · 11 &nbsp;&nbsp; 23:47', root);
    place(date, { x: W / 2, y: 235, op: 0 });
    date.style.fontSize = '24px'; date.style.color = 'var(--ink2)';
    S1.el = { date };

    // 头像
    const av = mk('div', '', '', root);
    place(av, { x: 168, y: 470, w: 108, op: 0 });
    av.style.height = '108px';
    av.style.borderRadius = '6px';
    av.style.overflow = 'hidden';
    av.style.boxShadow = '0 0 0 5px #fff, 0 6px 0 rgba(43,38,32,.14)';
    av.innerHTML = `<img src="/film/app/assets/figure01_4.webp" style="width:100%;height:100%;object-fit:cover">`;
    S1.el.av = av;

    // 文件气泡（左边缘 250，宽 690 → 中心 595）
    const file = mk('div', 'cut', '', root);
    place(file, { x: 596, y: 440, w: 690, op: 0 });
    file.style.padding = '32px 34px';
    file.innerHTML = `
      <div style="display:flex;align-items:center;gap:24px">
        <div style="width:88px;height:108px;background:var(--red);position:relative;flex:0 0 auto;
             display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px">
          <span style="font-family:var(--mono);font-size:17px;color:#fff;letter-spacing:.06em">PDF</span>
          <div style="position:absolute;right:0;top:0;width:0;height:0;
               border-left:24px solid var(--paper);border-bottom:24px solid #B32219"></div>
        </div>
        <div style="min-width:0">
          <div style="font-size:32px;font-weight:700;color:var(--ink);line-height:1.3">期中复习资料-1副本.pdf</div>
          <div style="font-family:var(--mono);font-size:20px;color:var(--ink2);margin-top:9px">18.5 MB</div>
        </div>
      </div>`;
    // 气泡小尾巴
    const tail1 = mk('div', '', '', file);
    tail1.style.cssText = 'position:absolute;left:-22px;top:52px;width:0;height:0;border-right:24px solid #fff;border-top:16px solid transparent;border-bottom:16px solid transparent';
    S1.el.file = file;

    // 第二句
    const msg = mk('div', 'cut', '这下不用担心考不好了', root);
    place(msg, { x: 470, y: 660, w: 460, op: 0 });
    msg.style.padding = '26px 30px';
    msg.style.fontSize = '38px'; msg.style.fontWeight = '600'; msg.style.lineHeight = '1.4';
    msg.style.transformOrigin = 'right center';
    const tail2 = mk('div', '', '', msg);
    tail2.style.cssText = 'position:absolute;left:-20px;top:44px;width:0;height:0;border-right:22px solid #fff;border-top:14px solid transparent;border-bottom:14px solid transparent';
    S1.el.msg = msg;

    // 已读
    const read = mk('div', 'mono', '已读 23:47', root);
    place(read, { x: 300, y: 750, op: 0 });
    read.style.fontSize = '20px'; read.style.color = 'rgba(90,81,69,.7)';
    S1.el.read = read;

    // 内心字幕
    const line = mk('div', 't', '<span style="font-size:84px;font-weight:900;line-height:1.18">我以为<br>只是一个玩笑。</span>', root);
    place(line, { x: W / 2, y: 1180, w: 860, op: 0 });
    line.style.textAlign = 'center';
    S1.el.line = line;

    const bars = mk('div', 'bars', '', root);
    place(bars, { x: W / 2, y: 1560, w: 780, op: 0 });
    S1.el.bars = bars;
  },
  render(t) {
    const { date, av, file, msg, read, line, bars } = S1.el;
    const k1 = easeOut(p(t, .25, .9));
    date.style.opacity = k1 * .9;
    av.style.opacity = easeOut(p(t, .2, .7));

    // 文件气泡：从右弹入
    const k2 = p(t, .35, .95);
    const s2 = backOut(k2);
    file.style.opacity = clamp(k2 * 3);
    file.style.transform = `translate(-50%,-50%) translateX(${lerp(340, 0, s2)}px) scale(${lerp(.92, 1, s2)}) rotate(${lerp(2.2, -.4, s2)}deg)`;

    // 第二句
    const k3 = p(t, 1.35, 1.95);
    const s3 = backOut(k3);
    msg.style.opacity = clamp(k3 * 3);
    msg.style.transform = `translate(-50%,-50%) translateX(${lerp(280, 0, s3)}px) scale(${lerp(.88, 1, s3)}) rotate(${lerp(2.6, 1.1, s3)}deg)`;

    read.style.opacity = easeOut(p(t, 1.95, 2.4)) * .9;

    // 内心字幕：盖章
    const k4 = p(t, 2.55, 3.1);
    const s4 = backOut(k4);
    line.style.opacity = clamp(k4 * 4);
    line.style.transform = `translate(-50%,-50%) scale(${lerp(1.3, 1, s4)}) rotate(${lerp(-4, -1.4, s4)}deg)`;

    const k5 = p(t, 2.7, 3.5);
    bars.style.opacity = k5 * .9;
    bars.style.transform = `translate(-50%,-50%) scaleX(${easeOut(k5)})`;
  }
};

// ══════════════════════════════════════════════════════
// S2 · 打开 · 封面  5.0 – 12.5
// ══════════════════════════════════════════════════════
const S2 = {
  t0: 5.0, t1: 12.5,
  build(root) {
    root.innerHTML = '';
    // 六色斜纹背景（呼应封面）
    const stripe = mk('div', '', '', root);
    stripe.style.cssText = `position:absolute;inset:0;
      background:repeating-linear-gradient(48deg,
        rgba(226,52,43,.13) 0 42px, rgba(240,138,44,.13) 42px 84px,
        rgba(245,196,60,.13) 84px 126px, rgba(111,168,60,.13) 126px 168px,
        rgba(58,142,214,.13) 168px 210px, rgba(155,91,199,.13) 210px 252px);
      mix-blend-mode:multiply;
      mask-image:radial-gradient(ellipse 80% 62% at 62% 34%, #000 0%, transparent 72%);
      -webkit-mask-image:radial-gradient(ellipse 80% 62% at 62% 34%, #000 0%, transparent 72%);`;
    S2.el = { stripe };

    const kicker = mk('div', 'mono', '普通高等教育「野生」通识教材 · 完全开源', root);
    place(kicker, { x: W / 2, y: 285, w: 920, op: 0 });
    kicker.style.fontSize = '22px'; kicker.style.color = 'var(--ink2)'; kicker.style.textAlign = 'center';
    S2.el.kicker = kicker;

    // 标题逐字
    const chars = ['奶', '娃', '图', '鉴'];
    const title = mk('div', '', '', root);
    place(title, { x: W / 2, y: 610, w: W, op: 1 });
    title.style.display = 'flex'; title.style.justifyContent = 'center';
    title.style.gap = '0px';
    S2.chars = chars.map((c, i) => {
      const s = mk('span', '', c, title);
      s.style.fontSize = '206px'; s.style.fontWeight = '900';
      s.style.color = 'var(--ink)'; s.style.lineHeight = '1';
      s.style.display = 'inline-block';
      s.style.opacity = 0;
      s.style.textShadow = '5px 5px 0 rgba(226,52,43,.20)';
      return s;
    });
    S2.el.title = title;

    const en = mk('div', 'mono', 'A FIELD GUIDE TO MILK FROG VARIANTS', root);
    place(en, { x: W / 2, y: 762, w: 940, op: 0 });
    en.style.fontSize = '24px'; en.style.color = 'var(--red)';
    en.style.textAlign = 'center'; en.style.letterSpacing = '.16em';
    S2.el.en = en;

    // 说明
    const desc = mk('div', 't', '本册不考据、不辩论，只做一件事：<br>把这只黄色的蛙，以及由它长出来的每一种变体，<br><b style="color:var(--red)">一个一个认清楚。</b>', root);
    place(desc, { x: W / 2, y: 960, w: 880, op: 0 });
    desc.style.fontSize = '37px'; desc.style.lineHeight = '1.74'; desc.style.textAlign = 'center';
    S2.el.desc = desc;

    // 数据
    const stats = mk('div', '', '', root);
    place(stats, { x: W / 2, y: 1400, w: 900, op: 0 });
    stats.style.display = 'flex'; stats.style.justifyContent = 'space-between';
    stats.innerHTML = [
      ['75', '枚标本'], ['6', '大类'], ['39', '帧教材原图'], ['56', '帧外部形象']
    ].map(([n, l]) => `
      <div style="text-align:center;flex:1;border-left:2px solid rgba(43,38,32,.22);padding:0 6px">
        <div class="huge" style="font-size:92px;color:var(--ink)">${n}</div>
        <div style="font-size:23px;color:var(--ink2);margin-top:4px">${l}</div>
      </div>`).join('');
    if (stats.firstElementChild) stats.firstElementChild.style.borderLeft = 'none';
    S2.el.stats = stats;

    // 彩条
    const bars = mk('div', 'bars', '', root);
    place(bars, { x: W / 2, y: 1145, w: 900, op: 0 });
    S2.el.bars = bars;

    // 彩点阵（右下装饰）
    const dots = mk('div', '', '', root);
    place(dots, { x: 780, y: 1640, w: 210, op: 0 });
    dots.style.height = '210px';
    const cols6 = ['#E2342B', '#F08A2C', '#F5C43C', '#6FA83C', '#3A8ED6', '#9B5BC7'];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const d = mk('div', '', '', dots);
      d.style.cssText = `position:absolute;left:${c * 26}px;top:${r * 26}px;width:20px;height:20px;
        background:${cols6[(r * 3 + c * 5) % 6]};opacity:${0.35 + rnd(r * 8 + c) * 0.55}`;
    }
    S2.el.dots = dots;

    const seal = mk('div', '', '<div style="font-family:var(--mono);font-size:46px;font-weight:500;color:#fff">75</div>', root);
    place(seal, { x: 900, y: 360, op: 0 });
    seal.style.width = '152px'; seal.style.height = '152px';
    seal.style.display = 'flex'; seal.style.alignItems = 'center'; seal.style.justifyContent = 'center';
    seal.style.background = 'var(--ink)';
    seal.style.clipPath = 'polygon(50% 0%,61% 18%,82% 12%,80% 34%,100% 45%,85% 61%,95% 82%,71% 83%,63% 100%,47% 86%,27% 96%,22% 74%,2% 66%,15% 48%,0% 30%,24% 26%,29% 4%,44% 15%)';
    S2.el.seal = seal;
  },
  render(t) {
    const { stripe, kicker, en, desc, stats, bars, dots, seal } = S2.el;
    const ks0 = p(t, 0, 1.2);
    stripe.style.opacity = ks0 * .95;

    kicker.style.opacity = easeOut(p(t, .1, .8)) * .95;

    S2.chars.forEach((c, i) => {
      const k = p(t, .3 + i * .12, .9 + i * .12);
      const s = backOut(k);
      c.style.opacity = clamp(k * 4);
      c.style.transform = `translateY(${lerp(150, 0, s)}px) rotate(${lerp(-9, 0, s)}deg) scale(${lerp(.6, 1, s)})`;
    });

    const ke = p(t, .85, 1.55);
    en.style.opacity = easeOut(ke);
    en.style.letterSpacing = lerp(.5, .16, easeOut(ke)) + 'em';

    const kd = p(t, 1.3, 2.15);
    desc.style.opacity = easeOut(kd);
    desc.style.transform = `translate(-50%,-50%) translateY(${lerp(60, 0, easeOut4(kd))}px)`;

    const kb = p(t, 2.15, 2.8);
    bars.style.opacity = kb * .95;
    bars.style.transform = `translate(-50%,-50%) scaleX(${easeOut(kb)})`;

    const ks = p(t, 2.7, 3.32);
    const ss = backOut(ks);
    seal.style.opacity = clamp(ks * 3);
    seal.style.transform = `translate(-50%,-50%) rotate(${lerp(-32, -12, ss)}deg) scale(${lerp(2.1, 1, ss)})`;

    const kt = p(t, 2.95, 3.75);
    stats.style.opacity = easeOut(kt);
    stats.style.transform = `translate(-50%,-50%) translateY(${lerp(70, 0, easeOut4(kt))}px)`;

    dots.style.opacity = easeOut(p(t, 3.9, 4.8)) * .85;
    dots.style.transform = `translate(-50%,-50%) scale(${lerp(.8, 1, easeOut4(p(t, 3.9, 4.8)))})`;
  }
};

// ══════════════════════════════════════════════════════
// S3 · 教材语法  12.5 – 25.0
// ══════════════════════════════════════════════════════
const S3 = {
  t0: 12.5, t1: 25.0,
  build(root) {
    root.innerHTML = '';
    // 顶部小标题
    const kick = mk('div', 'mono', 'COURSE / 必修 第一册', root);
    place(kick, { x: W / 2, y: 210, op: 0 });
    kick.style.fontSize = '22px'; kick.style.color = 'var(--red)';
    S3.el = { kick };

    const lines = [
      ['普通高等教育「野生」通识教材', 'var(--ink)', 44],
      ['课程变体识别 · 必修 第一册', 'var(--ink)', 44],
      ['不点名 / 不强制预习 / 不设期末考试', 'var(--ink2)', 33],
      ['75 枚标本 · 逐条配图与图注', 'var(--ink2)', 33],
    ];
    S3.lines = lines.map(([txt, col, size], i) => {
      const row = mk('div', '', '', root);
      place(row, { x: W / 2, y: 330 + i * 108, w: 900, op: 0 });
      row.style.display = 'flex'; row.style.alignItems = 'baseline'; row.style.gap = '18px';
      const num = mk('span', 'mono', String(i + 1).padStart(2, '0'), row);
      num.style.fontSize = '20px'; num.style.color = 'var(--red)'; num.style.flex = '0 0 auto';
      const tx = mk('span', '', txt, row);
      tx.style.fontSize = size + 'px'; tx.style.color = col;
      tx.style.fontWeight = size > 40 ? '700' : '500';
      return row;
    });

    // 卡片（部分出画）
    const card = mk('div', '', '', root);
    place(card, { x: W / 2, y: 1300, w: 820, op: 0 });
    card.style.height = '975px';
    card.style.overflow = 'hidden';
    card.style.background = '#fff';
    card.style.boxShadow = '0 0 0 8px #fff, 12px 14px 0 rgba(43,38,32,.16), 0 30px 60px rgba(43,38,32,.24)';
    card.innerHTML = `<img src="/film/shots/m_spec-003.png" style="width:100%;height:100%;object-fit:cover;object-position:top center">`;

    // 荧光笔（相对卡片定位，按截图实际内容行比例）
    const marks = ['50%', '57%', '95.5%'];
    S3.marks = marks.map((top) => {
      const m = mk('div', '', '', card);
      m.style.cssText = `position:absolute;left:5%;top:${top};height:30px;width:0;
        background:rgba(226,52,43,.5);mix-blend-mode:multiply;z-index:5;transform:rotate(-.4deg)`;
      return m;
    });
    S3.el.card = card;

    const tag = mk('div', 'stamp', '教材语法', root);
    place(tag, { x: 195, y: 700, op: 0 });
    tag.style.fontSize = '34px';
    tag.style.background = 'var(--paper)';
    S3.el.tag = tag;

    // 结论
    const close = mk('div', '', '', root);
    place(close, { x: W / 2, y: 790, w: 960, op: 0 });
    close.style.textAlign = 'center';
    close.innerHTML = `<div style="font-size:104px;font-weight:900;line-height:1.16;color:var(--ink);
      text-shadow:0 0 40px rgba(240,235,222,.95), 0 0 18px rgba(240,235,222,1)">它是真的<br>按教材语法编的。</div>`;
    S3.el.close = close;

    // 结论下的三个关键词
    const keys = ['SPEC 编号', '图号与图注', '出处与证据分级'];
    S3.keys = keys.map((txt, i) => {
      const el = mk('div', 'mono', txt, root);
      place(el, { x: W / 2 + (i - 1) * 300, y: 1060, op: 0 });
      el.style.fontSize = '21px';
      el.style.color = 'var(--ink)';
      el.style.background = 'var(--paper)';
      el.style.padding = '10px 16px';
      el.style.border = '2px solid var(--ink)';
      return el;
    });

    const bars = mk('div', 'bars', '', root);
    place(bars, { x: W / 2, y: 950, w: 720, op: 0 });
    S3.el.bars = bars;
  },
  render(t) {
    const { kick, card, tag, close, bars } = S3.el;
    kick.style.opacity = easeOut(p(t, .05, .6)) * (1 - easeOut(p(t, 8.4, 9.2)));

    S3.lines.forEach((row, i) => {
      const k = p(t, .15 + i * .26, .72 + i * .26);
      row.style.opacity = easeOut(k);
      row.style.transform = `translate(-50%,-50%) translateX(${lerp(-70, 0, easeOut4(k))}px)`;
    });

    // 列表整体上收（卡片出现时）
    const up = p(t, 4.0, 5.0);
    const su = easeInOut(up);
    S3.lines.forEach((row, i) => {
      row.style.transform = `translate(-50%,-50%) translateX(${lerp(-70, 0, easeOut4(p(t, .15 + i * .26, .72 + i * .26)))}px) translateY(${-su * (i < 2 ? 18 : 44)}px)`;
      row.style.opacity = easeOut(p(t, .15 + i * .26, .72 + i * .26)) * (1 - su * .3) * (1 - easeOut(p(t, 8.4, 9.2)));
    });

    // 卡片推上
    const kc = p(t, 3.8, 5.0);
    const sc = easeOut4(kc);
    card.style.opacity = clamp(kc * 2);
    card.style.transform = `translate(-50%,-50%) translateY(${lerp(1000, 0, sc)}px) rotate(${lerp(3.2, -.6, sc)}deg)`;

    // 荧光笔依次扫过
    S3.marks.forEach((m, i) => {
      const k = p(t, 5.4 + i * .7, 6.05 + i * .7);
      m.style.width = (easeOut(k) * 74) + '%';
    });

    const kt = p(t, 6.0, 6.6);
    const st = backOut(kt);
    tag.style.opacity = clamp(kt * 3);
    tag.style.transform = `translate(-50%,-50%) rotate(${lerp(-24, -9, st)}deg) scale(${lerp(1.9, 1, st)})`;

    // 卡片退场 → 结论压场
    const out = p(t, 8.5, 9.6);
    const so = easeOut(out);
    if (out > 0) {
      card.style.opacity = clamp(kc * 2) * (1 - so * .82);
      card.style.filter = `blur(${so * 5}px)`;
      card.style.transform = `translate(-50%,-50%) translateY(${lerp(0, 300, so)}px) rotate(-.6deg) scale(${lerp(1, .88, so)})`;
      tag.style.opacity = clamp(kt * 3) * (1 - so);
    }

    const kk = p(t, 9.0, 9.75);
    const sk = backOut(kk);
    close.style.opacity = clamp(kk * 3);
    close.style.transform = `translate(-50%,-50%) scale(${lerp(1.16, 1, sk)}) rotate(${lerp(2, -.8, sk)}deg)`;

    const kb = p(t, 9.5, 10.3);
    bars.style.opacity = easeOut(kb) * .95;
    bars.style.transform = `translate(-50%,-50%) scaleX(${easeOut(kb)})`;

    S3.keys.forEach((el, i) => {
      const k = p(t, 9.9 + i * .18, 10.5 + i * .18);
      const s = backOut(k);
      el.style.opacity = clamp(k * 3);
      el.style.transform = `translate(-50%,-50%) translateY(${lerp(34, 0, s)}px) scale(${lerp(.82, 1, s)})`;
    });
  }
};

// ══════════════════════════════════════════════════════
// S4 · 75 枚标本  25.0 – 40.0
// ══════════════════════════════════════════════════════
const S4 = {
  t0: 25.0, t1: 40.0,
  build(root) {
    root.innerHTML = '';
    // 大数字
    const num = mk('div', 'huge', '0', root);
    place(num, { x: W / 2, y: 700, op: 1 });
    num.style.fontSize = '640px'; num.style.color = 'var(--ink)';
    S4.el = { num };

    const unit = mk('div', 't', '枚标本', root);
    place(unit, { x: W / 2, y: 1060, op: 0 });
    unit.style.fontSize = '48px'; unit.style.fontWeight = '700'; unit.style.letterSpacing = '.2em';
    S4.el.unit = unit;

    const kick = mk('div', 'mono', 'SPECIMENS / 标本', root);
    place(kick, { x: W / 2, y: 300, op: 0 });
    kick.style.fontSize = '26px'; kick.style.color = 'var(--red)';
    S4.el.kick = kick;

    // 标本图（挑 15 张有代表性的）
    const picks = ['003', '032', '011', '021', '040', '050', '055', '060', '065', '070', '025', '028'];
    S4.cards = picks.map((id, i) => {
      const d = SPECS.find(s => s.id === id) || SPECS[i] || {};
      const box = mk('div', 'cut', '', root);
      box.style.width = '230px'; box.style.height = '230px';
      box.style.overflow = 'hidden';
      box.innerHTML = `<img src="/film/app/assets/${d.img}" style="width:100%;height:100%;object-fit:cover;display:block">
        <div data-hl style="position:absolute;inset:0;border:0px solid var(--red);z-index:4;pointer-events:none"></div>`;
      place(box, { x: W / 2, y: H / 2, op: 0 });
      return { box, seed: i };
    });

    // 分组标签
    const cats = [['本体', 4], ['换皮', 6], ['异形', 19], ['客串', 8], ['十二奶肖', 12], ['奶字母', 26]];
    const grp = mk('div', '', '', root);
    place(grp, { x: W / 2, y: 1600, w: 950, op: 0 });
    grp.style.display = 'grid';
    grp.style.gridTemplateColumns = 'repeat(3,1fr)';
    grp.style.gap = '14px 16px';
    S4.catEls = cats.map(([n, c]) => {
      const cell = mk('div', '', '', grp);
      cell.style.borderLeft = '7px solid ' + CAT_COLOR[n];
      cell.style.paddingLeft = '14px';
      cell.innerHTML = `<div style="font-size:27px;font-weight:900;color:var(--ink);line-height:1.2">${n}</div>
        <div class="huge" style="font-size:40px;color:${CAT_COLOR[n]};line-height:1">${c}</div>`;
      return cell;
    });
    S4.el.grp = grp;
  },
  render(t) {
    const { num, unit, kick, grp } = S4.el;

    // 数字滚动 0 → 75
    const kc = easeOut(p(t, .15, 2.3));
    const val = Math.round(75 * kc);
    num.textContent = val;

    // 数字从巨大缩到左上
    const km = p(t, 3.0, 4.2);
    const sm = easeInOut(km);
    const sc = lerp(1, .145, sm);
    const nx = lerp(W / 2, 210, sm);
    const ny = lerp(700, 250, sm);
    num.style.transform = `translate(-50%,-50%) translate(${nx - W / 2}px, ${ny - 700}px) scale(${sc})`;
    num.style.opacity = 1;

    unit.style.opacity = easeOut(p(t, 1.0, 1.7)) * (1 - easeOut(km));
    unit.style.transform = `translate(-50%,-50%) translateY(${lerp(40, 0, easeOut4(p(t, 1.0, 1.7)))}px)`;

    kick.style.opacity = easeOut(p(t, 3.2, 3.8));

    // 卡片飞入网格
    const cols = 3, cw = 300, ch = 250, ox = 200, oy = 570;
    S4.cards.forEach(({ box, seed }, i) => {
      const t0 = 3.3 + i * .16;
      const k = p(t, t0, t0 + .85);
      const s = easeOut4(k);
      const col = i % cols, row = Math.floor(i / cols);
      const gx = ox + col * cw + (row % 2 ? 26 : 0);
      const gy = oy + row * ch;
      // 从随机方向飞入
      const ang = (rnd(seed + 1) * Math.PI * 2);
      const dist = 1200 + rnd(seed + 7) * 700;
      const fx = Math.cos(ang) * dist, fy = Math.sin(ang) * dist;
      // 落定后的持续微抖（手摆定格感）
      const jx = k > .98 ? Math.sin(t * 2.9 + seed * 2.3) * 1.3 : 0;
      const jy = k > .98 ? Math.cos(t * 2.3 + seed * 1.7) * 1.3 : 0;
      box.style.opacity = clamp(k * 2.6);
      box.style.transform = `translate(-50%,-50%) translate(${lerp(fx, gx - W / 2, s) + jx}px, ${lerp(fy, gy - H / 2, s) + jy}px)
        rotate(${lerp(rnd(seed + 3) * 60 - 30, rnd(seed + 5) * 7 - 3.5, s)}deg) scale(${lerp(1.5, 1, s)})`;
      box.style.width = '230px'; box.style.height = '230px';
      // 逐枚辨认：一次框住一张
      const ht0 = 7.4 + i * .50;
      const hk = Math.min(1, Math.max(0, (t - ht0) / .09)) * Math.min(1, Math.max(0, (ht0 + .42 - t) / .12));
      const hlEl = box.querySelector('[data-hl]');
      if (hlEl) hlEl.style.borderWidth = (hk * 8).toFixed(2) + 'px';
    });

    grp.style.opacity = easeOut(p(t, 6.0, 6.9));
    grp.style.transform = `translate(-50%,-50%) translateY(${lerp(50, 0, easeOut4(p(t, 6.0, 6.9)))}px)`;
  }
};

// ══════════════════════════════════════════════════════
// S5 · 分类法  40.0 – 50.0
// ══════════════════════════════════════════════════════
const S5 = {
  t0: 40.0, t1: 50.0,
  build(root) {
    root.innerHTML = '';
    const head = mk('div', 't', '什么才算<br>一只奶蛙', root);
    place(head, { x: W / 2, y: 330, w: 920, op: 0 });
    head.style.fontSize = '96px'; head.style.fontWeight = '900'; head.style.lineHeight = '1.14';
    S5.el = { head };

    const lede = mk('div', 't', '不看「像不像」。看两件事：<br><b>形体保留了多少</b>，以及<b>谁在用</b>。', root);
    place(lede, { x: W / 2, y: 600, w: 900, op: 0 });
    lede.style.fontSize = '34px'; lede.style.lineHeight = '1.7'; lede.style.color = 'var(--ink2)';
    S5.el.lede = lede;

    const rows = [
      ['I', 'RESKIN', '换皮奶蛙', '仅皮肤、图标或封面变化，大部分形体特征保留。', 'var(--orange)'],
      ['II', 'MORPH', '异形奶蛙', '丢失大量形体特征，但仍保留眼睛与大笑。', 'var(--green)'],
      ['III', 'CROSSOVER', '客串角色', '本身不是奶蛙，因颜色或气质相近而联动。', 'var(--blue)'],
    ];
    S5.rows = rows.map(([rn, en, cn, ds, col], i) => {
      const row = mk('div', '', '', root);
      place(row, { x: W / 2, y: 880 + i * 250, w: 900, op: 0 });
      row.style.background = '#fff';
      row.style.border = '3px solid var(--ink)';
      row.style.padding = '30px 34px';
      row.style.boxShadow = '10px 10px 0 rgba(43,38,32,.14)';
      row.innerHTML = `
        <div style="display:flex;align-items:baseline;gap:16px">
          <span class="mono" style="font-size:22px;color:${col}">${rn} / ${en}</span>
        </div>
        <div style="font-size:52px;font-weight:900;color:var(--ink);margin-top:4px">${cn}</div>
        <div style="font-size:28px;color:var(--ink2);margin-top:8px;line-height:1.55">${ds}</div>
        <div style="position:absolute;left:0;top:0;bottom:0;width:12px;background:${col}"></div>`;
      row.style.position = 'absolute';
      return row;
    });

    const crit = mk('div', '', '', root);
    place(crit, { x: W / 2, y: 1660, w: 900, op: 0 });
    crit.style.background = 'var(--red)';
    crit.style.color = '#fff';
    crit.style.padding = '30px 34px';
    crit.style.textAlign = 'center';
    crit.innerHTML = `<div style="font-size:26px;letter-spacing:.24em;opacity:.85">IDENTIFICATION</div>
      <div style="font-size:52px;font-weight:900;margin-top:6px">保留「眼睛」与「大笑」</div>`;
    S5.el.crit = crit;
  },
  render(t) {
    const { head, lede, crit } = S5.el;
    const kh = p(t, .1, .8);
    head.style.opacity = clamp(kh * 3);
    head.style.transform = `translate(-50%,-50%) translateY(${lerp(70, 0, easeOut4(kh))}px)`;
    head.style.clipPath = `inset(0 0 ${(1 - easeOut(kh)) * 100}% 0)`;

    const kl = p(t, .9, 1.6);
    lede.style.opacity = easeOut(kl);

    S5.rows.forEach((row, i) => {
      const k = p(t, 1.7 + i * .35, 2.4 + i * .35);
      const s = easeOut4(k);
      const br = t > 3.0 ? Math.sin(t * 2.05 + i * 1.5) * 3.4 : 0;
      row.style.opacity = clamp(k * 2.4);
      row.style.transform = `translate(-50%,-50%) translateX(${lerp(420, 0, s)}px) translateY(${br.toFixed(2)}px) rotate(${lerp(4, 0, s)}deg)`;
    });

    const kc = p(t, 5.2, 6.0);
    const scc = backOut(kc);
    crit.style.opacity = clamp(kc * 3);
    crit.style.transform = `translate(-50%,-50%) scale(${lerp(1.5, 1, scc)}) rotate(${lerp(-5, 0, scc)}deg)`;
  }
};

// ══════════════════════════════════════════════════════
// S6 · 创作过程  50.0 – 65.0
// ══════════════════════════════════════════════════════
const S6 = {
  t0: 50.0, t1: 65.0,
  build(root) {
    root.innerHTML = '';
    const head = mk('div', 't', '这份东西<br>做了四轮。', root);
    place(head, { x: W / 2, y: 300, w: 920, op: 0 });
    head.style.fontSize = '96px'; head.style.fontWeight = '900'; head.style.lineHeight = '1.14';
    S6.el = { head };

    const vers = [
      ['v1', '考据卷宗', '16 页 · 两套冲突叙事 · 证据分级 A/B/C/D', true],
      ['v2', '教材讲义', 'Cobalt Grid · 实验活动 · 期中真题', true],
      ['v3', '图鉴长页', '37 枚标本 · 6 分组 · 可筛选可打卡', true],
      ['v4', 'Sakura Chroma', '75 枚 · 十二奶肖 + 奶字母 · 定稿', false],
    ];
    S6.vers = vers.map(([v, name, note, out], i) => {
      const row = mk('div', '', '', root);
      place(row, { x: W / 2, y: 700 + i * 190, w: 900, op: 0 });
      row.innerHTML = `
        <div style="display:flex;align-items:baseline;gap:20px">
          <span class="mono" style="font-size:26px;color:var(--red);flex:0 0 auto">${v}</span>
          <span style="font-size:52px;font-weight:900;color:var(--ink)">${name}</span>
        </div>
        <div style="font-size:27px;color:var(--ink2);margin-top:2px;padding-left:62px">${note}</div>`;
      // 红色划线
      const strike = mk('div', '', '', row);
      strike.style.position = 'absolute';
      strike.style.left = '56px'; strike.style.top = '46px';
      strike.style.height = '9px'; strike.style.width = '0px';
      strike.style.background = 'var(--red)';
      strike.style.transform = 'rotate(-1.6deg)';
      strike.style.opacity = 0;
      return { row, strike, out };
    });

    // 素材数字
    const mat = mk('div', '', '', root);
    place(mat, { x: W / 2, y: 1620, w: 900, op: 0 });
    mat.style.display = 'grid'; mat.style.gridTemplateColumns = 'repeat(3,1fr)'; mat.style.gap = '10px';
    mat.innerHTML = [
      ['112', '素材文件'], ['1.49', 'MB 总计'], ['70', '帧一手图版']
    ].map(([n, l], i) => `<div style="text-align:center">
        <div class="huge" data-num="${n}" data-i="${i}" style="font-size:76px;color:var(--ink)">0</div>
        <div style="font-size:24px;color:var(--ink2)">${l}</div></div>`).join('');
    S6.el.mat = mat;
    S6.nums = [...mat.querySelectorAll('[data-num]')].map(e => ({ el: e, to: parseFloat(e.dataset.num), dec: e.dataset.num.includes('.') ? 2 : 0 }));
  },
  render(t) {
    const { head, mat } = S6.el;
    const kh = p(t, .1, .75);
    head.style.opacity = clamp(kh * 3);
    head.style.transform = `translate(-50%,-50%) translateY(${lerp(70, 0, easeOut4(kh))}px)`;

    S6.vers.forEach(({ row, strike, out }, i) => {
      const k = p(t, .9 + i * .55, 1.5 + i * .55);
      row.style.opacity = clamp(k * 2.6);
      row.style.transform = `translate(-50%,-50%) translateX(${lerp(-90, 0, easeOut4(k))}px)`;
      if (out) {
        const ks = p(t, 1.9 + i * .55, 2.5 + i * .55);
        strike.style.opacity = ks > 0 ? 1 : 0;
        strike.style.width = (easeOut(ks) * 700) + 'px';
      } else {
        // 最后一版：盖绿章
        const kg = p(t, 3.5, 4.1);
        strike.style.opacity = 0;
        if (kg > 0) {
          row.style.background = 'rgba(111,168,60,' + (0.14 * easeOut(kg)) + ')';
          row.style.boxShadow = `0 0 0 ${easeOut(kg) * 4}px rgba(111,168,60,.5)`;
        }
      }
    });

    const km = p(t, 6.0, 6.9);
    mat.style.opacity = easeOut(km);
    mat.style.transform = `translate(-50%,-50%) translateY(${lerp(60, 0, easeOut4(km))}px)`;
    // 数字滚动
    S6.nums.forEach(({ el, to, dec }, i) => {
      const kk = easeOut(p(t, 6.05 + i * .14, 8.4 + i * .14));
      el.textContent = dec ? (to * kk).toFixed(dec) : Math.round(to * kk);
    });
  }
};

// ══════════════════════════════════════════════════════
// S7 · 交互  65.0 – 72.5
// ══════════════════════════════════════════════════════
const S7 = {
  t0: 65.0, t1: 72.5,
  build(root) {
    root.innerHTML = '';
    const head = mk('div', 't', '可筛选 · 可打卡 · 可自测', root);
    place(head, { x: W / 2, y: 260, w: 920, op: 0 });
    head.style.fontSize = '54px'; head.style.fontWeight = '900'; head.style.textAlign = 'center';
    S7.el = { head };

    // 手机截图
    const phone = mk('div', 'cut', '', root);
    place(phone, { x: W / 2, y: 1070, w: 700, op: 0 });
    phone.style.height = '1020px';
    phone.style.overflow = 'hidden';
    phone.style.borderRadius = '0';
    phone.innerHTML = `<img src="/film/shots/m_grid2.png" style="width:100%;height:100%;object-fit:cover;object-position:top center">`;
    S7.el.phone = phone;

    // 三个标签
    const tags = ['筛选 7 类', '打卡 75', '猜名 10 题'];
    S7.tags = tags.map((txt, i) => {
      const el = mk('div', 'stamp', txt, root);
      place(el, { x: 240 + i * 300, y: 400, op: 0 });
      el.style.fontSize = '29px';
      el.style.whiteSpace = 'nowrap';
      el.style.background = 'var(--paper)';
      el.style.transform = `rotate(${-6 + i * 4}deg)`;
      return el;
    });

    const quote = mk('div', 't', '「在此卷上答题无效，<br>但笑出声就算通过。」', root);
    place(quote, { x: W / 2, y: 1700, w: 900, op: 0 });
    quote.style.fontSize = '34px'; quote.style.lineHeight = '1.6'; quote.style.textAlign = 'center';
    quote.style.color = 'var(--ink2)';
    S7.el.quote = quote;
  },
  render(t) {
    const { head, phone, quote } = S7.el;
    const kh = p(t, .05, .7);
    head.style.opacity = easeOut(kh);
    head.style.transform = `translate(-50%,-50%) translateY(${lerp(-50, 0, easeOut4(kh))}px)`;

    const kp = p(t, .35, 1.5);
    const sp = easeOut4(kp);
    phone.style.opacity = clamp(kp * 2);
    const flt = t > 2.0 ? Math.sin(t * 1.45) * 6 : 0;
    phone.style.transform = `translate(-50%,-50%) translateY(${(lerp(760, 0, sp) + flt).toFixed(2)}px) rotate(${lerp(7, -1.2, sp)}deg)`;

    S7.tags.forEach((el, i) => {
      const k = p(t, 1.4 + i * .28, 1.95 + i * .28);
      const s = backOut(k);
      el.style.opacity = clamp(k * 3);
      el.style.transform = `translate(-50%,-50%) rotate(${lerp(-24, -6 + i * 4, s)}deg) scale(${lerp(1.8, 1, s)})`;
    });

    const kq = p(t, 3.2, 3.9);
    quote.style.opacity = easeOut(kq);
    quote.style.transform = `translate(-50%,-50%) translateY(${lerp(40, 0, easeOut4(kq))}px)`;
  }
};

// ══════════════════════════════════════════════════════
// S8 · 收尾  72.5 – 80.0
// ══════════════════════════════════════════════════════
const S8 = {
  t0: 72.5, t1: 80.0,
  build(root) {
    root.innerHTML = '';
    const l1 = mk('div', 't', '奶蛙不叛', root);
    place(l1, { x: W / 2, y: 700, w: 940, op: 0 });
    l1.style.fontSize = '150px'; l1.style.fontWeight = '900'; l1.style.textAlign = 'center'; l1.style.letterSpacing = '.02em';

    const l2 = mk('div', 't', '快乐永存。', root);
    place(l2, { x: W / 2, y: 900, w: 940, op: 0 });
    l2.style.fontSize = '150px'; l2.style.fontWeight = '900'; l2.style.textAlign = 'center';
    l2.style.color = 'var(--red)';

    const bars = mk('div', 'bars', '', root);
    place(bars, { x: W / 2, y: 1090, w: W, op: 0 });

    const link = mk('div', 'mono', 'naiwa-studies-101', root);
    place(link, { x: W / 2, y: 1290, op: 0 });
    link.style.fontSize = '34px'; link.style.color = 'var(--ink2)'; link.style.letterSpacing = '.16em';

    const sub = mk('div', 't', '一个把梗做成教材的开源项目', root);
    place(sub, { x: W / 2, y: 1390, op: 0 });
    sub.style.fontSize = '30px'; sub.style.color = 'var(--ink2)';

    const credits = mk('div', 'mono', 'SPECIMENS 75 · PLATES 95 · COURSE 6', root);
    place(credits, { x: W / 2, y: 1720, op: 0 });
    credits.style.fontSize = '22px'; credits.style.color = 'rgba(90,81,69,.7)';

    S8.el = { l1, l2, bars, link, sub, credits };
  },
  render(t) {
    const { l1, l2, bars, link, sub, credits } = S8.el;
    const k1 = p(t, .1, .75);
    const s1 = backOut(k1);
    const br = 1 + 0.008 * Math.sin(t * 1.75);
    l1.style.opacity = clamp(k1 * 3.5);
    l1.style.transform = `translate(-50%,-50%) scale(${(lerp(1.2, 1, s1) * br).toFixed(4)})`;
    l1.style.clipPath = `inset(${(1 - easeOut(k1)) * 100}% 0 0 0)`;

    const k2 = p(t, .55, 1.25);
    const s2 = backOut(k2);
    l2.style.opacity = clamp(k2 * 3.5);
    l2.style.transform = `translate(-50%,-50%) scale(${(lerp(1.2, 1, s2) * (1 + 0.008 * Math.sin(t * 1.75 + 0.5))).toFixed(4)})`;
    l2.style.clipPath = `inset(${(1 - easeOut(k2)) * 100}% 0 0 0)`;

    const k3 = p(t, 1.3, 2.0);
    bars.style.opacity = easeOut(k3);
    bars.style.transform = `translate(-50%,-50%) scaleX(${easeOut(k3)})`;
    bars.style.backgroundPosition = `${(t * 46).toFixed(1)}px 0`;

    const k4 = p(t, 1.7, 2.4);
    link.style.opacity = easeOut(k4);
    sub.style.opacity = easeOut(p(t, 1.95, 2.6)) * .9;
    credits.style.opacity = easeOut(p(t, 2.4, 3.2)) * .8;
  }
};

// ── 时间轴 ────────────────────────────────────────────
const SCENES = [
  ['s1', S1], ['s2', S2], ['s3', S3], ['s4', S4],
  ['s5', S5], ['s6', S6], ['s7', S7], ['s8', S8],
];

function boot() {
  SCENES.forEach(([id, S]) => {
    S.root = document.getElementById(id);
    S.build(S.root);
  });
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
      // 活体层：整页极轻微的呼吸与漂移，模拟纸张在桌面上的微动（定格动画的手摆感）
      const br = 0.0022 * Math.sin(t * 1.05 + i * 1.7);
      const dx = 2.0 * Math.sin(t * 0.63 + i * 2.1);
      const dy = 2.4 * Math.cos(t * 0.47 + i * 0.9);
      S.root.style.transformOrigin = 'center center';
      S.root.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${(1 + br).toFixed(5)})`;
    }
  }
  const pg = document.getElementById('pgno');
  if (pg) pg.textContent = String(cur + 1).padStart(2, '0') + ' / 08';
  // 全片末尾的纸色微呼吸（避免死帧）
  const g = document.getElementById('grain');
  g.style.opacity = 0.05 + 0.008 * Math.sin(t * 2.1);
  return true;
};

window.FILM = { DUR, FPS, W, H };

// 启动
Promise.resolve(loadSpecs()).then(() => {
  boot();
  window.__READY__ = true;
}).catch(e => {
  console.error('specs load fail', e);
  boot();
  window.__READY__ = true;
});
