import React from 'react'
import { Link } from "react-router-dom";
import Hero from '../Components/Hero'
import Services from '../Components/Services'
import Footer from '../Components/Footer'
import Navbar from '../Components/NavBar'
import About from '../Components/About'
import Contact from '../Components/Contact'

export default function Home() {
  return (
    <div> 
        <Navbar />

        <Hero />

        <Services />

        <About />

        <Contact />

        <Footer />
    </div>
  )
}
