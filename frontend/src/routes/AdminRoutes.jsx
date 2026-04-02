import { Routes, Route } from "react-router-dom";

import AdminDemandesList from "../pages/admin/AdminDemandesList";
import AdminDemandeDetail from "../pages/admin/AdminDemandeDetail";
import AdminMedecinsList from "../pages/admin/AdminMedecinList";
import AdminMedecinDetail from "../pages/admin/AdminMedecinDetail";

function AdminRoutes() {
  return (
    <Routes>
      <Route path="demandes" element={<AdminDemandesList />} />
      <Route path="demandes/:id" element={<AdminDemandeDetail />} />

      <Route path="medecins" element={<AdminMedecinsList />} />
      <Route path="medecins/:id" element={<AdminMedecinDetail />} />
    </Routes>
  );
}

export default AdminRoutes;