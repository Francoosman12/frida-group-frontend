import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [ean, setEan] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
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
      const formData = new FormData();
      if (editProductId && ean) {
        formData.append('ean', ean); // Solo incluir el EAN en modo de edición
      }
      formData.append('description', description);
      formData.append('price', parseFloat(price));
      formData.append('stock', parseInt(stock, 10));
      if (image) formData.append('image', image);
  
      if (editProductId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setEditProductId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
  
      setEan('');
      setDescription('');
      setPrice('');
      setStock('');
      setImage(null);
      setError('');
      fetchProducts();
    } catch (err) {
      console.error('Error handling product:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error handling product');
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Error deleting product');
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = (e) => {
    if (e.target.classList.contains('modal')) {
      setSelectedImage(null);
    }
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Administración</h1>
      <h2 className="form-title">{editProductId ? 'Editar Producto' : 'Crear un nuevo Producto'}</h2>
      <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="ean">EAN:</label>
          <input
            id="ean"
            type="text"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descripción:</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Precio:</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="stock">Stock:</label>
          <input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min="0"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Imagen:</label>
          <input
            id="image"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
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
            <th>Imagen</th>
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
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.description}
                    className="thumbnail"
                    onClick={() => handleImageClick(product.image)}
                  />
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(product)} className="edit-button">Editar</button>
                <button onClick={() => handleDelete(product._id)} className="delete-button">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedImage && (
        <div className="modal" onClick={closeModal}>
          <img
            src={selectedImage}
            alt="Ampliado"
            className="modal-image"
            onClick={(e) => e.stopPropagation()} // Previene cierre al hacer clic en la imagen
          />
        </div>
      )}
    </div>
  );
};

export default AdminPage;
