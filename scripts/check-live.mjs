// CLI tool to test connecting to a live TikTok stream and inspect mapped events,
// giftId, groupId, offering classification, and TTS thank-you sentences.
// Usage: npm run check-live -- @username
import 'dotenv/config';
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { mapTiktok } from '../server/mapTiktok.js';
import { giftOffering, giftTier } from '../server/bowRules.js';
import { loadLists } from '../server/lists.js';
import { cleanName, detectIntent, isTrigger } from '../server/filter.js';
import { formatTtsThanks } from '../web/scene/audio.js';

const argUser = process.argv.slice(2).find(a => !a.startsWith('-'));
const user = (argUser || process.env.TIKTOK_USER || '').trim().replace(/^@/, '');

if (!user) {
  console.error('Cách dùng: npm run check-live -- @ten_kenh_tiktok');
  console.error('Hoặc điền TIKTOK_USER trong file .env rồi chạy: npm run check-live');
  process.exit(1);
}

const lists = loadLists();
const stamp = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });

console.log(`[${stamp()}] Đang kết nối tới TikTok LIVE của @${user}...`);
if (process.env.EULER_KEY) {
  console.log(`[${stamp()}] Đang sử dụng EULER_KEY từ .env`);
}

const conn = new TikTokLiveConnection(user, {
  signApiKey: process.env.EULER_KEY || undefined,
  enableExtendedGiftInfo: false,
  fetchRoomInfoOnConnect: false,
});

for (const name of ['chat', 'gift', 'like', 'member', 'roomUser', 'streamEnd']) {
  conn.on(name, raw => {
    const e = mapTiktok(name, raw);
    if (!e) {
      if (name === 'gift') {
        console.log(`[${stamp()}] [GIFT-COMBO-TICK] @${raw.user?.displayId}: ${raw.gift?.name ?? raw.giftName} x${raw.repeatCount} (đang gửi combo, chờ kết thúc...)`);
      }
      return;
    }
    switch (e.kind) {
      case 'chat': {
        const trig = isTrigger(e.text, lists);
        const intent = detectIntent(e.text, lists) || 'Cầu Bình An';
        console.log(`[${stamp()}] 💬 CHAT | ${cleanName(e.name, lists)} (@${e.uid}): "${e.text}"${trig ? ` -> 🙏 Vào lạy (${intent})` : ''}`);
        break;
      }
      case 'gift': {
        const nameClean = cleanName(e.name, lists);
        const total = e.diamonds * e.repeat;
        const tier = giftTier(total);
        const offering = giftOffering(e.giftName, total);
        const tts = formatTtsThanks({ name: nameClean, offering, repeat: e.repeat });
        console.log(
          `[${stamp()}] 🎁 GIFT | ${nameClean} (@${e.uid}) tặng ${e.giftName} (giftId=${e.giftId}, groupId=${e.group || 'none'}) ` +
          `x${e.repeat} = 💎${total} (Bậc ${tier}) -> Hành động: [${offering}] -> 🔊 TTS: "${tts}"`
        );
        break;
      }
      case 'like':
        console.log(`[${stamp()}] ❤️ LIKE | ${cleanName(e.name, lists)} (@${e.uid}) +${e.count} tim`);
        break;
      case 'join':
        console.log(`[${stamp()}] 👋 JOIN | ${cleanName(e.name, lists)} (@${e.uid}) vừa vào phòng`);
        break;
      case 'viewers':
        console.log(`[${stamp()}] 👀 VIEWERS | Đang xem: ${e.count}`);
        break;
      case 'end':
        console.log(`[${stamp()}] 🛑 END | Phiên LIVE đã kết thúc.`);
        process.exit(0);
    }
  });
}

conn.on('error', err => {
  console.warn(`[${stamp()}] ⚠️ Lỗi kết nối:`, err?.message ?? err?.info ?? err);
});

try {
  const state = await conn.connect();
  console.log(`[${stamp()}] ✅ Đã kết nối thành công! Room ID: ${state?.roomId ?? 'OK'}`);
  console.log(`[${stamp()}] Đang lắng nghe sự kiện trực tiếp (Nhấn Ctrl+C để dừng)...`);
} catch (err) {
  console.error(`[${stamp()}] ❌ Không kết nối được tới @${user}: ${err?.message ?? err}`);
  console.error('Gợi ý: Kiểm tra xem kênh @' + user + ' hiện có đang phát LIVE không, hoặc thêm EULER_KEY vào .env nếu bị chặn rate-limit.');
  process.exit(1);
}
