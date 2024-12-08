import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserMultiFormatReader } from '@zxing/library';
import '../styles/SalesPage.css';

const SalesPage = () => {
  const [ean, setEan] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [outOfStockError, setOutOfStockError] = useState('');
  const [cart, setCart] = useState([]);
  const [showQrReader, setShowQrReader] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  const fetchProduct = async (ean) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/search?ean=${ean}`);
      setProduct(response.data || null);
      setError(response.data ? '' : 'Producto no encontrado');
      setOutOfStockError('');
    } catch (err) {
      setError('Error al buscar producto');
    }
  };

  useEffect(() => {
    if (ean.length >= 8) {
      fetchProduct(ean);
    } else {
      setProduct(null);
      setError('');
    }
  }, [ean]);

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

      setCart((prevCart) => [...prevCart, cartItem]);

      setEan('');
      setQuantity(1);
      setProduct(null);
      setOutOfStockError('');
      setError('');
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

  const toggleQrReader = () => {
    setShowQrReader(!showQrReader);
    if (showQrReader) {
      stopQrScanner();
    }
  };

  const startQrScanner = async () => {
    try {
      if (!videoRef.current) {
        console.error('El elemento <video> no está disponible.');
        return;
      }

      codeReader.current = new BrowserMultiFormatReader();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, // Solicitar cámara trasera
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedEan = result.getText();
            console.log('Código escaneado:', scannedEan);
            setEan(scannedEan);
            fetchProduct(scannedEan);
            stopQrScanner();
          } else if (error && error.message !== 'No MultiFormat Readers were able to detect the code.') {
            console.warn('Error al escanear QR:', error.message || error);
          }
        }
      );
    } catch (err) {
      console.error('Error al iniciar la cámara:', err.message || err);
      setError('No se pudo acceder a la cámara. Verifique los permisos.');
    }
  };

  const stopQrScanner = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }

    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      const tracks = stream?.getTracks();
      tracks?.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleRemoveItemFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const handleIncreaseQuantity = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    setCart(updatedCart);
  };

  const handleDecreaseQuantity = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
    }
    setCart(updatedCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  };

  useEffect(() => {
    if (showQrReader) {
      startQrScanner();
    } else {
      stopQrScanner();
    }
  }, [showQrReader]);

  return (
    <div className="sales-page">
      <h1 className="page-title">Ventas</h1>

      <a className='asistencia' href="https://docs.google.com/forms/d/e/1FAIpQLSf59xrxxfsxmnoB47-5uJnnI6uzsT04V1t57Vb2G9czpJhwaA/viewform">Ingrese aquí su asistencia</a>

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
          <button onClick={toggleQrReader} className="qr-button">
            {showQrReader ? 'Cerrar Cámara' : 'Escanear QR'}
          </button>
          {showQrReader && (
            <div className="qr-reader-container">
              <video ref={videoRef} style={{ width: '100%' }} />
            </div>
          )}
          <label>Ingrese la cantidad:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="input-field"
            placeholder="Cantidad"
          />
          <button onClick={handleAddToCart} className="register-button">
            Agregar al carrito
          </button>
        </div>
        {product && (
          <div className="product-details col-xl-6">
            <h2>Detalles del Producto</h2>
            <div className="product-info">
              <img
                src={product.image}
                alt="Imagen del producto"
                className="image-product cover"
              />
              <p>
                <strong>Descripción:</strong> {product.description}
              </p>
              <p>
                <strong>Stock:</strong> {product.stock}
              </p>
              <p>
                <strong>Precio:</strong>{' '}
                <span className="price-highlight">
                  ${product.price.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
      {outOfStockError && <p className="error-message">{outOfStockError}</p>}

      <div className="cart-list mt-4">
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
                  <button onClick={() => handleDecreaseQuantity(index)}>-</button>
                  {item.quantity}
                  <button onClick={() => handleIncreaseQuantity(index)}>+</button>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => handleRemoveItemFromCart(index)}
                    className="remove-button"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3">
                <strong>Total</strong>
              </td>
              <td>
                <strong>${getTotalPrice()}</strong>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <button onClick={handleRegisterSale} className="register-sale-button mt-4">
          Registrar Venta
        </button>
      </div>
    </div>
  );
};

export default SalesPage;
