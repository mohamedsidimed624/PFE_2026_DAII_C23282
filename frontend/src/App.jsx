import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import AdminRoutes from "./routes/AdminRoutes";
import AdminRoute from "./routes/AdminRoute";
import MedecinRoute from "./routes/MedecinRoute";

const Home                          = lazy(() => import("./pages/Home"));
const SubmitApplication             = lazy(() => import("./pages/SubmitApplication"));
const LoginPage                     = lazy(() => import("./pages/LoginPage"));
const SetPasswordPage               = lazy(() => import("./pages/SetPasswordPages"));
const ForgotPasswordPage            = lazy(() => import("./pages/ForgotPasswordPage"));
const ActivateAccountPage           = lazy(() => import("./pages/ActivateAccountPage"));
const SuiviDossierPage              = lazy(() => import("./pages/SuiviDossierPage"));
const AnnuaireMedecinDetailPage     = lazy(() => import("./pages/AnnuaireMedecinDetailPage.jsx"));
const AnnuairePage                  = lazy(() => import("./pages/AnnuairePage.jsx"));
const PublicReclamationPage         = lazy(() => import("./pages/PublicReclamationPage.jsx"));
const Contact                       = lazy(() => import("./pages/ContactPage.jsx"));
const AnnoncesPage                  = lazy(() => import("./pages/AnnoncesPage.jsx"));
const AnnonceDetailPage             = lazy(() => import("./pages/AnnonceDetailPage.jsx"));
const GaleriePage                   = lazy(() => import("./pages/GaleriePage.jsx"));
const AProposPage                   = lazy(() => import("./pages/AProposPage.jsx"));

const MedecinDashboard              = lazy(() => import("./pages/medecin/MedecinDashboard"));
const MedecinParametresPage         = lazy(() => import("./pages/medecin/MedecinParametresPage.jsx"));
const MedecinProfilPage             = lazy(() => import("./pages/medecin/MedecinProfilPage.jsx"));
const MedecinReclamationCreatePage  = lazy(() => import("./pages/medecin/MedecinReclamationCreatePage.jsx"));
const MedecinReclamationsPage       = lazy(() => import("./pages/medecin/MedecinReclamationsPage.jsx"));
const MedecinReclamationDetailPage  = lazy(() => import("./pages/medecin/MedecinReclamationDetailPage.jsx"));
const MedecinNotificationsPage      = lazy(() => import("./pages/medecin/MedecinNotificationsPage.jsx"));
const MedecinSondagesPage           = lazy(() => import("./pages/medecin/MedecinSondagesPage.jsx"));
const MedecinSondageParticipationPage = lazy(() => import("./pages/medecin/MedecinSondageParticipationPage.jsx"));
const MedecinSondageResultatsPage   = lazy(() => import("./pages/medecin/MedecinSondageResultatsPage.jsx"));
const MedecinElectionsPage          = lazy(() => import("./pages/medecin/MedecinElectionsPage.jsx"));
const MedecinElectionDetailPage     = lazy(() => import("./pages/medecin/MedecinElectionDetailPage.jsx"));
const MedecinElectionCandidatesPage = lazy(() => import("./pages/medecin/MedecinElectionCandidatesPage.jsx"));
const MedecinVotingPage             = lazy(() => import("./pages/medecin/MedecinVotingPage.jsx"));
const MedecinCandidaturesPage       = lazy(() => import("./pages/medecin/MedecinCandidaturesPage.jsx"));
const CandidatureFormPage           = lazy(() => import("./pages/medecin/CandidatureFormPage.jsx"));
const MedecinElectionResultsPage    = lazy(() => import("./pages/medecin/MedecinElectionResultsPage.jsx"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-6 h-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
    </div>
  );
}

function App() {
  return (
    <>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/annonces" element={<AnnoncesPage />} />
          <Route path="/annonces/:id" element={<AnnonceDetailPage />} />
          <Route path="/adhesion" element={<SubmitApplication />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/activate" element={<ActivateAccountPage />} />
          <Route path="/suivi-dossier" element={<SuiviDossierPage />} />
          <Route path="/annuaire" element={<AnnuairePage />} />
          <Route path="/annuaire/:id" element={<AnnuaireMedecinDetailPage />} />
          <Route path="/reclamations" element={<PublicReclamationPage />} />
          <Route path="/galerie" element={<GaleriePage />} />
          <Route path="/a-propos" element={<AProposPage />} />

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
            path="/medecin/notifications"
            element={
              <MedecinRoute>
                <MedecinNotificationsPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/sondages"
            element={
              <MedecinRoute>
                <MedecinSondagesPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/sondages/:id"
            element={
              <MedecinRoute>
                <MedecinSondageParticipationPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/sondages/:id/resultats"
            element={
              <MedecinRoute>
                <MedecinSondageResultatsPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/elections"
            element={
              <MedecinRoute>
                <MedecinElectionsPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/elections/:id"
            element={
              <MedecinRoute>
                <MedecinElectionDetailPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/elections/:id/candidats"
            element={
              <MedecinRoute>
                <MedecinElectionCandidatesPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/elections/:id/voter"
            element={
              <MedecinRoute>
                <MedecinVotingPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/elections/:id/candidater"
            element={
              <MedecinRoute>
                <CandidatureFormPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/elections/:id/resultats"
            element={
              <MedecinRoute>
                <MedecinElectionResultsPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/candidatures"
            element={
              <MedecinRoute>
                <MedecinCandidaturesPage />
              </MedecinRoute>
            }
          />

          <Route
            path="/medecin/parametres"
            element={
              <MedecinRoute>
                <MedecinParametresPage />
              </MedecinRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
