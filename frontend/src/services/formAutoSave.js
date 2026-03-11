export const saveForm = (data) => {
  localStorage.setItem("adhesionForm", JSON.stringify(data));
};

export const loadForm = () => {
  const saved = localStorage.getItem("adhesionForm");

  if (!saved) return null;

  return JSON.parse(saved);
};
