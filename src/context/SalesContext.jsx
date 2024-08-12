import React, { createContext, useState, useContext } from 'react';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);

  const addSale = (product) => {
    setSales((prevSales) => [...prevSales, product]);
  };

  return (
    <SalesContext.Provider value={{ sales, addSale }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => useContext(SalesContext);
