import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SalesRecordPage.css';
import * as XLSX from 'xlsx';

const SalesRecordPage = () => {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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
  };

  // Agrupando ventas por fecha y EAN
  const groupedSales = sales.reduce((acc, sale) => {
    const key = `${sale.date}-${sale.ean}`;
    if (!acc[key]) {
      acc[key] = { ...sale, quantity: 0, total: 0 };
    }
    acc[key].quantity += sale.quantity;
    acc[key].total += sale.price * sale.quantity;
    return acc;
  }, {});

  const groupedSalesArray = Object.values(groupedSales);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupedSalesArray.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(groupedSalesArray.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(groupedSalesArray.map(sale => ({
      Fecha: new Date(sale.date).toLocaleDateString(),
      EAN: sale.ean,
      Descripción: sale.product ? sale.product.description : 'N/A',
      Cantidad: sale.quantity,
      Precio: sale.price.toFixed(2),
      Total: sale.total.toFixed(2),
      Vendedor: sale.seller || 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, 'ventas.xlsx');
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
        <div>
          <button onClick={exportToExcel} className='boton-exportar'>Descargar como Excel</button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <table className="sales-record-table">
        <thead>
          <tr>
            <th>Vendedor</th>
            <th>Fecha</th>
            <th>EAN</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((sale, index) => (
              <tr key={index}>
                <td>{sale.seller || 'N/A'}</td>
                <td>{new Date(sale.date).toLocaleDateString()}</td>
                <td>{sale.ean}</td>
                <td>{sale.product ? sale.product.description : 'N/A'}</td>
                <td>{sale.quantity}</td>
                <td>${sale.price.toFixed(2)}</td>
                <td>${sale.total.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No hay ventas registradas.</td>
            </tr>
          )}
          {currentItems.length > 0 && (
            <tr>
              <td colSpan="6"><strong>Total</strong></td>
              <td><strong>${totalAmount.toFixed(2)}</strong></td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SalesRecordPage;
