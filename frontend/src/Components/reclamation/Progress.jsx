// import React from 'react'

// export default function progress({step}) {
//     const stepTitles = ["Votre informations", "Votre reclamation", "Confirmation", "Envoyee"];
//   return (
//     <div>
//         <ul className='steps steps-horizontal w-full mb-4'>
//             {stepTitles.map((title, index) => (
//                 <li key={index} className={`step ${index <= step ? "step-success" : ""} text-xs sm:text-sm`}>
//                     {title}
//                 </li>
//             ))}
//         </ul>
//     </div>
//   )
// }

import React from "react";

export default function Progress({ step }) {
  const stepTitles = [
    "Vos informations",
    "Votre réclamation",
    "Confirmation",
    "Envoyée",
  ];

  return (
    <div>
      <ul className="steps steps-horizontal mb-4 w-full">
        {stepTitles.map((title, index) => (
          <li
            key={index}
            className={`step ${index <= step ? "step-success" : ""} text-xs sm:text-sm`}
          >
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}