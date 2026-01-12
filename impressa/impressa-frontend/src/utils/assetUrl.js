import api from "./axiosInstance";

// Build absolute URL for server-hosted assets like /uploads/... 
// - If input is absolute (http/https), return as-is
// - If input starts with /uploads/, prefix backend origin (strip trailing /api from baseURL)
// - Otherwise return input
export default function assetUrl(path) {
  if (!path) return "";
  // For absolute URLs (like placeholders from cloudinary)
  if (/^https?:\/\//i.test(path)) return path;

  // For backend-provided paths
  if (path.startsWith("/uploads/")) {
    // Use environment variable or fallback to localhost:5000
    // We strip /api if it's included in the env var, though here we just want the origin
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const origin = apiUrl.replace(/\/api$/, "");
    return `${origin}${path}`;
  }

  // For local public paths
  return process.env.PUBLIC_URL + path;
}