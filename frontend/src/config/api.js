export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Les fichiers uploadés (photos, documents) sont stockés sur R2 et renvoyés en URL absolue.
// Les anciennes données (avant migration R2) ont un chemin relatif type "/uploads/...".
export function resolveFileUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}
