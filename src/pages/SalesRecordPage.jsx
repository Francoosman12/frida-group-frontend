// src/pages/SalesRecordPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SalesRecordPage.css'; // Asegúrate de importar el CSS

const SalesRecordPage = () => {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales/ids`);
        setSales(response.data);
      } catch (err) {
        setError('Error fetching sales data');
        console.error('Error fetching sales data:', err);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className="sales-record-page">
      <h1 className="page-title">Registro de Ventas</h1>
      {error && <p className="error-message">{error}</p>}
      <table className="sales-record-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>EAN</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.length > 0 ? (
            sales.map((sale, index) => (
              <tr key={index}>
                <td>{new Date(sale.date).toLocaleDateString()}</td>
                <td>{sale.ean}</td>
                <td>{sale.description}</td>
                <td>{sale.quantity}</td>
                <td>${sale.price.toFixed(2)}</td>
                <td>${(sale.price * sale.quantity).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay ventas registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesRecordPage;
