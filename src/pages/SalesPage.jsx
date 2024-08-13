import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSales } from '../context/SalesContext';
import '../styles/SalesPage.css';

const SalesPage = () => {
  const { addSale, sales } = useSales();
  const [ean, setEan] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPerPage] = useState(20); // Number of rows per page
  const [filteredSales, setFilteredSales] = useState([]);
  const [outOfStockError, setOutOfStockError] = useState('');

  useEffect(() => {
    setFilteredSales(sales);
  }, [sales]);

  const handleChange = async (e) => {
    const eanCode = e.target.value;
    setEan(eanCode);

    if (eanCode.length >= 8) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/search?ean=${eanCode}`);
        if (response.data) {
          setProduct(response.data);
          setError('');
          setOutOfStockError('');
        } else {
          setProduct(null);
          setError('Product not found');
        }
      } catch (err) {
        setError('Error fetching product');
      }
    } else {
      setProduct(null);
      setError('');
    }
  };

  const handleRegisterSale = async () => {
    if (product) {
      if (product.stock < quantity) {
        setOutOfStockError('Product out of stock');
        return;
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/sales`, {
          ean: product.ean,
          quantity: quantity,
        });

        if (response.data) {
          addSale({
            ...product,
            quantity: quantity,
            date: new Date().toISOString(),
          });
          setProduct(null);
          setEan('');
          setQuantity(1);
          setOutOfStockError('');
        }
      } catch (err) {
        console.error('Error registering sale:', err);
        setError('Error registering sale');
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDateFilter = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setFilteredSales(sales);
      setCurrentPage(1);
      return;
    }

    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });

    setFilteredSales(filtered);
    setCurrentPage(1); // Reset to first page
  };

  const totalAmount = filteredSales.reduce((acc, sale) => acc + (sale.price * sale.quantity), 0);

  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);

  return (
    <div className="sales-page">
      <h1 className="page-title">Ventas</h1>
      <div className="search-container">
        <input
          type="text"
          value={ean}
          onChange={handleChange}
          placeholder="Ingrese el código EAN"
          className="input-field"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          className="input-field"
          placeholder="Cantidad"
        />
        <button onClick={handleRegisterSale} className="register-button">Registrar la venta</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {outOfStockError && <p className="error-message">{outOfStockError}</p>}
      {product && (
        <div className="product-details">
          <h2>Detalles del Producto</h2>
          <p><strong>Descripción:</strong> {product.description}</p>
          <p><strong>Precio:</strong> ${product.price.toFixed(2)}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
        </div>
      )}
      <div className="date-filter">
        <label>
          Fecha Inicio:
          <input
            type="date"
            name="startDate"
            onChange={(e) => handleDateFilter(e.target.value, document.querySelector('input[name="endDate"]').value)}
          />
        </label>
        <label>
          Fecha Fin:
          <input
            type="date"
            name="endDate"
            onChange={(e) => handleDateFilter(document.querySelector('input[name="startDate"]').value, e.target.value)}
          />
        </label>
      </div>
      <div className="sales-list">
        <h2>Registro de Ventas</h2>
        <table className="sales-table">
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
            {currentSales.map((sale, index) => (
              <tr key={index}>
                <td>{new Date(sale.date).toLocaleDateString()}</td>
                <td>{sale.ean}</td>
                <td>{sale.description}</td>
                <td>{sale.quantity}</td>
                <td>${sale.price.toFixed(2)}</td>
                <td>${(sale.price * sale.quantity).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="5"><strong>Total</strong></td>
              <td><strong>${totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
        <div className="pagination">
          {Array.from({ length: Math.ceil(filteredSales.length / salesPerPage) }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
