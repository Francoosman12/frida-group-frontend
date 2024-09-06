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
  const scanTimeoutRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
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
        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editProductId}`, {
          ean,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
        });
        setEditProductId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, {
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
            facingMode: 'environment',
            width: window.innerWidth,  // Ajusta la resolución del video
            height: window.innerHeight, // Ajusta la resolución del video
            aspectRatio: { min: 1, max: 100 }
          },
          singleChannel: false // Habilita color para mejorar la detección
        },
        decoder: {
          readers: ['ean_reader'],
          multiple: false // Escanea solo un código a la vez
        },
        locate: true, // Permite localizar códigos en el cuadro
        locator: {
          halfSample: true,
          patchSize: 'medium' // Ajusta el tamaño de los parches de imagen
        }
      },
      (err) => {
        if (err) {
          console.error('Error initializing Quagga:', err);
          setError('Error initializing Quagga');
          return;
        }
        Quagga.start();

        // Configura un tiempo límite para detener el escaneo después de 10 segundos
        scanTimeoutRef.current = setTimeout(() => {
          Quagga.stop();
          setShowScanner(false);
          console.warn('Escaneo detenido por tiempo límite.');
        }, 10000); // 10 segundos
      }
    );

    Quagga.onDetected((result) => {
      if (result.codeResult && result.codeResult.code) {
        setEan(result.codeResult.code);
        Quagga.stop();
        setShowScanner(false);

        // Cancela el timeout si el escaneo fue exitoso antes del tiempo límite
        clearTimeout(scanTimeoutRef.current);
      }
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
            {showScanner ? 'Abrir escáner...' : 'Escanear EAN'}
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
            console.log('Product:', product);
            return (
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
