// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      const userName = localStorage.getItem('username');
      if (token) {
        setIsAuthenticated(true);
        setRole(userRole);
        setUsername(userName || '');
      } else {
        setIsAuthenticated(false);
      }
    }, []);

    const login = (token, userRole, userName) => {
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('username', userName);
      setIsAuthenticated(true);
      setRole(userRole);
      setUsername(userName);
      navigate('/sales');
    };

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      setRole(null);
      setUsername('');
      navigate('/');
    };

    return (
      <AuthContext.Provider value={{ isAuthenticated, role, username, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
