"""《奶娃图鉴》V2 配乐 · 52s / BPM 120（一小节 2.0s）
段落边界 0/4/16/29/41/49/52 不全落在小节线上，因此每个转场一律用实心音效（stamp/punch）
把画面钉在拍上——短视频里观众感知的是"音效对画面"，不是"小节对齐"。
"""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ref', 'lib', 'audio'))
import numpy as np
import mgaudio as mg
from mgaudio import recipes, sfx, fm, drums, samples
from mgaudio.core import Sound
import soundfile as sf

D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, 'out')
DUR, BPM = 52.0, 120

HITS = [
    0.05, 1.05, 1.16, 1.27, 1.38, 1.49, 1.60, 1.71, 1.82, 1.93, 2.04, 2.15, 2.26,
    2.52, 3.05,
    4.00, 4.30, 7.80, 10.00, 13.10,
    16.05, 16.83, 17.61,
    18.60, 20.40, 22.20,
    24.00, 24.34, 24.68, 26.90,
    29.05,
    30.70, 32.00, 33.40, 34.80,
    38.20, 38.90, 40.60,
    41.20, 43.80, 46.30,
    49.05, 49.40, 49.95, 50.30,
]

m = recipes.explainer(
    duration=DUR, bpm=BPM, key='F', mode='major',
    prog='Imaj7 V vi7 IVmaj7',
    drop=16.0, build=4.0, outro=41.0,
    hits=HITS, music_level=-21.0,
)
print('form:', m.form.summary() if hasattr(m.form, 'summary') else '', '| tracks:', list(m.tracks))

# ── 钩子：PDF 砸下 → 打开 → 12 声递增 ─────────────
m.sfx(sfx.impact('thud'), at=0.05, gain=-2, verb=-8)
m.sfx(samples.hit('slapstick', vel=0.8), at=0.05, gain=-8, pan=0.1)
# 打开：纸张翻页（用 impact 叠出"翻"的质感，避免无信息量的 whoosh）
m.sfx(sfx.impact('punch'), at=1.05, gain=-6, verb=-12)
for i in range(12):
    t = 1.05 + i * 0.11
    m.sfx(samples.hit('woodblock', vel=0.30 + 0.030 * i, maxdur=0.055).fade(0.016),
          at=t, gain=-19 + i * 0.75, pan=-0.45 + (i % 5) * 0.22)
# 书收拢 + 75
m.sfx(sfx.stamp('rubber', seed=3), at=2.52, gain=-3, pan=0.15)
m.sfx(sfx.impact('punch'), at=3.05, gain=-2, verb=-10)

# ── 幕2 引文 / 标题 / 三件套 ──────────────────────
m.sfx(samples.hit('woodblock', vel=0.55, maxdur=0.09).fade(0.02), at=4.30, gain=-11, pan=-0.2)
m.sfx(samples.hit('woodblock', vel=0.62, maxdur=0.09).fade(0.02), at=7.80, gain=-10, pan=0.1)
m.sfx(sfx.stamp('rubber', seed=7), at=10.00, gain=-3, pan=0.25)
for i, t in enumerate([13.10, 13.65, 14.20]):
    m.sfx(sfx.stamp('rubber', seed=20 + i), at=t, gain=-8 + i, pan=-0.35 + i * 0.3)

# ── 幕3 特写 3 张 ────────────────────────────────
for i, t in enumerate([16.05, 16.83, 17.61]):
    m.sfx(samples.hit('slapstick', vel=0.72), at=t, gain=-7, pan=-0.3 + i * 0.3)
    m.sfx(sfx.impact('thud'), at=t, gain=-13)

# ── 幕3 三组对照：落地 + 红框"呲"声（不用 whoosh）────
for i, t in enumerate([18.60, 20.40, 22.20]):
    m.sfx(sfx.impact('thud'), at=t, gain=-6, pan=-0.4)
    m.sfx(samples.hit('woodblock', vel=0.68, maxdur=0.07).fade(0.02), at=t + 0.34, gain=-9, pan=0.35)
    m.sfx(samples.hit('woodblock', vel=0.5, maxdur=0.06).fade(0.02), at=t + 0.52, gain=-11, pan=0.5)

# ── 幕3 三分支 + 判据条 ──────────────────────────
for i, t in enumerate([24.00, 24.34, 24.68]):
    m.sfx(samples.hit('woodblock', vel=0.52, maxdur=0.07).fade(0.02), at=t, gain=-10, pan=-0.3 + i * 0.3)
m.sfx(sfx.impact('punch'), at=26.90, gain=-3, verb=-12)

# ── 幕4 四稿 ────────────────────────────────────
m.sfx(sfx.impact('punch'), at=29.05, gain=-2, verb=-10)
for i, t in enumerate([30.70, 32.00, 33.40, 34.80]):
    m.sfx(samples.hit('slapstick', vel=0.55 + 0.08 * i), at=t, gain=-9 + i, pan=-0.35 + i * 0.23)
m.sfx(sfx.stamp('rubber', seed=41), at=38.20, gain=-4, pan=0.0)
m.sfx(samples.hit('woodblock', vel=0.6, maxdur=0.07).fade(0.02), at=38.90, gain=-8, pan=0.3)
m.sfx(sfx.impact('punch'), at=40.60, gain=-4, verb=-14)

# ── 幕5 录屏：点击声（轻、干脆）+ 判分 ─────────────
for i, t in enumerate([41.20, 43.80, 46.30]):
    m.sfx(sfx.click('wood'), at=t, gain=-9, pan=-0.2 + i * 0.2)
m.sfx(sfx.pop('soft', pitch=1.1), at=47.10, gain=-8, pan=0.3)   # 答对

# ── 幕6 收尾 ────────────────────────────────────
m.sfx(sfx.impact('punch'), at=49.05, gain=-2, verb=-9)
m.sfx(sfx.impact('punch'), at=49.40, gain=-3, verb=-9)
m.sfx(sfx.stamp('rubber', seed=91), at=49.95, gain=-5, pan=0.0)
m.sfx(sfx.reverse_cymbal(dur=1.2), at=47.6, gain=-16)

# ── 频谱提亮（画面是印刷品，声音要清脆）────────────
for name, g, p_ in [('shaker', 5.5, 0.30), ('rim', 4.5, -0.25), ('glock', 4.5, 0.15),
                    ('arp', 3.0, -0.30), ('tick', 3.5, 0.35), ('marimba', 2.0, -0.1),
                    ('clap', 1.5, 0.0), ('sub', -2.5, 0.0), ('pluckbass', -1.5, 0.0), ('pad', -1.5, 0.0)]:
    if name in m.tracks:
        m.track(name, gain=g, pan=p_)
m.groups['sfx'].gain = 5.0

# 录屏段（41–49）音乐让位给画面：压 -4.5 dB
try:
    m.group('music').automate('gain', [(40.9, 0), (41.2, -4.5), (48.7, -4.5), (49.0, 0)])
except Exception as e:
    print('automate skip', e)

res = m.export(os.path.join(OUT, 'audio_v2.wav'))
print({k: res[k] for k in ('duration', 'lufs', 'true_peak', 'stereo_corr', 'longest_gap') if k in res})
print('bands', res.get('bands'))
print('warnings', res.get('warnings'))

# 瞬态自检
def audit(path):
    x, sr = sf.read(path)
    if x.ndim > 1: x = x.mean(1)
    win = int(0.010 * sr); n = len(x) // win
    e = np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(e + 1e-12)
    ok = 0; miss = []
    for h in HITS:
        i = int(h * sr / win)
        pre = db[max(0, i - 7):max(1, i - 1)].mean()
        post = db[i:i + 12].max()
        if post - pre >= 2.0: ok += 1
        else: miss.append((round(h, 2), round(float(post - pre), 1)))
    print(f'瞬态命中 {ok}/{len(HITS)}')
    if miss: print('  偏弱:', miss[:10])

audit(os.path.join(OUT, 'audio_v2.wav'))
