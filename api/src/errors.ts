export interface OpenAiErrorResponse {
  error: {
    message: string;
    type: string;
    code: string | null;
  };
}

export function createOpenAiError(
  message: string,
  type: string,
  code: string | null,
): OpenAiErrorResponse {
  return {
    error: {
      message,
      type,
      code,
    },
  };
}
