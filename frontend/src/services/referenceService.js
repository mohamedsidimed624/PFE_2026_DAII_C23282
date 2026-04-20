import api from "./api";

export const getSpecialites = async () => {
  const response = await api.get("/reference/specialites");
  return response.data;
};

export const getSousSpecialitesBySpecialite = async (specialiteId) => {
  const response = await api.get(
    `/reference/specialites/${specialiteId}/sous-specialites`,
  );
  return response.data;
};
