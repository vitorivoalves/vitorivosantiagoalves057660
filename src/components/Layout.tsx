// src/components/Layout.tsx
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="menu-container">
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="material-icons">menu</span>
        </div>
        
        {menuOpen && (
            <div className="menu-items">
                <Link to="/pets" className="menu-item" onClick={() => setMenuOpen(false)}>
                    <span className="material-icons">pets</span>
                    <span>Meus Pets</span>
                </Link>
                <Link to="/tutores" className="menu-item" onClick={() => setMenuOpen(false)}>
                    <span className="material-icons">person</span>
                    <span>Tutores</span>
                </Link>
                <Link to="/" className="menu-item" onClick={() => {
                    setMenuOpen(false);
                    localStorage.removeItem('token');
                }}>
                    <span className="material-icons">logout</span>
                    <span>Sair</span>
                </Link>
            </div>
        )}
      </div>

      <main className="main-wrapper">
        <div className="container">
             {/* AQUI é onde as páginas (Login, Lista, etc) vão ser carregadas */}
             <Outlet /> 
        </div>
      </main>
    </>
  );
};

export default Layout;