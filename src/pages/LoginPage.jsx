// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Obtén la URL de la API desde la variable de entorno
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      console.log('Inicio de sesión exitoso:', response.data);
      const { token, role, name } = response.data;
      login(token, role, name);
      // Redirige al usuario después de iniciar sesión
    } catch (error) {
      setError(error.response ? error.response.data : 'Error al iniciar sesión');
      console.error('Error al iniciar sesión:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-panel">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
