import { Routes, Route } from "react-router-dom";

import AdminDemandesList from "../pages/admin/AdminDemandesList";
import AdminDemandeDetail from "../pages/admin/AdminDemandeDetail";

function AdminRoutes() {
  return (
    <Routes>

      <Route path="demandes" element={<AdminDemandesList />} />
      <Route path="demandes/:id" element={<AdminDemandeDetail />} />

    </Routes>
  );
}

export default AdminRoutes;