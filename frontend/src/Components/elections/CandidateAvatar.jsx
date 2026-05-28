import { useState } from "react";

const BACKEND = "http://localhost:8080";

function toAbsUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return BACKEND + (path.startsWith("/") ? path : "/" + path);
}

export function getCandidatePhoto(c) {
  return toAbsUrl(c?.photoCandidatureUrl || c?.medecinPhotoUrl || null);
}
export default function CandidateAvatar({
  candidate,
  size = 40,
  bgClass = "bg-blue-700",
  imgClassName = "",
}) {
  const [imgError, setImgError] = useState(false);
  const photo = getCandidatePhoto(candidate);
  const initials = `${candidate?.medecinPrenom?.[0] ?? ""}${candidate?.medecinNom?.[0] ?? ""}`.toUpperCase();
  const fontSize = Math.round(size * 0.35);

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt=""
        onError={() => setImgError(true)}
        className={`shrink-0 rounded-full object-cover ${imgClassName}`}
        style={{ height: size, width: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${bgClass}`}
      style={{ height: size, width: size, fontSize }}
    >
      {initials}
    </div>
  );
}
