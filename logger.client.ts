const LEVELS: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const configured = (import.meta.env.VITE_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')).toLowerCase();
const configuredLevel = LEVELS[configured] ?? 0;
function enabled(level: string) {
  return LEVELS[level] >= configuredLevel;
}
const logger = {
  debug: (...args: any[]) => { if (enabled('debug')) console.debug('[debug]', ...args); },
  info: (...args: any[]) => { if (enabled('info')) console.info('[info]', ...args); },
  warn: (...args: any[]) => { if (enabled('warn')) console.warn('[warn]', ...args); },
  error: (...args: any[]) => { console.error('[error]', ...args); }
};

export default logger;
