import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SubmitApplication from "./pages/SubmitApplication";
import LoginPage from "./pages/LoginPage";
import SetPasswordPage from "./pages/SetPasswordPages";
import AdminRoutes from "./routes/AdminRoutes";
import MedecinDashboard from "./pages/medecin/MedecinDahboard";
import MedecinRoute from "./routes/MedecinRoute";
import AdminRoute from "./routes/AdminRoute";
// import Contact from "./pages/Contact";
// import Login from "./pages/Login";
// import Annuaire from "./pages/Annuaire";
// import Annonces from "./pages/Annonces";

function App() {
  return (

      
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/adhesion" element={<SubmitApplication />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/medecin/dashboard" element={<MedecinDashboard />} />

        {/* <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/annuaire" element={<Annuaire />} />

        <Route path="/annonces" element={<Annonces />} /> */}

        <Route path="/admin/*" 
          element={
            <AdminRoute>
              <AdminRoutes />
            </AdminRoute>
          } 
          />

        <Route path="/set-password" element={<SetPasswordPage />} />


      </Routes>


    

  );
}

export default App;