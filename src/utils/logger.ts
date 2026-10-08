import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

let currentLevel: LogLevel = LogLevel.INFO;

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

export const logger = {
  debug(message: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(chalk.gray(`[debug] ${message}`), ...args);
    }
  },

  info(message: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log(message, ...args);
    }
  },

  success(message: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log(chalk.green(`✓ ${message}`), ...args);
    }
  },

  warn(message: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(chalk.yellow(`⚠ ${message}`), ...args);
    }
  },

  error(message: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(chalk.red(`✗ ${message}`), ...args);
    }
  },

  /**
   * Print a blank line for spacing
   */
  newline(): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log();
    }
  },

  /**
   * Print raw text without any prefix
   */
  raw(message: string): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log(message);
    }
  },
};
