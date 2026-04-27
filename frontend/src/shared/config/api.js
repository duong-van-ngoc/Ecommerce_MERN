const trimTrailingSlash = (value) => value?.trim().replace(/\/$/, "") || "";

const normalizeApiOrigin = (value) => {
  const trimmed = trimTrailingSlash(value);
  if (!trimmed) return "";
  return trimmed.endsWith("/api/v1") ? trimmed.slice(0, -7) : trimmed;
};

const envApiOrigin = normalizeApiOrigin(import.meta.env.VITE_API_URL);
const devFallbackOrigin = import.meta.env.DEV ? "http://localhost:8000" : "";

export const API_ORIGIN = envApiOrigin || devFallbackOrigin;
export const API_V1_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api/v1` : "";

if (import.meta.env.PROD && !envApiOrigin) {
  console.warn("VITE_API_URL is not configured for this build.");
}
