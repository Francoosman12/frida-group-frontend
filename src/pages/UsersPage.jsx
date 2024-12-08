// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Asegúrate de importar el contexto de autenticación
import { useNavigate } from 'react-router-dom';
import '../styles/UsersPage.css';

const UsersPage = () => {
  const { role } = useAuth(); // Obtén los datos del usuario desde el contexto
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelect, setRoleSelect] = useState('vendedor'); // Asigna un valor por defecto al rol
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]); // Estado para almacenar los usuarios
  const navigate = useNavigate();

  // Redirigir si el usuario no es admin
  useEffect(() => {
    if (role !== 'admin') {
      setMessage('No tienes permisos para acceder a esta página.');
      setTimeout(() => {
        navigate('/'); // Redirige al usuario si no es admin
      }, 2000);
    }
  }, [role, navigate]);

  // Obtener los usuarios registrados
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // O de otra fuente según tu autenticación
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`, // Asegúrate de pasar el token aquí
          },
        });
        setUsers(response.data);
      } catch (error) {
        setMessage('Error al obtener los usuarios');
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      password,
      role: roleSelect, // Asigna el rol desde el formulario
    };

    console.log("Role a enviar:", roleSelect); // Esto debería mostrar 'admin' o 'vendedor'

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData);
      setMessage('Usuario registrado con éxito');
      // Limpiar los campos después de un registro exitoso
      setName('');
      setEmail('');
      setPassword('');
      setRoleSelect('vendedor');
      // Volver a obtener los usuarios después de un registro exitoso
      const updatedResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
      setUsers(updatedResponse.data);
    } catch (error) {
      setMessage(error.response ? error.response.data.error : 'Algo salió mal');
    }
  };

  return (
    <div className="users-page-container">
      <h2 className="users-page-title">Registrar Nuevo Usuario</h2>
      {message && <p className="message">{message}</p>}
      {role === 'admin' && (
        <form onSubmit={handleSubmit} className="user-form">
          <div className="input-group">
            <label className="input-label">Nombre</label>
            <input
              className="input-field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Rol</label>
            <select
              className="input-field"
              value={roleSelect}
              onChange={(e) => setRoleSelect(e.target.value)}
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button className="submit-button" type="submit">Registrar</button>
        </form>
      )}

      {/* Tabla de usuarios */}
      {role === 'admin' && (
        <div className="users-table-container">
          <h2 className="users-table-title">Usuarios Registrados</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No hay usuarios registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
