import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../styles/Navbar.css';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, role, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/'); // Redirige al inicio después del logout
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid d-flex justify-content-between">
        <Link className="container-logo animate__animated animate__flipInX animate__delay-1s" to="/">
          <img src="src/assets/urraca.png" className='urraca-logo' alt="" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mb-2 mb-lg-0">
            {isAuthenticated && role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/sales">Ventas</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Administración</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/sales-record">Ver registro de ventas</Link>
                </li>
              </>
            )}
            {isAuthenticated && role === 'vendedor' && (
              <li className="nav-item">
                <Link className="nav-link" to="/sales">Ventas</Link>
              </li>
            )}
          </ul>
          {isAuthenticated ? (
            <div className="d-flex align-items-center">
              <span className="navbar-text text-white me-3">
                Hola, {username || (role === 'admin' ? 'Administrador' : 'Vendedor')}
              </span>
              <button className="btn btn-outline-light" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          ) : (
            <Link className="btn btn-outline-light" to="/">Iniciar sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
