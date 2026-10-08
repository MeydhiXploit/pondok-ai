import { join } from 'node:path';
import { chmodSync } from 'node:fs';
import { GeneratedEnv, Preset, StackConfig, validateConfig } from './schema.js';
import { getDefaultConfig } from './defaults.js';
import { getDefaultStackDir, isWindows } from '../system/platform.js';
import { fileExists, readFile, writeFile } from '../utils/fs.js';
import { generatePassword, generateSecret } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

const CONFIG_FILE = 'config.json';
const ENV_FILE = '.env';

/**
 * Configuration manager handles reading, writing, and generating stack configuration.
 */
export class ConfigManager {
  private readonly stackDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.stackDir = join(baseDir, getDefaultStackDir());
  }

  /**
   * Get the path to the stack directory.
   */
  getStackDir(): string {
    return this.stackDir;
  }

  /**
   * Get the path to the config file.
   */
  getConfigPath(): string {
    return join(this.stackDir, CONFIG_FILE);
  }

  /**
   * Get the path to the .env file.
   */
  getEnvPath(): string {
    return join(this.stackDir, ENV_FILE);
  }

  /**
   * Get the path to the docker-compose.yml file.
   */
  getComposePath(): string {
    return join(this.stackDir, 'docker-compose.yml');
  }

  /**
   * Check if a configuration already exists.
   */
  configExists(): boolean {
    return fileExists(this.getConfigPath());
  }

  /**
   * Load an existing configuration. Returns null if not found.
   */
  loadConfig(): StackConfig | null {
    const content = readFile(this.getConfigPath());
    if (content === null) {
      return null;
    }

    try {
      const parsed = JSON.parse(content) as StackConfig;
      const errors = validateConfig(parsed);
      if (errors.length > 0) {
        logger.error('Configuration validation errors:');
        errors.forEach((e) => logger.error(`  - ${e}`));
        return null;
      }
      return parsed;
    } catch (error) {
      logger.error(`Failed to parse config: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  /**
   * Save a configuration to disk.
   */
  saveConfig(config: StackConfig): void {
    writeFile(this.getConfigPath(), JSON.stringify(config, null, 2) + '\n');
    logger.debug(`Config saved to ${this.getConfigPath()}`);
  }

  /**
   * Generate a new configuration for a given preset.
   */
  generateConfig(preset: Preset): StackConfig {
    return getDefaultConfig(preset);
  }

  /**
   * Generate a .env file with secure credentials.
   * Will not overwrite an existing .env file.
   */
  generateEnv(force: boolean = false): GeneratedEnv {
    const envPath = this.getEnvPath();

    if (fileExists(envPath) && !force) {
      logger.debug('.env already exists, loading existing credentials');
      return this.loadEnv();
    }

    const env: GeneratedEnv = {
      POSTGRES_PASSWORD: generatePassword(24),
      API_SECRET_KEY: generateSecret(32),
      N8N_ENCRYPTION_KEY: generateSecret(32),
    };

    const envContent = Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';

    writeFile(envPath, envContent);

    // On Unix platforms, restrict .env permissions to owner only
    if (!isWindows()) {
      try {
        chmodSync(envPath, 0o600);
      } catch {
        // ignore on filesystems that do not support POSIX permissions
      }
    }

    logger.debug(`.env generated at ${envPath}`);

    return env;
  }

  /**
   * Load environment variables from the .env file.
   */
  loadEnv(): GeneratedEnv {
    const content = readFile(this.getEnvPath());
    if (content === null) {
      return this.generateEnv();
    }

    const env: GeneratedEnv = {
      POSTGRES_PASSWORD: '',
      API_SECRET_KEY: '',
      N8N_ENCRYPTION_KEY: '',
    };

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex);
      const value = trimmed.slice(eqIndex + 1);
      env[key] = value;
    }

    return env;
  }
}
