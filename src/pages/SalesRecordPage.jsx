import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { UserContext } from '../context/UserContext'; // Asumiendo que tienes un contexto para el usuario
import '../styles/SalesRecordPage.css';

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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/sales`);
        const salesData = response.data;

        // Validar si los datos tienen la estructura esperada
        setSales(salesData);

        const total = salesData.reduce((acc, sale) => {
          const price = sale.price || 0;
          const quantity = sale.quantity || 0;
          return acc + price * quantity;
        }, 0);

        setTotalAmount(total);

      } catch (err) {
        setError('Error fetching sales data');
        console.error('Error fetching sales data:', err);
      }
    };

    fetchSales();
  }, []);

  const handleFilterSubmit = () => {
    if (!startDate || !endDate) {
      setError('Por favor selecciona un rango de fechas válido.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('La fecha de inicio no puede ser mayor a la fecha de fin.');
      return;
    }

    setError('');

    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });

    setSales(filteredSales);
  };

  const groupedSales = sales.reduce((acc, sale) => {
    const key = `${sale.date}-${sale.ean}-${sale.paymentMethod}`;
    if (!acc[key]) {
      acc[key] = { ...sale, quantity: 0, total: 0 };
    }
    acc[key].quantity += sale.quantity;
    acc[key].total += sale.price * sale.quantity;
    return acc;
  }, {});

  const groupedSalesArray = Object.values(groupedSales);

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
      Vendedor: sale.seller || 'N/A',
      MétodoPago: sale.paymentMethod || 'N/A',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, 'ventas.xlsx');
  };

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(sales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'ventas.xlsx');
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
          <button onClick={handleFilterSubmit} className="boton-filtrar">Filtrar</button>
          <button onClick={handleDownload} className="boton-descargar">Descargar Excel</button>
        </div>
        <div>
          <button onClick={exportToExcel} className="boton-exportar">Descargar como Excel</button>
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
            <th>Método de Pago</th>
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
                <td>{sale.paymentMethod || 'N/A'}</td>
                <td>${sale.price.toFixed(2)}</td>
                <td>${sale.total.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No hay ventas registradas.</td>
            </tr>
          )}
          {currentItems.length > 0 && (
            <tr>
              <td colSpan="7"><strong>Total</strong></td>
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
