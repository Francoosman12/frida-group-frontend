import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import '../styles/SalesRecordPage.css';

const SalesRecordPage = () => {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPerPage] = useState(20);

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

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(sales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'ventas.xlsx');
  };

  // Paginación
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(sales.length / salesPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          <button onClick={handleDownload} className='boton-descargar'>Descargar Excel</button>
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
          {currentSales.length > 0 ? (
            currentSales.map((sale, index) => (
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

      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => handlePageChange(currentPage - 1)}>«</button>
        )}
        {pageNumbers.slice(0, 10).map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
        {pageNumbers.length > 10 && currentPage < pageNumbers.length && (
          <button onClick={() => handlePageChange(currentPage + 1)}>»</button>
        )}
      </div>
    </div>
  );
};

export default SalesRecordPage;
