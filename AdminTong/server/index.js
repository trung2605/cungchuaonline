import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './db.js';
import { startMasterAdmin } from './masterAdmin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_FILE = path.join(ROOT_DIR, '.env');
const stamp = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });

const updateEnvVar = (key, val) => {
  try {
    let content = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '';
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(content)) content = content.replace(re, `${key}=${val}`);
    else content = content.trimEnd() + `\n${key}=${val}\n`;
    fs.writeFileSync(ENV_FILE, content, 'utf8');
    process.env[key] = val;
  } catch {}
};

const port = Number(process.env.MASTER_ADMIN_PORT || 8791);
const password = process.env.ADMIN_PASSWORD?.trim() || 'chuaonline123';
const db = createDatabase({
  storeFile: path.join(ROOT_DIR, 'logs/master-db.json'),
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB || 'live_tiktok',
});

if (process.env.MONGODB_URI?.trim()) {
  const st = await db.connectMongo(process.env.MONGODB_URI, process.env.MONGODB_DB || 'live_tiktok');
  console.log(`[${stamp()}] [Admin Tổng] MongoDB: ${st.connected ? 'Đã kết nối (' + st.dbName + ')' : 'Lỗi (' + st.error + ')'}`);
} else {
  console.log(`[${stamp()}] [Admin Tổng] MongoDB: Chờ cấu hình MONGODB_URI trong .env (Đang lưu cục bộ tại logs/master-db.json)`);
}

const master = await startMasterAdmin({
  port,
  password,
  db,
  updateEnvVar,
});

console.log(`[${stamp()}] [Admin Tổng] Master Portal: http://127.0.0.1:${master.port} (user: admin)`);

process.once('SIGINT', async () => {
  await master.close();
  await db.close();
  process.exit(0);
});
