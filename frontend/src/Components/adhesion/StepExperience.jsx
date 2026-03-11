import { useState } from "react";
import ExperienceForm from "./ExperienceForm";
import ExperienceList from "./ExperienceList";

function StepExperience({ nextStep, prevStep }) {

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  return (

    <div>

      {isAdding ? (

        <ExperienceForm
          setIsAdding={setIsAdding}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
        />

      ) : (

        <ExperienceList
          setIsAdding={setIsAdding}
          setEditingIndex={setEditingIndex}
          nextStep={nextStep}
          prevStep={prevStep}
        />

      )}

    </div>

  );

}

export default StepExperience;