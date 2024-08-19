// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isLogin) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        console.log('Inicio de sesión exitoso:', response.data);
        const { token, role, name } = response.data;
        login(token, role, name); // Pasa el nombre del usuario a la función de login
        navigate('/sales');
      } catch (error) {
        setError(error.response ? error.response.data : 'Error al iniciar sesión');
        console.error('Error al iniciar sesión:', error.response ? error.response.data : error.message);
      }
    } else {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
  
      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        console.log('Registro exitoso:', response.data);
        navigate('/login');
      } catch (error) {
        setError(error.response ? error.response.data : 'Error al registrarse');
        console.error('Error al registrarse:', error.response ? error.response.data : error.message);
      }
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-panel">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {!isLogin && (
            <input
              type="text"
              placeholder="Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
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
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button type="submit">{isLogin ? 'Ingresar' : 'Registrarse'}</button>
          {!isLogin && <a href="#">¿Olvidaste tu contraseña?</a>}
        </form>
        <button
          className="toggle-button"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
