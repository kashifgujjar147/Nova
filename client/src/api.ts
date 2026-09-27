import axios, {
  AxiosError,
  InternalAxiosRequestConfig
} from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://novacartserver-production.up.railway.app/api",
  withCredentials: true,
  timeout: 15000
});

/*
 * ============================================================
 * NOVACART API STABILITY LAYER
 * ============================================================
 *
 * Goals:
 * - Safe repeated GET requests
 * - Automatic retry for temporary server/network failures
 * - Never blindly retry mutations
 * - Stable auth refresh
 * - Better error messages
 * - Prevent request storms from breaking the UI
 */

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _stabilityRetry?: number;
};

const GET_INFLIGHT = new Map<string, Promise<any>>();

let refreshing: Promise<string | null> | null = null;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isTransientError = (error: AxiosError) => {
  const status = error.response?.status;

  if (!error.response) {
    return true;
  }

  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

const retryDelay = (attempt: number) =>
  Math.min(800 * Math.pow(2, attempt), 4000);

/*
 * Attach current access token.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
 * Response / recovery layer.
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const cfg = error.config as RetryConfig | undefined;

    if (!cfg) {
      return Promise.reject(error);
    }

    const url = String(cfg.url || "");

    /*
     * --------------------------------------------------------
     * AUTH REFRESH
     * --------------------------------------------------------
     */
    if (
      error.response?.status === 401 &&
      !cfg._retry &&
      !url.includes("/auth/refresh") &&
      !url.includes("/auth/login")
    ) {
      cfg._retry = true;

      refreshing ??=
        api
          .post("/auth/refresh")
          .then((response) => {
            const token = response.data?.data?.token;

            if (token) {
              localStorage.setItem("token", token);
            }

            return token || null;
          })
          .catch(() => null)
          .finally(() => {
            refreshing = null;
          });

      const token = await refreshing;

      if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${token}`;

        return api(cfg);
      }

      localStorage.removeItem("token");
    }

    /*
     * --------------------------------------------------------
     * SAFE TRANSIENT RETRY
     * --------------------------------------------------------
     *
     * IMPORTANT:
     * Only GET/HEAD/OPTIONS are automatically retried.
     *
     * We never automatically retry POST/PATCH/PUT/DELETE,
     * because those can create duplicate orders/payments/etc.
     */
    const method = String(cfg.method || "get").toLowerCase();

    const safeToRetry =
      method === "get" ||
      method === "head" ||
      method === "options";

    if (
      safeToRetry &&
      isTransientError(error) &&
      !url.includes("/auth/refresh") &&
      !url.includes("/auth/login")
    ) {
      const attempt = cfg._stabilityRetry || 0;

      if (attempt < 2) {
        cfg._stabilityRetry = attempt + 1;

        await sleep(retryDelay(attempt));

        return api(cfg);
      }
    }

    return Promise.reject(error);
  }
);

/*
 * ------------------------------------------------------------
 * REQUEST KEY
 * ------------------------------------------------------------
 *
 * Used to prevent accidental duplicate GET storms.
 */
const makeRequestKey = (
  method: string,
  url: string,
  data?: unknown
) => {
  let serialized = "";

  try {
    serialized = data ? JSON.stringify(data) : "";
  } catch {
    serialized = "";
  }

  return `${method.toUpperCase()}::${url}::${serialized}`;
};

/*
 * ------------------------------------------------------------
 * PUBLIC REQUEST HELPER
 * ------------------------------------------------------------
 */
export const request = async <T = unknown>(
  method: string,
  url: string,
  data?: unknown,
  headers?: Record<string, string>
) => {
  const normalizedMethod = method.toLowerCase();

  /*
   * GET deduplication.
   *
   * If a user clicks/navigates repeatedly while the exact same
   * GET is still running, don't create another request.
   */
  if (
    normalizedMethod === "get" ||
    normalizedMethod === "head" ||
    normalizedMethod === "options"
  ) {
    const key = makeRequestKey(normalizedMethod, url, data);

    const existing = GET_INFLIGHT.get(key);

    if (existing) {
      return existing;
    }

    const promise = api
      .request<{
        success: boolean;
        data: T;
        message?: string;
      }>({
        method: normalizedMethod,
        url,
        data,
        headers
      })
      .then((response) => response.data)
      .finally(() => {
        GET_INFLIGHT.delete(key);
      });

    GET_INFLIGHT.set(key, promise);

    return promise;
  }

  /*
   * Mutating requests are intentionally NOT deduplicated or
   * automatically retried.
   */
  const response = await api.request<{
    success: boolean;
    data: T;
    message?: string;
  }>({
    method: normalizedMethod,
    url,
    data,
    headers
  });

  return response.data;
};

/*
 * ------------------------------------------------------------
 * USER-FRIENDLY ERROR HANDLER
 * ------------------------------------------------------------
 */
export const apiError = (error: any) => {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (error.code === "ECONNABORTED") {
    return "The server is taking too long to respond. Please try again.";
  }

  if (
    error.code === "ERR_NETWORK" ||
    error.message === "Network Error"
  ) {
    return "Unable to connect to the server. Please check your connection.";
  }

  const status = error.response?.status;

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status === 404) {
    return (
      error.response?.data?.message ||
      "The requested resource was not found."
    );
  }

  if (status === 401) {
    return (
      error.response?.data?.message ||
      "Your session has expired. Please sign in again."
    );
  }

  if (status >= 500) {
    return (
      error.response?.data?.message ||
      "The server is temporarily unavailable. Please try again."
    );
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.code ||
    error.message ||
    "Something went wrong. Please try again."
  );
};

