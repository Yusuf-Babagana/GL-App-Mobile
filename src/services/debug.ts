const ENABLED = true;

const LOG_PREFIX = {
  API: '\x1b[34m[API]\x1b[0m',
  PLANS: '\x1b[35m[PLANS]\x1b[0m',
  AUTH: '\x1b[33m[AUTH]\x1b[0m',
  TOKEN: '\x1b[36m[TOKEN]\x1b[0m',
};

let requestCounter = 0;

function timestamp() {
  return new Date().toISOString().slice(11, 23);
}

export const debug = {
  api: {
    request: (path: string, method: string, hasToken: boolean) => {
      if (!ENABLED) return;
      const id = ++requestCounter;
      console.debug(
        `${LOG_PREFIX.API} ${timestamp()} #${id} ${method} ${path} ${hasToken ? '🔑' : '⚪'}`,
      );
      return id;
    },
    response: (id: number | undefined, status: number, body: unknown) => {
      if (!ENABLED || !id) return;
      const truncated =
        typeof body === 'object' && body !== null
          ? JSON.stringify(body).slice(0, 300)
          : String(body).slice(0, 300);
      console.debug(
        `${LOG_PREFIX.API} ${timestamp()} #${id} ← ${status} ${truncated}`,
      );
    },
    error: (id: number | undefined, message: string) => {
      if (!ENABLED || !id) return;
      console.debug(`${LOG_PREFIX.API} ${timestamp()} #${id} ✗ ${message}`);
    },
  },

  plans: {
    raw: (data: unknown) => {
      if (!ENABLED) return;
      const type = data === null ? 'null' : typeof data;
      const isArray = Array.isArray(data);
      const len = isArray ? (data as unknown[]).length : '—';
      const sample =
        isArray && len > 0
          ? JSON.stringify((data as unknown[])[0]).slice(0, 200)
          : JSON.stringify(data).slice(0, 200);
      console.debug(
        `${LOG_PREFIX.PLANS} ${timestamp()} type=${type} isArray=${isArray} length=${len}`,
      );
      if (len !== '—' && len === 0) {
        console.debug(`${LOG_PREFIX.PLANS} ${timestamp()} ⚠ EMPTY ARRAY`);
      }
      console.debug(`${LOG_PREFIX.PLANS} ${timestamp()} sample=${sample}`);
    },
    error: (msg: string) => {
      if (!ENABLED) return;
      console.debug(`${LOG_PREFIX.PLANS} ${timestamp()} ✗ ${msg}`);
    },
  },

  auth: {
    loginResponse: (field: string, found: boolean) => {
      if (!ENABLED) return;
      console.debug(
        `${LOG_PREFIX.AUTH} ${timestamp()} tokenField=${field} found=${found}`,
      );
    },
    tokenStored: (key: string, exists: boolean) => {
      if (!ENABLED) return;
      const preview = exists ? 'present' : 'absent';
      console.debug(
        `${LOG_PREFIX.TOKEN} ${timestamp()} key=${key} ${preview}`,
      );
    },
  },

  _raw: (...args: unknown[]) => {
    if (!ENABLED) return;
    console.debug(...args);
  },
};
