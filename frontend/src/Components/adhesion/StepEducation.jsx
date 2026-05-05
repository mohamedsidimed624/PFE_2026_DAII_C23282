import { useState } from "react";
import EducationForm from "./EducationForm";
import EducationList from "./EducationList";

function StepEducation({ nextStep, prevStep }) {

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  return (

    <div>

      {isAdding ? (

        <EducationForm
          setIsAdding={setIsAdding}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}  
        />

      ) : (

        <EducationList
          setIsAdding={setIsAdding}
          setEditingIndex={setEditingIndex}
          nextStep={nextStep}
          prevStep={prevStep}
        />

      )}

    </div>

  );

}

export default StepEducation;