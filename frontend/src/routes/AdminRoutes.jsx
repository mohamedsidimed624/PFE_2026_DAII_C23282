import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const AdminDashboard              = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminDemandesList           = lazy(() => import("../pages/admin/AdminDemandesList"));
const AdminDemandeDetail          = lazy(() => import("../pages/admin/AdminDemandeDetail"));
const AdminMedecinsList           = lazy(() => import("../pages/admin/AdminMedecinList"));
const AdminMedecinDetail          = lazy(() => import("../pages/admin/AdminMedecinDetail"));
const AdminReclamationsList       = lazy(() => import("../pages/admin/AdminReclamationList"));
const AdminReclamationDetail      = lazy(() => import("../pages/admin/AdminReclamationDetail"));
const AdminSpecialitesPage        = lazy(() => import("../pages/admin/AdminSpecialitesPage"));
const AdminContenusPage           = lazy(() => import("../pages/admin/AdminContenusPage"));
const AdminParametresPage         = lazy(() => import("../pages/admin/AdminParametresPage"));
const AdminNotificationsPage      = lazy(() => import("../pages/admin/AdminNotificationsPage"));
const AdminSondagesPage           = lazy(() => import("../pages/admin/AdminSondagesPage"));
const AdminSondageCreationPage    = lazy(() => import("../pages/admin/AdminSondageCreationPage"));
const AdminSondageDetailPage      = lazy(() => import("../pages/admin/AdminSondageDetailPage"));
const AdminElectionsPage          = lazy(() => import("../pages/admin/AdminElectionsPage"));
const AdminElectionCreationPage   = lazy(() => import("../pages/admin/AdminElectionCreationPage"));
const AdminElectionDetailPage     = lazy(() => import("../pages/admin/AdminElectionDetailPage"));
const AdminElectionCandidatesPage = lazy(() => import("../pages/admin/AdminElectionCandidatesPage"));

function AdminRoutes() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    }>
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
      </Routes>
    </Suspense>
  );
}

export default AdminRoutes;
