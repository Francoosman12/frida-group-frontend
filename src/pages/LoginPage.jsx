import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        console.log('Inicio de sesión exitoso:', response.data);
        const { token, role, name } = response.data;
        login(token, role, name);
        // Aquí puedes redirigir o hacer cualquier otra acción
      } catch (error) {
        // Asegúrate de que error.response.data sea una cadena o manipúlalo adecuadamente
        const errorMessage = error.response && typeof error.response.data === 'string'
          ? error.response.data
          : 'Error al iniciar sesión';
        setError(errorMessage);
        console.error('Error al iniciar sesión:', errorMessage);
      }
    } else {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        console.log('Registro exitoso:', response.data);
        setSuccessMessage('Registro exitoso. Redirigiendo al inicio de sesión...');
        setError('');

        // Espera 3 segundos y luego cambia a la vista de login
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        // Asegúrate de que error.response.data sea una cadena o manipúlalo adecuadamente
        const errorMessage = error.response && typeof error.response.data === 'string'
          ? error.response.data
          : 'Error al registrarse';
        setError(errorMessage);
        console.error('Error al registrarse:', errorMessage);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-panel">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
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
        </form>
        <button
          className="toggle-button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccessMessage('');
          }}
        >
          {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
