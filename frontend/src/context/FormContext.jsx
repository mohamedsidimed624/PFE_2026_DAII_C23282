import { createContext, useContext, useState, useEffect } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {

  const [submitted, setSubmitted] = useState(false);

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    personal: {},
    education: [],
    experience: [],
    documents: {
      diplomes: [],
      certificats: [],
      autres: []
    }
  });

  // Charger les données sauvegardées
  useEffect(() => {
    const savedData = localStorage.getItem("adhesionForm");

    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem("adhesionForm", JSON.stringify(formData));
  }, [formData]);

  const updateSection = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data
    }));
  };

  const resetForm = () => {
    setFormData({
      personal: {},
      education: [],
      experience: [],
      documents: {
        diplomes: [],
        certificats: [],
        autres: []
      }
    });
    setStep(1);
  };


  return (
    <FormContext.Provider
      value={{
        step,
        setStep,
        submitted,
        setSubmitted,
        formData,
        updateSection
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = () => useContext(FormContext);