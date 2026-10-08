import { SystemInfo } from './detect.js';

export interface RequirementCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const MIN_RAM_GB = 4;
const RECOMMENDED_RAM_GB = 8;
const MIN_DISK_GB = 10;
const RECOMMENDED_DISK_GB = 20;

/**
 * Check system requirements and return a list of checks with pass/fail status.
 */
export function checkRequirements(system: SystemInfo): RequirementCheck[] {
  const checks: RequirementCheck[] = [];

  // Docker installed
  checks.push({
    name: 'Docker installed',
    passed: system.dockerInstalled,
    message: system.dockerInstalled
      ? `Docker ${system.dockerVersion ?? ''} detected`
      : 'Docker is not installed. Please install Docker Desktop from https://docker.com',
    severity: system.dockerInstalled ? 'info' : 'error',
  });

  // Docker running
  if (system.dockerInstalled) {
    checks.push({
      name: 'Docker running',
      passed: system.dockerRunning,
      message: system.dockerRunning
        ? 'Docker daemon is running'
        : 'Docker is not running. Please start Docker Desktop and try again.',
      severity: system.dockerRunning ? 'info' : 'error',
    });
  }

  // Docker Compose
  if (system.dockerInstalled) {
    checks.push({
      name: 'Docker Compose',
      passed: system.dockerComposeVersion !== null,
      message: system.dockerComposeVersion
        ? `Docker Compose ${system.dockerComposeVersion} detected`
        : 'Docker Compose is not available. Please update Docker Desktop.',
      severity: system.dockerComposeVersion !== null ? 'info' : 'error',
    });
  }

  // RAM
  if (system.totalMemoryGB < MIN_RAM_GB) {
    checks.push({
      name: 'Memory',
      passed: false,
      message: `${system.totalMemoryGB}GB RAM detected. Minimum ${MIN_RAM_GB}GB required.`,
      severity: 'error',
    });
  } else if (system.totalMemoryGB < RECOMMENDED_RAM_GB) {
    checks.push({
      name: 'Memory',
      passed: true,
      message: `${system.totalMemoryGB}GB RAM detected. ${RECOMMENDED_RAM_GB}GB+ recommended for larger models.`,
      severity: 'warning',
    });
  } else {
    checks.push({
      name: 'Memory',
      passed: true,
      message: `${system.totalMemoryGB}GB RAM detected`,
      severity: 'info',
    });
  }

  // Disk space
  if (system.diskFreeGB !== null) {
    if (system.diskFreeGB < MIN_DISK_GB) {
      checks.push({
        name: 'Disk space',
        passed: false,
        message: `${system.diskFreeGB}GB free disk space. Minimum ${MIN_DISK_GB}GB required.`,
        severity: 'error',
      });
    } else if (system.diskFreeGB < RECOMMENDED_DISK_GB) {
      checks.push({
        name: 'Disk space',
        passed: true,
        message: `${system.diskFreeGB}GB free disk space. ${RECOMMENDED_DISK_GB}GB+ recommended for models.`,
        severity: 'warning',
      });
    } else {
      checks.push({
        name: 'Disk space',
        passed: true,
        message: `${system.diskFreeGB}GB free disk space`,
        severity: 'info',
      });
    }
  }

  // GPU
  checks.push({
    name: 'GPU',
    passed: true, // GPU is never required
    message: system.gpuAvailable
      ? `GPU detected: ${system.gpuInfo}`
      : 'No GPU detected. CPU-only mode will be used (slower inference).',
    severity: system.gpuAvailable ? 'info' : 'warning',
  });

  return checks;
}

/**
 * Check if all critical requirements are met.
 */
export function hasErrors(checks: RequirementCheck[]): boolean {
  return checks.some((c) => c.severity === 'error' && !c.passed);
}
