import MedecinLayout from "../../components/medecin/MedecinLayout";
import { Construction } from "lucide-react";

function PlaceholderPage({ title = "En construction" }) {
  return (
    <MedecinLayout title={title}>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Construction size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Cette section sera développée dans l'étape suivante.
        </p>
      </div>
    </MedecinLayout>
  );
}

export default PlaceholderPage;
