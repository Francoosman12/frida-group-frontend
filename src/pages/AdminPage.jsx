// src/components/AdminPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import Webcam from 'react-webcam';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [ean, setEan] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editProductId, setEditProductId] = useState(null);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const webcamRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProductId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${editProductId}`, {
          ean,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
        });
        setEditProductId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, {
          ean,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
        });
      }

      setEan('');
      setDescription('');
      setPrice('');
      setStock('');
      setError('');
      fetchProducts();
    } catch (err) {
      console.error('Error handling product:', err);
      setError('Error handling product');
    }
  };

  const handleEdit = (product) => {
    setEan(product.ean);
    setDescription(product.description);
    setPrice(product.price);
    setStock(product.stock);
    setEditProductId(product._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Error deleting product');
    }
  };

  const handleScan = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    JsBarcode(imageSrc, {
      // Options for barcode generation
      format: "EAN13",
      displayValue: true,
      width: 2,
      height: 60,
    });
    // Assuming `JsBarcode` is correctly generating the barcode from the image
    // and you have a function to read the barcode data.
    // You need to implement the barcode reading from the image.
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Administración</h1>

      <h2 className="form-title">{editProductId ? 'Editar Producto' : 'Crear un nuevo Producto'}</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>EAN:</label>
          <input
            type="text"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            required
            className="form-input"
          />
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className="scan-button"
          >
            {showScanner ? 'Cerrar Escáner' : 'Escanear EAN'}
          </button>
        </div>
        {showScanner && (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
            />
            <button type="button" onClick={handleScan} className="scan-button">
              Escanear
            </button>
          </div>
        )}
        <div className="form-group">
          <label>Descripción:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Precio:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min="0"
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">
          {editProductId ? 'Actualizar Producto' : 'Agregar Producto'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}

      <h2 className="table-title">Todos los Productos</h2>
      <table className="products-table">
        <thead>
          <tr>
            <th>EAN</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.ean}</td>
              <td>{product.description}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => handleEdit(product)} className="edit-button">Editar</button>
                <button onClick={() => handleDelete(product._id)} className="delete-button">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
