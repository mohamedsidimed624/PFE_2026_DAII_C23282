import { Navigate } from "react-router-dom";

function MedecinRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "MEDECIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default MedecinRoute;