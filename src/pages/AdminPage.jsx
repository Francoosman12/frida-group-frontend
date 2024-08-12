import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminPage.css'; // Importa el archivo CSS

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [ean, setEan] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editProductId, setEditProductId] = useState(null);
  const [error, setError] = useState('');

  // Fetch all products from the backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products');
    }
  };

  // Call fetchProducts when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle adding or updating a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProductId) {
        // Update existing product
        await axios.put(`http://localhost:5000/products/${editProductId}`, {
          ean,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
        });
        setEditProductId(null);
      } else {
        // Add new product
        await axios.post('http://localhost:5000/products', {
          ean,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
        });
      }

      // Clear the form and refresh products
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

  // Handle editing a product
  const handleEdit = (product) => {
    setEan(product.ean);
    setDescription(product.description);
    setPrice(product.price);
    setStock(product.stock);
    setEditProductId(product._id);
  };

  // Handle deleting a product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Error deleting product');
    }
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
        </div>
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

      <h2 className="table-title">All Products</h2>
      <table className="products-table">
        <thead>
          <tr>
            <th>EAN</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Actions</th>
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
                <button onClick={() => handleEdit(product)} className="action-button">Editar</button>
                <button onClick={() => handleDelete(product._id)} className="action-button">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
