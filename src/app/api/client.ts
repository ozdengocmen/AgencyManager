const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");
const SESSION_KEY = "agencymanager.session.v1";

interface ErrorPayload {
  detail?: string | { code?: string; message?: string };
}

interface SessionPayload {
  token?: string;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readSessionToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as ErrorPayload;
      if (payload.detail) {
        detail =
          typeof payload.detail === "string"
            ? payload.detail
            : payload.detail.message || payload.detail.code || detail;
      }
    } catch {
      // Ignore parse failures and keep generic status message.
    }

    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export function toQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }
  const rendered = query.toString();
  return rendered ? `?${rendered}` : "";
}

function readSessionToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as SessionPayload;
    return payload.token || null;
  } catch {
    return null;
  }
}
