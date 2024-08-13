import React, { useState } from 'react';
import axios from 'axios';
import { useSales } from '../context/SalesContext';
import '../styles/SalesPage.css';

const SalesPage = () => {
  const { addSale, sales } = useSales();
  const [ean, setEan] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    const eanCode = e.target.value;
    setEan(eanCode);

    if (eanCode.length >= 8) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/products/search?ean=${eanCode}`);
        if (response.data) {
          setProduct(response.data);
          setError('');
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
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/sales`, {
          ean: product.ean,
          quantity: quantity,
        });

        addSale({
          ...product,
          quantity: quantity,
          date: new Date().toISOString(),
        });
        setProduct(null);
        setEan('');
        setQuantity(1);
      } catch (err) {
        console.error('Error registering sale:', err);
        setError('Error registering sale');
      }
    }
  };

  const totalAmount = sales.reduce((acc, sale) => acc + (sale.price * sale.quantity), 0);

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
          placeholder="Enter quantity"
        />
        <button onClick={handleRegisterSale} className="register-button">Registrar la venta</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {product && (
        <div className="product-details">
          <h2>Product Details</h2>
          <p><strong>Descripción:</strong> {product.description}</p>
          <p><strong>Precio:</strong> ${product.price.toFixed(2)}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
        </div>
      )}
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
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr key={index}>
                <td>{new Date(sale.date).toLocaleDateString()}</td>
                <td>{sale.ean}</td>
                <td>{sale.description}</td>
                <td>{sale.quantity}</td>
                <td>${sale.price.toFixed(2)}</td>
                <td>${(sale.price * sale.quantity).toFixed(2)}</td>
                <td>
                  {sales.find(s => s.ean === sale.ean)?.stock - sale.quantity}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="6"><strong>Total</strong></td>
              <td><strong>${totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesPage;
