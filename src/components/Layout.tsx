import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuIconRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuIconRef.current &&
        !menuIconRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* MENU FLUTUANTE (Canto Superior Esquerdo) */}
      <div className="menu-container">
        {/* Botão Redondo do Menu */}
        <div 
          className="menu-icon" 
          onClick={toggleMenu}
          ref={menuIconRef}
        >
          <span className="material-icons" style={{ fontSize: '24px', color: '#fff' }}>
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </div>

        {/* Lista de Itens (Dropdown) */}
        <div 
          className={`menu-items ${isMenuOpen ? 'show' : ''}`} 
          ref={menuRef}
        >
          <Link to="/pets" className="menu-item" onClick={() => setIsMenuOpen(false)}>
            <span className="material-icons">pets</span>
            <span>Meus Pets</span>
          </Link>

          <Link to="/tutores" className="menu-item" onClick={() => setIsMenuOpen(false)}>
            <span className="material-icons">person</span>
            <span>Tutores</span>
          </Link>

          {/* Botão Sair (Destaque Vermelho Suave) */}
          <div 
            className="menu-item" 
            onClick={handleLogout} 
            style={{ borderTop: '1px solid #444', marginTop: '4px', paddingTop: '8px' }}
          >
            <span className="material-icons" style={{ color: '#ef9a9a' }}>logout</span>
            <span style={{ color: '#ef9a9a' }}>Sair da Plataforma</span>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="main-wrapper">
        <div className="container">
          {/* Onde as páginas (PetList, Forms, etc.) são renderizadas */}
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Layout;