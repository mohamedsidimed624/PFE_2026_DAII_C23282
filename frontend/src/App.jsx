import { Routes, Route } from "react-router-dom";
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

import { FormProvider } from "./context/FormContext.jsx";

function App() {
  return (
    <FormProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adhesion" element={<SubmitApplication />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/suivi-dossier" element={<SuiviDossierPage />} />

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
    </FormProvider>
  );
}

export default App;