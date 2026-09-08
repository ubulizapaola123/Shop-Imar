type ApiError = {
  message: string;
  status?: number;
};

type ApiResult<T> = {
  data?: T;
  error?: ApiError;
};

/**
 * Minimal browser API client used by the dashboard until an OpenAPI-generated
 * client is introduced. It keeps request and error handling consistent without
 * coupling pages to a particular backend host.
 */
export const client = {
  async POST<T>(
    path: string,
    options: { body?: unknown } = {},
  ): Promise<ApiResult<T>> {
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });

      const payload = await response.json().catch(() => undefined);

      if (!response.ok) {
        return {
          error: {
            message: payload?.message || `Request failed (${response.status})`,
            status: response.status,
          },
        };
      }

      return { data: payload as T };
    } catch {
      return {
        error: {
          message: "Unable to reach the server. Please try again.",
        },
      };
    }
  },
};
