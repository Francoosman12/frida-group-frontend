import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SalesRecordPage.css';

const SalesRecordPage = () => {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales`, {
          params: {
            startDate,
            endDate,
          },
        });
        const salesData = response.data;
        setSales(salesData);

        const total = salesData.reduce((acc, sale) => acc + (sale.price * sale.quantity), 0);
        setTotalAmount(total);

      } catch (err) {
        setError('Error fetching sales data');
        console.error('Error fetching sales data:', err);
      }
    };

    fetchSales();
  }, [startDate, endDate]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // Lógica para manejar el envío del filtro si se necesita
  };

  return (
    <div className="sales-record-page">
      <h1 className="page-title">Registro de Ventas</h1>

      <div className="filter-container">
        <div>
          <label>Fecha de Inicio:</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>
        <div>
          <label>Fecha de Fin:</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>
        <div>
          <button onClick={handleFilterSubmit} className='boton-filtrar'>Filtrar</button>
        </div>
      </div>

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
                <td>{sale.product ? sale.product.description : 'N/A'}</td>
                <td>{sale.quantity || 0}</td>
                <td>${(sale.price ? sale.price.toFixed(2) : '0.00')}</td>
                <td>${(sale.price && sale.quantity ? (sale.price * sale.quantity).toFixed(2) : '0.00')}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay ventas registradas.</td>
            </tr>
          )}
          {sales.length > 0 && (
            <tr>
              <td colSpan="5"><strong>Total</strong></td>
              <td><strong>${totalAmount.toFixed(2)}</strong></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesRecordPage;
