import { Routes, Route } from "react-router-dom";

import AdminDemandesList from "../pages/admin/AdminDemandesList";
import AdminDemandeDetail from "../pages/admin/AdminDemandeDetail";
import AdminMedecinsList from "../pages/admin/AdminMedecinList";
import AdminMedecinDetail from "../pages/admin/AdminMedecinDetail";
import AdminReclamationsList from "../pages/admin/AdminReclamationList";
import AdminReclamationDetail from "../pages/admin/AdminReclamationDetail";
import AdminSpecialitesPage from "../pages/admin/AdminSpecialitesPage";

function AdminRoutes() {
  return (
    <Routes>
      <Route path="demandes" element={<AdminDemandesList />} />
      <Route path="demandes/:id" element={<AdminDemandeDetail />} />

      <Route path="medecins" element={<AdminMedecinsList />} />
      <Route path="medecins/:id" element={<AdminMedecinDetail />} />

      <Route path="reclamations" element={<AdminReclamationsList />} />
      <Route path="reclamations/:id" element={<AdminReclamationDetail />}/>

      <Route path="specialites" element={<AdminSpecialitesPage />} />
    </Routes>
  );
}

export default AdminRoutes;