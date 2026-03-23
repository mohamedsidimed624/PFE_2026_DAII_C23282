import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SubmitApplication from "./pages/SubmitApplication";
import SetPasswordPage from "./pages/SetPasswordPages";
import AdminRoutes from "./routes/AdminRoutes";
// import Contact from "./pages/Contact";
// import Login from "./pages/Login";
// import Annuaire from "./pages/Annuaire";
// import Annonces from "./pages/Annonces";

function App() {
  return (

      
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/adhesion" element={<SubmitApplication />} />

        {/* <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />

        <Route path="/annuaire" element={<Annuaire />} />

        <Route path="/annonces" element={<Annonces />} /> */}

        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="/set-password" element={<SetPasswordPage />} />


      </Routes>


    

  );
}

export default App;