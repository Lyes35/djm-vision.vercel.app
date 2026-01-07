const assert = require('assert');
const { parseM3UContent } = require('../api/playlist.cjs');

// Sample M3U: one with group and logo, one without group (should default)
const sample = `#EXTM3U
#EXTINF:-1 tvg-logo="https://logo1.png" group-title="News",قناة إخبارية
https://stream1.example/stream.m3u8
#EXTINF:-1,قناة بدون مجموعة
https://stream2.example/stream.m3u8
`;

function run() {
  console.log('Running playlist parsing unit test...');
  const channels = parseM3UContent(sample);

  assert.strictEqual(channels.length, 2, 'Should parse two channels');

  const c0 = channels[0];
  assert.strictEqual(c0.name, 'قناة إخبارية');
  assert.strictEqual(c0.logo, 'https://logo1.png');
  assert.strictEqual(c0.group, 'News');
  assert.strictEqual(c0.url, 'https://stream1.example/stream.m3u8');

  const c1 = channels[1];
  assert.strictEqual(c1.name, 'قناة بدون مجموعة');
  assert.strictEqual(c1.group, 'قنوات عامة', 'Missing group should default to Arabic "قنوات عامة"');
  assert.strictEqual(c1.url, 'https://stream2.example/stream.m3u8');

  console.log('✅ playlist parsing tests passed');
}

try {
  run();
} catch (err) {
  console.error('❌ playlist parsing tests failed');
  console.error(err.stack);
  process.exit(1);
}