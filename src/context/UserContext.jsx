// src/context/UserContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const UserContext = createContext();

// Crear el proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Aquí podrías obtener la información del usuario desde un API o del almacenamiento local (localStorage)
    const loggedInUser = JSON.parse(localStorage.getItem('user')); // Suponiendo que el usuario se guarda en localStorage
    setUser(loggedInUser);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
