import { exec, execStream } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

/**
 * Docker CLI client — wraps docker and docker compose commands.
 */
export class DockerClient {
  private readonly composeFile: string;
  private readonly envFile: string;
  private readonly projectName: string;

  constructor(composeFile: string, envFile: string, projectName: string) {
    this.composeFile = composeFile;
    this.envFile = envFile;
    this.projectName = projectName;
  }

  private composeArgs(...args: string[]): string[] {
    return ['compose', '-f', this.composeFile, '--env-file', this.envFile, '-p', this.projectName, ...args];
  }

  /**
   * Validate Docker Compose configuration and environment variables.
   */
  async validateCompose(): Promise<{ valid: boolean; error?: string }> {
    try {
      const result = await exec('docker', this.composeArgs('config', '-q'));
      if (result.exitCode === 0) {
        return { valid: true };
      }
      return {
        valid: false,
        error: result.stderr.trim() || result.stdout.trim() || 'Invalid Docker Compose configuration',
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Start all services (docker compose up -d).
   */
  async up(): Promise<number> {
    logger.debug('Running docker compose up -d');
    return execStream('docker', this.composeArgs('up', '-d', '--remove-orphans'));
  }

  /**
   * Stop and remove all services (docker compose down).
   */
  async down(removeVolumes: boolean = false): Promise<number> {
    const args = this.composeArgs('down');
    if (removeVolumes) {
      args.push('-v');
    }
    return execStream('docker', args);
  }

  /**
   * Start stopped containers.
   */
  async start(service?: string): Promise<number> {
    const args = this.composeArgs('start');
    if (service) args.push(service);
    return execStream('docker', args);
  }

  /**
   * Stop running containers.
   */
  async stop(service?: string): Promise<number> {
    const args = this.composeArgs('stop');
    if (service) args.push(service);
    return execStream('docker', args);
  }

  /**
   * Restart containers.
   */
  async restart(service?: string): Promise<number> {
    const args = this.composeArgs('restart');
    if (service) args.push(service);
    return execStream('docker', args);
  }

  /**
   * Get the status of all services.
   */
  async status(): Promise<ServiceStatus[]> {
    const result = await exec('docker', this.composeArgs('ps', '--format', 'json', '-a'));

    if (result.exitCode !== 0) {
      return [];
    }

    if (!result.stdout.trim()) {
      return [];
    }

    const statuses: ServiceStatus[] = [];

    // docker compose ps --format json outputs one JSON object per line
    for (const line of result.stdout.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const container = JSON.parse(trimmed) as DockerPsOutput;
        statuses.push({
          name: container.Service || container.Name,
          state: container.State,
          status: container.Status,
          ports: container.Ports || '',
        });
      } catch {
        // Skip unparseable lines
      }
    }

    return statuses;
  }

  /**
   * Show logs for a service.
   */
  async logs(service?: string, follow: boolean = false, tail: number = 100): Promise<number> {
    const args = this.composeArgs('logs', `--tail=${tail}`);
    if (follow) args.push('-f');
    if (service) args.push(service);
    return execStream('docker', args);
  }

  /**
   * Pull latest images.
   */
  async pull(): Promise<number> {
    return execStream('docker', this.composeArgs('pull'));
  }

  /**
   * Execute a command inside a running container.
   */
  async execInContainer(service: string, command: string[]): Promise<{ stdout: string; exitCode: number }> {
    const result = await exec('docker', this.composeArgs('exec', '-T', service, ...command));
    return { stdout: result.stdout, exitCode: result.exitCode };
  }
}

export interface ServiceStatus {
  name: string;
  state: string;
  status: string;
  ports: string;
}

interface DockerPsOutput {
  Name: string;
  Service: string;
  State: string;
  Status: string;
  Ports: string;
}
