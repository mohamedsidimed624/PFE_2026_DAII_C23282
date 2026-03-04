import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* logo */}
          <div className="flex items-center h-16">
            ONMM
          </div>

          {/* liens : cachés en mobile, visibles sur md+ */}
          <div className="hidden md:flex space-x-8 items-center">
            <a className="text-gray-700 hover:text-blue-600" href="">Acceuil</a>
            <a className="text-gray-700 hover:text-blue-600" href="">Annonces</a>
            <a className="text-gray-700 hover:text-blue-600" href="">A propos</a>
            <a className="text-gray-700 hover:text-blue-600" href="">Contact</a>
            <a className="text-gray-700 hover:text-blue-600" href="">annuaire</a>
            <button className="bg-green-600 text-white px-4 py-2 rounded-4xl">
              <User size={20} /> Connexion
            </button>
          </div>

          {/* bouton hamburger visible uniquement en mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* menu mobile déroulant */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200">
          <a className="block px-4 py-3 text-sm hover:bg-blue-50" href="">Acceuil</a>
          <a className="block px-4 py-3 text-sm hover:bg-blue-50" href="">Annonces</a>
          <a className="block px-4 py-3 text-sm hover:bg-blue-50" href="">A propos</a>
          <a className="block px-4 py-3 text-sm hover:bg-blue-50" href="">Contact</a>
          <a className="block px-4 py-3 text-sm hover:bg-blue-50" href="">annuaire</a>
        </div>
      )}
    </nav>
  );
}