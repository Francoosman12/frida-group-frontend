// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import SalesPage from './pages/SalesPage';
import SalesRecordPage from './pages/SalesRecordPage';
import LoginPage from './pages/LoginPage';
import { SalesProvider } from './context/SalesContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // Asegúrate de importar useAuth
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Obtén el estado de autenticación
  return isAuthenticated ? children : <Navigate to="/" />; // Redirige a la página de inicio de sesión si no está autenticado
};

const AdminRoute = ({ children }) => {
  const { role } = useAuth(); // Obtén el rol del usuario
  return role === 'admin' ? children : <Navigate to="/sales" />; // Redirige a la página de ventas si el usuario no es admin
};

function App() {
  return (
    <Router>
  <AuthProvider> {/* Envuelve AuthProvider dentro de Router */}
    <SalesProvider>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/sales" 
            element={
              <PrivateRoute>
                <SalesPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/sales-record" 
            element={
              <PrivateRoute>
                <SalesRecordPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </SalesProvider>
  </AuthProvider>
</Router>

  );
}

export default App;
