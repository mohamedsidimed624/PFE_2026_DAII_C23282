import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/public/Breadcrumb';
import MultistepForm from '../components/reclamation/MultistepForm';

const BREADCRUMB = [{ label: "Accueil", to: "/" }, { label: "Réclamation" }];

export default function PublicReclamationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <Breadcrumb items={BREADCRUMB} />
      <main className="flex-1 mt-14">
        <MultistepForm />
      </main>
      <Footer />
    </div>
  );
}
