/**
 * Validate that a string is a non-empty value.
 */
export function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a value is a valid port number.
 */
export function isValidPort(value: unknown): boolean {
  const port = typeof value === 'string' ? parseInt(value, 10) : value;
  return typeof port === 'number' && Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * Validate a preset name.
 */
export function isValidPreset(value: string): boolean {
  return ['minimal', 'standard', 'full'].includes(value.toLowerCase());
}

/**
 * Validate a model name (basic check for Ollama model format).
 * Accepts formats like: llama3.2, mistral, codellama:7b, custom/model:tag
 */
export function isValidModelName(value: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._/-]*(:[a-zA-Z0-9._-]+)?$/.test(value);
}
