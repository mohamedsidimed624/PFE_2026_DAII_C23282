export const extractApiError = (err) => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || data?.detail || "Une erreur est survenue.";
};
