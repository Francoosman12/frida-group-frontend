// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import SalesPage from './pages/SalesPage';
import SalesRecordPage from './pages/SalesRecordPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage'; // Página de usuarios
import LabelPage from './pages/LabelPage'; // Nueva página para generar etiquetas
import { SalesProvider } from './context/SalesContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // Asegúrate de importar useAuth
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { UserProvider } from './context/UserContext'; // Asegúrate de importar UserProvider
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const { role } = useAuth();
  return role === 'admin' ? children : <Navigate to="/sales" />;
};

function App() {
  return (
    <Router>
      <AuthProvider> {/* Envuelve AuthProvider dentro de Router */}
        <UserProvider> {/* Envuelve UserProvider dentro de AuthProvider */}
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
                <Route
                  path="/user-page"
                  element={
                    <AdminRoute>
                      <UsersPage /> {/* Página de usuarios */}
                    </AdminRoute>
                  }
                />
                {/* Ruta para la nueva página de etiquetas */}
                <Route
                  path="/label-page"
                  element={
                    <AdminRoute>
                      <LabelPage /> {/* Página de etiquetas */}
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </SalesProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
