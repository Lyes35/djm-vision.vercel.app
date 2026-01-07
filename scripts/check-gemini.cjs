#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([^=]+)\s*=\s*(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const envLocal = path.resolve(process.cwd(), '.env.local');
loadEnvFile(envLocal);

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found. Create .env.local with GEMINI_API_KEY=your_key or set the env var in your shell.');
  process.exit(1);
}

console.log('✅ GEMINI_API_KEY present.');
