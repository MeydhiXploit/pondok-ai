import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function getGatewaySourceDirectory(): string {
  return fileURLToPath(new URL('../api/', import.meta.url));
}

/**
 * Copy the gateway files needed by Docker Compose into a new stack directory.
 */
export function copyGatewayBuildContext(destination: string): void {
  const source = getGatewaySourceDirectory();

  if (!existsSync(source)) {
    throw new Error(
      'Gateway build files are unavailable. Reinstall local-ai-stack and run init again.',
    );
  }

  if (existsSync(destination)) {
    throw new Error(`Gateway build directory already exists: ${destination}`);
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, {
    recursive: true,
    filter: (path) => !['node_modules', 'dist'].includes(basename(path)),
  });
}
