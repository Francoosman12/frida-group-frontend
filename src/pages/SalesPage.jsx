import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSales } from '../context/SalesContext';
import '../styles/SalesPage.css';

const SalesPage = () => {
  const { addSale } = useSales();
  const [ean, setEan] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [outOfStockError, setOutOfStockError] = useState('');
  const [cart, setCart] = useState([]);
  const [debouncedEan, setDebouncedEan] = useState(ean);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEan(ean);
    }, 300);

    return () => clearTimeout(timer);
  }, [ean]);

  useEffect(() => {
    if (debouncedEan.length >= 8) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/search?ean=${debouncedEan}`);
          setProduct(response.data || null);
          setError(response.data ? '' : 'Producto no encontrado');
          setOutOfStockError('');
        } catch (err) {
          setError('Error al buscar producto');
        }
      };
      fetchProduct();
    } else {
      setProduct(null);
      setError('');
    }
  }, [debouncedEan]);

  const handleAddToCart = () => {
    if (product) {
      if (product.stock < quantity) {
        setOutOfStockError('Producto sin stock suficiente');
        return;
      }

      const cartItem = {
        ...product,
        quantity,
      };

      setCart([...cart, cartItem]);
      setProduct(null);
      setEan('');
      setQuantity(1);
      setOutOfStockError('');
    }
  };

  const handleRegisterSale = async () => {
    if (cart.length > 0) {
      try {
        const saleRequests = cart.map((item) => {
          return axios.post(`${import.meta.env.VITE_API_URL}/api/sales`, {
            ean: item.ean,
            quantity: item.quantity,
            price: item.price,
          });
        });

        await Promise.all(saleRequests);

        // Añadir ventas al contexto (si es necesario)
        cart.forEach((item) => {
          addSale({
            ...item,
            date: new Date().toISOString(),
          });
        });

        setCart([]);
        setProduct(null);
        setEan('');
        setQuantity(1);
        setOutOfStockError('');
        setError('');
      } catch (err) {
        console.error('Error al registrar la venta:', err.response?.data || err.message);
        setError('Error al registrar la venta');
      }
    }
  };

  const handleQuantityChange = (index, increment) => {
    const updatedCart = cart.map((item, i) => {
      if (i === index) {
        const newQuantity = item.quantity + increment;
        if (newQuantity > 0 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    });
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {  // Asume que el lector de código de barras envía un "Enter" después del código
      e.preventDefault();
      const scannedEAN = barcodeInputRef.current.value.trim();
      if (scannedEAN) {
        setEan(scannedEAN);
        barcodeInputRef.current.value = ''; // Limpiar el campo después de procesar
      }
    }
  };

  useEffect(() => {
    // Agrega un listener para el evento de teclado cuando el componente se monta
    const handleKeyDown = (e) => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.value += e.key;
        if (e.key === 'Enter') {
          handleBarcodeScan(e);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="sales-page">
      <h1 className="page-title">Ventas</h1>
      <div className="search-container col-xl-12 d-sm-flex justify-content-center">
        <div className="form-container col-xl-6">
          <label>Ingrese el código EAN:</label>
          <input
            type="text"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            placeholder="Ingrese el código EAN"
            className="input-field"
          />
          <label>Ingrese la cantidad:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="input-field"
            placeholder="Cantidad"
          />
          <button onClick={handleAddToCart} className="register-button">Agregar al carrito</button>
        </div>
        {product && (
          <div className="product-details col-xl-6">
            <h2>Detalles del Producto</h2>
            <div className="product-info">
              <p><strong>Descripción:</strong> {product.description}</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>Precio:</strong> <span className="price-highlight">${product.price.toFixed(2)}</span></p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      {outOfStockError && <p className="error-message">{outOfStockError}</p>}
      <div className="cart-list">
        <h2>Carrito de Ventas</h2>
        <table className="cart-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>
                  <button onClick={() => handleQuantityChange(index, -1)} className="quantity-button">-</button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(index, 1)} className="quantity-button">+</button>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleRemoveFromCart(index)} className="remove-button">🗑️</button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3"><strong>Total</strong></td>
              <td><strong>${totalAmount.toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <button onClick={handleRegisterSale} className="register-button">Registrar venta</button>
      </div>
      <input
        type="text"
        ref={barcodeInputRef}
        style={{ position: 'absolute', top: '-100px', left: '-100px' }} // Ocultar el input
      />
    </div>
  );
};

export default SalesPage;
