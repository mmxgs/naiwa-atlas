/**
 * 环境探测：浏览器与 ffmpeg 的位置。
 * 优先读环境变量，其次自动找系统里的 Chrome / Edge，最后退回 PATH。
 *
 *   CHROME_PATH  指定浏览器可执行文件
 *   FFMPEG       指定 ffmpeg 可执行文件
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');

function resolveBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cands = {
    win32: [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ],
    linux: ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  }[process.platform] || [];
  const hit = cands.find(p => fs.existsSync(p));
  if (!hit) throw new Error('找不到浏览器，请设置 CHROME_PATH 指向 Chrome / Edge');
  return hit;
}

function resolveFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const local = path.join(REPO, 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  return fs.existsSync(local) ? local : 'ffmpeg';
}

module.exports = { REPO, resolveBrowser, resolveFfmpeg };
