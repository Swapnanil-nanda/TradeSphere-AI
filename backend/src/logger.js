/**
 * TradeSphere AI — Structured JSON Logger for Node.js Microstructure Engine
 */

export const logger = {
  format(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'tradesphere-microstructure',
      level,
      message,
      traceId: meta.traceId || null,
      ...meta
    });
  },

  info(msg, meta) {
    console.log(this.format('INFO', msg, meta));
  },

  warn(msg, meta) {
    console.warn(this.format('WARN', msg, meta));
  },

  error(msg, meta) {
    console.error(this.format('ERROR', msg, meta));
  },

  debug(msg, meta) {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.log(this.format('DEBUG', msg, meta));
    }
  }
};
