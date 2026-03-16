import { useFormData } from "../../context/FormContext";
import { Upload, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
function StepDocuments({ nextStep, prevStep }) {

  const { formData, updateSection } = useFormData();
  const [error, setError] = useState("");
  /* =========================
     sécuriser la structure
  ========================= */

  const files = {
    diplomes: formData?.documents?.diplomes || [],
    certificats: formData?.documents?.certificats || [],
    autres: formData?.documents?.autres || []
  };


  /* =========================
     Upload fichier
  ========================= */

  const handleUpload = (fileList, type) => {

    const uploaded = Array.from(fileList);

    const validFiles = uploaded
      .filter(file => {

        const allowed =
          file.type === "application/pdf" ||
          file.type === "image/jpeg" ||
          file.type === "image/png";

        const sizeOk = file.size <= 5 * 1024 * 1024;

        return allowed && sizeOk;

      })
      .map(file => ({
        file,
        progress: 100
      }));


    updateSection("documents", {
      ...files,
      [type]: [...files[type], ...validFiles]
    });

  };


  /* =========================
     Drag & Drop
  ========================= */

  const handleDrop = (e, type) => {

    e.preventDefault();

    handleUpload(e.dataTransfer.files, type);

  };


  /* =========================
     supprimer fichier
  ========================= */

  const removeFile = (type, index) => {

    const updated = [...files[type]];

    updated.splice(index, 1);

    updateSection("documents", {
      ...files,
      [type]: updated
    });

  };


  /* =========================
     uploader UI
  ========================= */

  const renderUploader = (title, type) => (

    <div className="bg-white border rounded-xl p-5">

      <h3 className="font-semibold mb-4">{title}</h3>


      {/* drag zone */}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, type)}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition"
      >

        <Upload className="mx-auto mb-2 text-gray-400" />

        <p className="text-sm text-gray-600">
          Glisser les fichiers ici
        </p>

        <label className="text-green-600 cursor-pointer text-sm">

          ou cliquer pour ajouter

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) =>
              handleUpload(e.target.files, type)
            }
          />

        </label>

        <p className="text-xs text-gray-400 mt-1">
          PDF / JPG / PNG — max 5MB
        </p>

      </div>


      {/* liste fichiers */}

      <div className="mt-4 space-y-3">

        {files[type].map((item, index) => (

          <div
            key={index}
            className="bg-gray-50 rounded-lg p-3"
          >

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">

                <FileText
                  size={18}
                  className="text-green-600"
                />

                <div>

                  <div className="text-sm font-medium">
                    {item.file.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {(item.file.size / 1024).toFixed(1)} KB
                  </div>

                </div>

              </div>

              <button
                onClick={() => removeFile(type, index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18}/>
              </button>

            </div>


            {/* progress bar */}

            <div className="w-full bg-gray-200 h-2 rounded mt-2">

              <div
                className="bg-green-500 h-2 rounded transition-all"
                style={{ width: item.progress + "%" }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>

  );


  /* =========================
     UI global
  ========================= */

  return (

    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {renderUploader(
          "Diplômes universitaires",
          "diplomes"
        )}

        {renderUploader(
          "Certificats de spécialisation",
          "certificats"
        )}

        {renderUploader(
          "Autres documents",
          "autres"
        )}

      </div>


      {/* navigation */}

      <div className="flex justify-between mt-6">

        <button
          onClick={prevStep}
          className="border
          px-6 py-3
          rounded-lg
          hover:bg-gray-100
          transition"
        >
          Retour
        </button>

        {error && (
            <p className="text-red-500 text-sm mt-2">
                {error}
            </p>
        )}
        <button
          onClick={() => {
            if (files.diplomes.length === 0 && files.certificats.length === 0) {
                setError("Veuillez ajouter au moins une diplome et certificats.");
                return;
            }
            if (files.diplomes.length === 0) {
                setError("Veuillez ajouter au moins une diplome");
                return;
            }
            if (files.certificats.length === 0) {
                setError("Veuillez ajouter au moins une certificats.");
                return;
            }
            setError("");
          nextStep(); 
          }}
          className="bg-green-600 text-white px-8 py-3 rounded-lg"
        >
          Suivant
        </button>
        

      </div>

    </div>

  );

}

export default StepDocuments;