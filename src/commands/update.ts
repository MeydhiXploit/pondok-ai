import { Command } from 'commander';
import ora from 'ora';
import { ConfigManager } from '../config/manager.js';
import { DockerClient } from '../docker/client.js';
import { showError, showSuccess } from '../cli/ui.js';
import { logger } from '../utils/logger.js';

interface UpdateOptions {
  dir?: string;
  backup?: boolean;
  restart?: boolean;
  timeout?: string;
}

export function createUpdateCommand(): Command {
  const cmd = new Command('update')
    .description('Safely update Docker images with pre-update backup and health validation')
    .option('-d, --dir <directory>', 'Working directory', process.cwd())
    .option('--no-backup', 'Skip automatic pre-update backup')
    .option('--no-restart', 'Do not recreate containers after pulling')
    .option('-t, --timeout <seconds>', 'Timeout in seconds for post-update health checks', '45')
    .action(async (options: UpdateOptions) => {
      await runUpdate(options);
    });

  return cmd;
}

async function runUpdate(options: UpdateOptions): Promise<void> {
  const baseDir = options.dir ?? process.cwd();
  const configManager = new ConfigManager(baseDir);

  const config = configManager.loadConfig();
  if (!config) {
    showError('Stack not initialized.', 'Run "local-ai-stack init" first.');
    process.exit(1);
  }

  const docker = new DockerClient(
    configManager.getComposePath(),
    configManager.getEnvPath(),
    config.projectName,
  );

  // 1. Pre-update safety backup
  if (options.backup !== false) {
    try {
      const { runBackup } = await import('./backup.js');
      await runBackup({ dir: baseDir, includeModels: false });
    } catch (err) {
      logger.warn(`Could not create pre-update backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 2. Check if containers are currently running
  const activeContainers = await docker.status();
  const isRunning = activeContainers.some((c) => c.state === 'running');

  const spinner = ora('Pulling latest container images...').start();

  try {
    const exitCode = await docker.pull();
    if (exitCode !== 0) {
      spinner.fail('Failed to pull images');
      showError('Docker pull failed.', 'Please check your internet connection or registry access.');
      process.exit(1);
    }

    spinner.succeed('Images updated');

    // 3. Recreate and verify if running and restart option is enabled
    if (isRunning && options.restart !== false) {
      const restartSpinner = ora('Recreating containers with updated images...').start();
      const upCode = await docker.up();
      if (upCode !== 0) {
        restartSpinner.fail('Failed to restart updated services');
        showError('Restart failed.', 'Check logs via "local-ai-stack logs".');
        process.exit(1);
      }

      restartSpinner.text = 'Verifying service health after update...';
      const { waitForServicesHealthy } = await import('../docker/health.js');
      const timeoutSec = parseInt(options.timeout ?? '45', 10);
      const healthCheck = await waitForServicesHealthy(config, docker, timeoutSec, (msg) => {
        restartSpinner.text = msg;
      });

      if (healthCheck.allHealthy) {
        restartSpinner.succeed('All services updated and healthy');
      } else {
        restartSpinner.warn('Services updated, but some took longer than expected to report healthy');
      }
    } else if (!isRunning) {
      showSuccess('Images updated. Start the stack with "local-ai-stack up".');
    } else {
      showSuccess('Images updated. Restart with "local-ai-stack restart" to apply.');
    }
  } catch (error) {
    spinner.fail('Failed to pull images');
    showError(
      error instanceof Error ? error.message : 'Unknown error',
      'Make sure Docker is running.',
    );
    process.exit(1);
  }
}
