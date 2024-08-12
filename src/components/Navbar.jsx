// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // Importa el archivo CSS para el Navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">Urraca-Drugstore</Link>
        <div className="navbar-links">
          <Link to="/">Ventas</Link>
          <Link to="/admin">Administración</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
