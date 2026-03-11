import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SubmitApplication from "./pages/SubmitApplication";
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

    </Routes>

  );
}

export default App;