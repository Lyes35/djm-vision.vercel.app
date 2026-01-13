const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const configured = (process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')).toLowerCase();
const configuredLevel = LEVELS[configured] ?? 0;
function enabled(level) {
  return LEVELS[level] >= configuredLevel;
}
module.exports = {
  debug: (...args) => { if (enabled('debug')) console.debug('[debug]', ...args); },
  info: (...args) => { if (enabled('info')) console.info('[info]', ...args); },
  warn: (...args) => { if (enabled('warn')) console.warn('[warn]', ...args); },
  error: (...args) => { /* always show errors */ console.error('[error]', ...args); }
};
