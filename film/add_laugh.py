#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在旁白轨上：①删掉第 12 句"奶蛙不叛，快乐永存" ②在收尾插图砸下的那一刻塞入笑声。

旁白轨本身已按 52s 建好，这里只做覆盖，不改动其余 11 句。
"""
import os
import sys

import numpy as np
import soundfile as sf

D = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(D, 'out', 'voice_v3.wav')
DST = os.path.join(D, 'out', 'voice_v5.wav')
SR = 48000

VAR = sys.argv[1] if len(sys.argv) > 1 else 'b_p3'
LAUGH_AT = 49.40     # 略早于插图砸下（画面 kp 起点 49.58），让声音领着画面
CUT_FROM = 49.40     # 从这句之后一律清空

x, sr = sf.read(SRC, dtype='float32')
assert sr == SR, f'采样率不符 {sr}'

# ① 清空标语那一句
i0 = int(CUT_FROM * SR)
removed_peak = float(np.abs(x[i0:]).max())
x[i0:] = 0.0
print(f'清空 {CUT_FROM}s 之后：原该段峰值 {20*np.log10(removed_peak+1e-12):.1f} dBFS → 0')

# ② 叠入笑声
lpath = os.path.join(D, 'sfx', VAR if VAR.endswith('.wav') else f'laugh_{VAR}.wav')
l, lsr = sf.read(lpath, dtype='float32')
assert lsr == SR
if l.ndim > 1:
    l = l.mean(axis=1)
l = np.stack([l, l], axis=1) * 0.95

i1 = int(LAUGH_AT * SR)
i2 = min(i1 + l.shape[0], x.shape[0])
x[i1:i2] += l[:i2 - i1]
print(f'笑声 {VAR} 置于 {LAUGH_AT}s，长度 {(i2-i1)/SR:.2f}s，到 {i2/SR:.2f}s')

peak = float(np.abs(x).max())
print(f'合成轨 peak {peak:.3f} ({20*np.log10(peak+1e-12):.1f} dBFS)')

sf.write(DST, x, SR, subtype='PCM_24')
print(f'输出 {DST} | {os.path.getsize(DST)/1048576:.2f} MB | {x.shape[0]/SR:.2f}s')
