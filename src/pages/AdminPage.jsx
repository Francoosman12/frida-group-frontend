import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Quagga from 'quagga';
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
  const scannerRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      console.log('Fetched Products:', response.data); // Verifica la estructura de los datos obtenidos
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
    setShowScanner(true);
    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment'
          }
        },
        decoder: {
          readers: ['ean_reader']
        }
      },
      (err) => {
        if (err) {
          console.error('Error initializing Quagga:', err);
          setError('Error initializing Quagga');
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((result) => {
      setEan(result.codeResult.code);
      Quagga.stop();
      setShowScanner(false);
    });
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
            onClick={handleScan}
            className="scan-button"
          >
            {showScanner ? 'Cerrando escáner...' : 'Escanear EAN'}
          </button>
        </div>
        {showScanner && <div ref={scannerRef} className="scanner"></div>}
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
          {products.map((product) => {
            console.log('Product:', product); // Verifica la estructura de cada producto
            return (
              <tr key={product._id}>
                <td>{product.ean}</td>
                <td>{product.description}</td> {/* Asegúrate de que 'description' esté presente */}
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <button onClick={() => handleEdit(product)} className="edit-button">Editar</button>
                  <button onClick={() => handleDelete(product._id)} className="delete-button">Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
