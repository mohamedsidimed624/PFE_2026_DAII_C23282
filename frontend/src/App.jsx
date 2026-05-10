import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import SubmitApplication from "./pages/SubmitApplication";
import LoginPage from "./pages/LoginPage";
import SetPasswordPage from "./pages/SetPasswordPages";
import SuiviDossierPage from "./pages/SuiviDossierPage";

import AdminRoutes from "./routes/AdminRoutes";
import AdminRoute from "./routes/AdminRoute";
import MedecinRoute from "./routes/MedecinRoute";

import MedecinDashboard from "./pages/medecin/MedecinDashboard";
import PlaceholderPage from "./pages/medecin/PlaceholderPage";
import MedecinProfilPage from "./pages/medecin/MedecinProfilPage.jsx";

import AnnuaireMedecinDetailPage from "./pages/AnnuaireMedecinDetailPage.jsx";
import AnnuairePage from "./pages/AnnuairePage.jsx";

import PublicReclamationPage from "./pages/PublicReclamationPage.jsx";
import MedecinReclamationCreatePage from "./pages/medecin/MedecinReclamationCreatePage.jsx";
import MedecinReclamationsPage from "./pages/medecin/MedecinReclamationsPage.jsx";
import MedecinReclamationDetailPage from "./pages/medecin/MedecinReclamationDetailPage.jsx";

import Contact from "./pages/ContactPage.jsx";
import AnnoncesPage from "./pages/AnnoncesPage.jsx";
import AnnonceDetailPage from "./pages/AnnonceDetailPage.jsx";
import GaleriePage from "./pages/GaleriePage.jsx";
import AProposPage from "./pages/AProposPage.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import AssistantButton from "./components/public/AssistantButton.jsx";

function PublicChatbot() {
  const { pathname } = useLocation();
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/medecin") ||
    pathname === "/login" ||
    pathname === "/set-password" ||
    pathname === "/assistant"
  ) return null;
  return <AssistantButton />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/annonces" element={<AnnoncesPage />} />
        <Route path="/annonces/:id" element={<AnnonceDetailPage />} />
        <Route path="/adhesion" element={<SubmitApplication />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/suivi-dossier" element={<SuiviDossierPage />} />
        <Route path="/annuaire" element={<AnnuairePage />} />
        <Route path="/annuaire/:id" element={<AnnuaireMedecinDetailPage />} />
        <Route path="/reclamations" element={<PublicReclamationPage />} />
        <Route path="/galerie" element={<GaleriePage />} />
        <Route path="/a-propos" element={<AProposPage />} />
        <Route path="/assistant" element={<ChatbotPage />} />

        <Route
          path="/medecin/reclamations"
          element={
            <MedecinRoute>
              <MedecinReclamationsPage />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/reclamations/nouvelle"
          element={
            <MedecinRoute>
              <MedecinReclamationCreatePage />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/reclamations/:id"
          element={
            <MedecinRoute>
              <MedecinReclamationDetailPage />
            </MedecinRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminRoutes />
            </AdminRoute>
          }
        />

        <Route
          path="/medecin/dashboard"
          element={
            <MedecinRoute>
              <MedecinDashboard />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/profil"
          element={
            <MedecinRoute>
              <MedecinProfilPage />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/documents"
          element={
            <MedecinRoute>
              <PlaceholderPage title="Mes documents" />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/notifications"
          element={
            <MedecinRoute>
              <PlaceholderPage title="Notifications" />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/reclamations"
          element={
            <MedecinRoute>
              <PlaceholderPage title="Réclamation" />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/sondages"
          element={
            <MedecinRoute>
              <PlaceholderPage title="Sondage" />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/elections"
          element={
            <MedecinRoute>
              <PlaceholderPage title="Élection" />
            </MedecinRoute>
          }
        />

        <Route
          path="/medecin/parametres"
          element={
            <MedecinRoute>
              <PlaceholderPage title="Paramètres" />
            </MedecinRoute>
          }
        />
      </Routes>

      <PublicChatbot />
    </>
  );
}

export default App;
