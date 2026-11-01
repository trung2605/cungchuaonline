// Unified Launcher for Live TikTok Studio:
// Starts:
// 1. Admin Tổng (Master Admin & MongoDB Hub on :8791)
// 2. Game 1: Cúng Chùa Online (:8787 Render / :8788 Admin)
// 3. Game 2: Cuộc Đua Kỳ Thú (:8789 Render / :8790 Admin)
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const extraArgs = process.argv.slice(2);

const procs = [
  spawn(process.execPath, ['AdminTong/server/index.js'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, ['server/index.js', ...extraArgs], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, ['CuocDuaKyThu/server/index.js', ...extraArgs], { cwd: root, stdio: 'inherit' }),
];

process.once('SIGINT', () => {
  for (const p of procs) {
    try { p.kill('SIGINT'); } catch {}
  }
});
