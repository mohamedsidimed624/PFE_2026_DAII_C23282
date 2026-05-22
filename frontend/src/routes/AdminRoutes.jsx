import { Routes, Route } from "react-router-dom";

import AdminDemandesList from "../pages/admin/AdminDemandesList";
import AdminDemandeDetail from "../pages/admin/AdminDemandeDetail";
import AdminMedecinsList from "../pages/admin/AdminMedecinList";
import AdminMedecinDetail from "../pages/admin/AdminMedecinDetail";
import AdminReclamationsList from "../pages/admin/AdminReclamationList";
import AdminReclamationDetail from "../pages/admin/AdminReclamationDetail";
import AdminSpecialitesPage from "../pages/admin/AdminSpecialitesPage";
import AdminContenusPage from "../pages/admin/AdminContenusPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminParametresPage from "../pages/admin/AdminParametresPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";
import AdminSondagesPage from "../pages/admin/AdminSondagesPage";
import AdminSondageCreationPage from "../pages/admin/AdminSondageCreationPage";
import AdminSondageDetailPage from "../pages/admin/AdminSondageDetailPage";
import AdminElectionsPage from "../pages/admin/AdminElectionsPage";
import AdminElectionCreationPage from "../pages/admin/AdminElectionCreationPage";
import AdminElectionDetailPage from "../pages/admin/AdminElectionDetailPage";
import AdminCandidaturesPage from "../pages/admin/AdminCandidaturesPage";
import AdminElectionCandidatesPage from "../pages/admin/AdminElectionCandidatesPage";


function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />

      <Route path="notifications" element={<AdminNotificationsPage />} />

      <Route path="demandes" element={<AdminDemandesList />} />
      <Route path="demandes/:id" element={<AdminDemandeDetail />} />

      <Route path="medecins" element={<AdminMedecinsList />} />
      <Route path="medecins/:id" element={<AdminMedecinDetail />} />

      <Route path="reclamations" element={<AdminReclamationsList />} />
      <Route path="reclamations/:id" element={<AdminReclamationDetail />}/>

      <Route path="specialites" element={<AdminSpecialitesPage />} />

      <Route path="diffusion" element={<AdminContenusPage />} />

      <Route path="parametres" element={<AdminParametresPage />} />
      <Route path="parametres/securite" element={<AdminParametresPage />} />

      <Route path="sondages" element={<AdminSondagesPage />} />
      <Route path="sondages/nouveau" element={<AdminSondageCreationPage />} />
      <Route path="sondages/:id/modifier" element={<AdminSondageCreationPage />} />
      <Route path="sondages/:id" element={<AdminSondageDetailPage />} />

      <Route path="processus/elections" element={<AdminElectionsPage />} />
      <Route path="processus/elections/nouveau" element={<AdminElectionCreationPage />} />
      <Route path="processus/elections/:id/modifier" element={<AdminElectionCreationPage />} />
      <Route path="processus/elections/:id" element={<AdminElectionDetailPage />} />
      <Route path="processus/elections/:id/candidats" element={<AdminElectionCandidatesPage />} />
      <Route path="processus/candidats" element={<AdminCandidaturesPage />} />
    </Routes>
  );
}

export default AdminRoutes;