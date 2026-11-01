// Unified 24/7 Watchdog Launcher for Live TikTok Studio:
// Starts and supervises:
// 1. Admin Tổng (Master Admin & MongoDB Hub on :8791)
// 2. Game 1: Cúng Chùa Online (:8787 Render / :8788 Admin)
// 3. Game 2: Cuộc Đua Kỳ Thú (:8789 Render / :8790 Admin)
// Automatically restarts any service within 3s if it crashes during 24/7 VPS streaming.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const extraArgs = process.argv.slice(2);

let shuttingDown = false;
const activeProcs = new Map();

function stamp() {
  return new Date().toLocaleTimeString('vi-VN', { hour12: false });
}

function supervise(name, scriptArgs) {
  if (shuttingDown) return;
  const child = spawn(process.execPath, scriptArgs, { cwd: root, stdio: 'inherit' });
  activeProcs.set(name, child);

  child.on('exit', (code, signal) => {
    activeProcs.delete(name);
    if (shuttingDown) return;
    console.warn(`[${stamp()}] [Watchdog 24/7] Dịch vụ "${name}" dừng (code=${code ?? signal}). Tự động khởi động lại sau 3 giây...`);
    setTimeout(() => supervise(name, scriptArgs), 3000);
  });
}

supervise('AdminTong (:8791)', ['AdminTong/server/index.js']);
supervise('Cúng Chùa Online (:8787)', ['server/index.js', ...extraArgs]);
supervise('Cuộc Đua Kỳ Thú (:8789)', ['CuocDuaKyThu/server/index.js', ...extraArgs]);

const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of activeProcs.values()) {
    try { p.kill('SIGINT'); } catch {}
  }
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
