// import { createContext, useContext, useState, useEffect } from "react";

// const FormContext = createContext();

// export const FormProvider = ({ children }) => {

//   const [submitted, setSubmitted] = useState(false);

//   const [step, setStep] = useState(1);

//   const [formData, setFormData] = useState({
//     personal: {},
//     education: [],
//     experience: [],
//     documents: {
//       diplomes: [],
//       certificats: [],
//       autres: []
//     }
//   });

//   // Charger les données sauvegardées
//   useEffect(() => {
//     const savedData = localStorage.getItem("adhesionForm");

//     if (savedData) {
//       setFormData(JSON.parse(savedData));
//     }
//   }, []);

//   // Sauvegarde automatique
//   useEffect(() => {
//     localStorage.setItem("adhesionForm", JSON.stringify(formData));
//   }, [formData]);

//   const updateSection = (section, data) => {
//     setFormData((prev) => ({
//       ...prev,
//       [section]: data
//     }));
//   };

//   const resetForm = () => {
//     setFormData({
//       personal: {},
//       education: [],
//       experience: [],
//       documents: {
//         diplomes: [],
//         certificats: [],
//         autres: []
//       }
//     });
//     setStep(1);
//   };


//   return (
//     <FormContext.Provider
//       value={{
//         step,
//         setStep,
//         submitted,
//         setSubmitted,
//         formData,
//         updateSection
//       }}
//     >
//       {children}
//     </FormContext.Provider>
//   );
// };

// export const useFormData = () => useContext(FormContext);

import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const initialState = {
    personal: {},
    education: [],
    experience: [],
    documents: {
      diplomes: [],
      certificats: [],
      autres: []
    }
  };

  const [formData, setFormData] = useState(initialState);

  // Charger les données sauvegardées
  useEffect(() => {
    const savedData = localStorage.getItem("adhesionForm");

    if (savedData) {
      const parsed = JSON.parse(savedData);
      console.log("Form data loaded from localStorage:", parsed);
      setFormData(parsed);
    }
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    console.log("Form data updated, saving to localStorage:", formData);
    localStorage.setItem("adhesionForm", JSON.stringify(formData));
  }, [formData]);

  const updateSection = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data
    }));
  };

  const fillForm = (data) => {
    setFormData(data);
  };

  const resetForm = () => {
    setFormData(initialState);
    setStep(1);
    setSubmitted(false);
    localStorage.removeItem("adhesionForm");
  };

  return (
    <FormContext.Provider
      value={{
        step,
        setStep,
        submitted,
        setSubmitted,
        formData,
        setFormData,
        updateSection,
        fillForm,
        resetForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = () => useContext(FormContext);