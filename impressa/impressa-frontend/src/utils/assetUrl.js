import api from "./axiosInstance";

// Build absolute URL for server-hosted assets like /uploads/... 
// - If input is absolute (http/https), return as-is
// - If input starts with /uploads/, prefix backend origin (strip trailing /api from baseURL)
// - Otherwise return input
export default function assetUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (api?.defaults?.baseURL || "").replace(/\/$/, "");
  const origin = base.endsWith("/api") ? base.slice(0, -4) : base; // drop /api
  if (path.startsWith("/uploads/")) return `${origin}${path}`;
  return path;
}