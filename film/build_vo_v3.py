#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 loopback 录音按句切开，重建 52 秒旁白轨。

规则：相邻碎片间隙 > 1.5s 视为句边界（<#1.8#> 停顿 + 自然收尾 ≈ 2.0s）；
句内逗号停顿只有 0.26–0.40s，不会误切。
"""
import os
import sys

import numpy as np
import soundfile as sf

D = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(D, 'out', 'mp3src', 'vo_full.wav')
DST = os.path.join(D, 'out', 'voice_v3.wav')

SR = 48000
DUR = 52.0
GAP_SPLIT = 1.5      # 句边界判定
LEAD = 0.04          # 每句前后留白

# 每句落点。相对旧版（Huihui）做了三处微调，因为新旁白更短、句均 2.2s，
# 按原时间点会出现 0.06–0.12s 的"零间隙连读"，听感糊在一起：
#   4 句 10.10→10.30、9 句 29.40→29.20、10 句 33.10→32.60、11 句 36.40→36.90
# 调整后最小间隙 0.32s。
PLACES = [0.60, 4.20, 7.80, 10.30, 13.30, 16.40,
          20.60, 23.60, 29.20, 32.60, 36.90, 49.50]
TEXTS = [
    '朋友发来一份复习资料。',
    '有人把它当成一门学科在学。',
    '而且，是真的在学。',
    '所以它被编成了一本教材。',
    '课程、图号、出处。',
    '七十五种变体，每一个都有编号。',
    '越往后，形体剩得越少。',
    '但只要眼睛和笑还在，它就还是它。',
    '这份东西，推倒重做了四次。',
    '从研究，到课程，到图鉴。',
    '其中一版，连文件都没留下。',
    '奶蛙不叛，快乐永存。',
]

x, sr = sf.read(SRC, dtype='float32')
if x.ndim > 1:
    mono = x.mean(axis=1)
else:
    mono = x
    x = np.stack([x, x], axis=1)
assert sr == SR, f'采样率不符 {sr}'

# ── 包络与碎片检测 ──────────────────────────────
win = int(0.02 * sr)
n = len(mono) // win
rms = np.sqrt((mono[:n * win].reshape(n, win) ** 2).mean(axis=1))
db = 20 * np.log10(rms + 1e-12)
thr = -45.0
voiced = db > thr

frags = []
i, min_gap, min_len = 0, int(0.25 / 0.02), int(0.18 / 0.02)
while i < n:
    if voiced[i]:
        j, gap, last = i, 0, i
        while j < n:
            if voiced[j]:
                last, gap = j, 0
            else:
                gap += 1
                if gap > min_gap:
                    break
            j += 1
        if last - i + 1 >= min_len:
            frags.append([i * 0.02, (last + 1) * 0.02])
        i = j
    else:
        i += 1

# ── 按间隙合并成句 ──────────────────────────────
groups = [[frags[0]]]
for k in range(1, len(frags)):
    if frags[k][0] - frags[k - 1][1] > GAP_SPLIT:
        groups.append([frags[k]])
    else:
        groups[-1].append(frags[k])

print(f'碎片 {len(frags)} → 合并成 {len(groups)} 句（期望 {len(PLACES)}）')
if len(groups) != len(PLACES):
    print('⚠ 句数不匹配，请检查阈值')
    for k, g in enumerate(groups):
        print(f'  句{k+1}: {g[0][0]:.2f}–{g[-1][1]:.2f}  ({len(g)} 碎片)')

# ── 逐句处理并落位 ──────────────────────────────
out = np.zeros((int(DUR * SR), 2), dtype=np.float32)
report = []
for k, g in enumerate(groups[:len(PLACES)]):
    a = max(0.0, g[0][0] - LEAD)
    b = min(len(mono) / SR, g[-1][1] + LEAD)
    seg = x[int(a * SR):int(b * SR)].copy()
    if seg.shape[0] == 0:
        continue

    # 峰值归一 + 轻度软限幅（TTS 动态本来就平）
    peak = np.abs(seg).max()
    if peak > 1e-6:
        seg = seg / peak * 0.72
    seg = np.tanh(seg * 1.06) / np.tanh(1.06) * 0.72

    t0 = PLACES[k]
    i0 = int(round(t0 * SR))
    i1 = min(i0 + seg.shape[0], out.shape[0])
    if i1 <= i0:
        print(f'  句{k+1} 超出时长，跳过')
        continue
    out[i0:i1] += seg[:i1 - i0]

    segdur = (i1 - i0) / SR
    nxt = PLACES[k + 1] if k + 1 < len(PLACES) else DUR
    room = nxt - t0
    flag = '  ⚠ 与下一句重叠' if segdur > room + 0.02 else ''
    report.append((k + 1, t0, segdur, room, room - segdur, TEXTS[k], flag))

print('\n序号  起点    时长   窗口   余量   文案')
for no, t0, sd, rm, left, tx, flag in report:
    print(f'{no:3d}  {t0:5.2f}s  {sd:5.2f}s  {rm:5.2f}s  {left:+5.2f}s  {tx}{flag}')

peak = np.abs(out).max()
print(f'\n合成轨 peak {peak:.4f} ({20*np.log10(peak+1e-12):.1f} dBFS)')
sf.write(DST, out, SR, subtype='PCM_24')
print(f'输出 {DST} | {os.path.getsize(DST)/1048576:.2f} MB | 时长 {out.shape[0]/SR:.2f}s')
