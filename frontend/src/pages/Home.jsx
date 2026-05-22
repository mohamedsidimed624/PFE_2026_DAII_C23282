import React from 'react'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import About from '../components/About'
import Contact from '../components/Contact'
import Teams from '../components/Teams'
import DernieresAnnonces from '../components/DernieresAnnonces'

export default function Home() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <Navbar />
            <main>
                <Hero />
                <Services />
                <DernieresAnnonces />
                <About />
                <Teams />
                <Contact />
            </main>
            <Footer />
        </div>
    )
}
