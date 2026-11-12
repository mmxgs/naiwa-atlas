#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最终混流：两遍线性 loudnorm（首遍测量 → 次遍静态增益），峰值可控。
单遍动态模式在 52s 片上 TP 实测会比设定值高 0.7~1.0 dB，不可用于交付。
"""
import json
import os
import re
import subprocess
import sys

FF = r"E:/VideoTools/bin/ffmpeg.exe"
FP = r"E:/VideoTools/bin/ffprobe.exe"
D = r"C:/Users/Administrator/WorkBuddy/2026-11-12-19-37-26/film"
IN = sys.argv[1] if len(sys.argv) > 1 else "video_v2b.mp4"
OUT = sys.argv[2] if len(sys.argv) > 2 else "naiwa_v2_1.mp4"
AUD = sys.argv[3] if len(sys.argv) > 3 else "audio_v2.wav"
VOI = sys.argv[4] if len(sys.argv) > 4 else "voice_v2.wav"

TARGET_I = -14.0
TARGET_TP = -2.6      # 留 AAC 编码抬峰余量（实测约 +0.5dB）
TARGET_LRA = 9.0

pre = os.path.join(D, "out", "_pre.wav")
fin = os.path.join(D, "out", "_fin.wav")


def run(args, **kw):
    r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace", **kw)
    if r.returncode != 0:
        print("FAIL:", " ".join(args[:6]))
        print(r.stderr[-1500:])
        sys.exit(1)
    return r


# ── 1. 混音 + 旁白触发 ducking（不归一） ──────────────
print("[1/4] 混音 + ducking")
# 增益关系：短视频里旁白应比 BGM 高 8–10dB。
# 0.90/1.85 是给 Huihui 机械音的旧设置，人声太软；真人旁白动态大，
# 实测只比 BGM 高 2.1dB，必须重配。
fc = (
    "[1:a]volume=0.55[m];"
    "[2:a]asplit=2[v1][v2];"
    "[m][v1]sidechaincompress=threshold=0.025:ratio=9:attack=6:release=260:makeup=1[md];"
    "[md][v2]amix=inputs=2:duration=first:weights=1 2.6:normalize=0[a]"
)
run([FF, "-y", "-hide_banner", "-loglevel", "error",
     "-i", os.path.join(D, "out", IN),
     "-i", os.path.join(D, "out", AUD),
     "-i", os.path.join(D, "out", VOI),
     "-filter_complex", fc, "-map", "[a]",
     "-ar", "48000", "-ac", "2", pre])
print("     →", round(os.path.getsize(pre) / 1048576, 1), "MB")

# ── 2. 首遍：测量 ────────────────────────────────
print("[2/4] 测量响度")
r = run([FF, "-hide_banner", "-nostats", "-i", pre,
         "-af", f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
         "-f", "null", "-"])
raw = r.stderr[r.stderr.rfind("{"):r.stderr.rfind("}") + 1]
m = json.loads(raw)
print(f"     measured_I={m['input_i']}  TP={m['input_tp']}  LRA={m['input_lra']}  "
      f"thresh={m['input_thresh']}  offset={m['target_offset']}")

# ── 3. 次遍：线性增益（不动动态） ─────────────────
print("[3/4] 线性归一")
# AAC 编码会把峰值抬高约 1.2dB，所以在编码前再压一次限幅：
# 线性归一只给一个增益，无法同时锁 I 和 TP；用 alimiter 只削掉超出的峰，不动整体响度。
peak_lin = 10 ** (-2.7 / 20.0)
af = (
    f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}"
    f":measured_I={m['input_i']}:measured_TP={m['input_tp']}"
    f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
    f":offset={m['target_offset']}:linear=true"
    f",alimiter=limit={peak_lin:.4f}:level=false:attack=3:release=60"
)
run([FF, "-y", "-hide_banner", "-loglevel", "error", "-i", pre,
     "-af", af, "-ar", "48000", "-ac", "2", fin])

# 归一后自检
r = run([FF, "-hide_banner", "-nostats", "-i", fin,
         "-af", "ebur128=peak=true", "-f", "null", "-"])
tail = r.stderr[-1200:]
li = re.findall(r"I:\s+(-?[\d.]+) LUFS", tail)
lp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", tail)
print("     wav 校验  I=", li[-1] if li else "?", " Peak=", lp[-1] if lp else "?")

# ── 4. 合并 + 终检 ──────────────────────────────
print("[4/4] 合并视频")
dst = os.path.join(D, "out", OUT)
run([FF, "-y", "-hide_banner", "-loglevel", "error",
     "-i", os.path.join(D, "out", IN), "-i", fin,
     "-map", "0:v", "-map", "1:a",
     "-c:v", "copy", "-c:a", "aac", "-ar", "48000", "-b:a", "192k",
     "-shortest", "-movflags", "+faststart", dst])

r = run([FF, "-hide_banner", "-nostats", "-i", dst,
         "-af", "ebur128=peak=true", "-f", "null", "-"])
tail = r.stderr[-1200:]
li = re.findall(r"I:\s+(-?[\d.]+) LUFS", tail)
lp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", tail)
probe = run([FP, "-v", "error", "-show_entries", "format=duration,size",
             "-of", "default=noprint_wrappers=1", dst]).stdout

print("\n=== 成片 ===")
print(probe.strip())
print(f"响度 I={li[-1] if li else '?'} LUFS   TruePeak={lp[-1] if lp else '?'} dBFS")
print(f"文件 {round(os.path.getsize(dst)/1048576,1)} MB")

for f in (pre, fin):
    try:
        os.remove(f)
    except OSError:
        pass
