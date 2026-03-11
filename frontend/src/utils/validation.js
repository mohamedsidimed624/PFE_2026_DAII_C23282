export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validateRequired = (value) => {
  return value && value.trim() !== "";
};
