const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const COLORS = {
  debug: '\x1b[36m',  // Cyan
  info: '\x1b[32m',   // Green
  warn: '\x1b[33m',   // Yellow
  error: '\x1b[31m',  // Red
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 23);
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.shouldLog(level)) return;

    const timestamp = this.formatTimestamp();
    const color = COLORS[level];
    const prefix = `${COLORS.dim}${timestamp}${COLORS.reset} ${color}${COLORS.bold}[${level.toUpperCase()}]${COLORS.reset}`;

    if (args.length > 0) {
      console.log(`${prefix} ${message}`, ...args);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  debug(message: string, ...args: any[]) { this.log('debug', message, ...args); }
  info(message: string, ...args: any[]) { this.log('info', message, ...args); }
  warn(message: string, ...args: any[]) { this.log('warn', message, ...args); }
  error(message: string, ...args: any[]) { this.log('error', message, ...args); }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
);
