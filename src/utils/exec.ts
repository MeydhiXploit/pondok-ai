import { execFile, ExecFileOptions } from 'node:child_process';
import { logger } from './logger.js';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Execute a command and return the result.
 * Uses execFile for safety (no shell injection).
 */
export async function exec(
  command: string,
  args: string[] = [],
  options: ExecFileOptions = {},
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const opts: ExecFileOptions = {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
      ...options,
    };

    logger.debug(`exec: ${command} ${args.join(' ')}`);

    execFile(command, args, opts, (error, stdout, stderr) => {
      const result: ExecResult = {
        stdout: typeof stdout === 'string' ? stdout.trim() : '',
        stderr: typeof stderr === 'string' ? stderr.trim() : '',
        exitCode: error ? (error as NodeJS.ErrnoException & { code?: number }).code ?? 1 : 0,
      };

      if (error) {
        // Still resolve with result so caller can check exitCode
        // Only reject on actual system errors (e.g., command not found)
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          reject(new Error(`Command not found: ${command}`));
          return;
        }
        result.exitCode = (error as { code?: number }).code ?? 1;
      }

      resolve(result);
    });
  });
}

/**
 * Execute a command and stream stdout/stderr to the console.
 * Useful for long-running processes like docker compose up.
 */
export async function execStream(
  command: string,
  args: string[] = [],
  options: ExecFileOptions = {},
): Promise<number> {
  const { spawn } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    logger.debug(`execStream: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('error', (error) => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(new Error(`Command not found: ${command}`));
      } else {
        reject(error);
      }
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });
}
