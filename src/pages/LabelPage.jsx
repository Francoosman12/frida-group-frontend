import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, Text, View, Image, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import '../styles/LabelPage.css';  // Importando los estilos

const LabelPage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/products-for-labels`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error fetching products');
      }
    };

    fetchProducts();
  }, []);

  // Estilos para las etiquetas en PDF
  const styles = StyleSheet.create({
    page: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 20,
    },
    label: {
      width: '45%',
      margin: '2.5%',
      padding: 10,
      border: '1px solid #000',
      marginBottom: 10,
    },
    text: {
      fontSize: 12,
      marginBottom: 5,
    },
    qrCode: {
      width: 100,
      height: 100,
      border: '1px solid #000',
      marginTop: 10,
    },
    productImage: {
      width: '100%',
      height: 'auto',
      marginTop: 10,
    },
  });

  // Componente para crear las etiquetas en el PDF
  const LabelDocument = ({ products }) => (
    <Document>
      <Page style={styles.page}>
        {products.map((product) => (
          <View key={product.ean} style={styles.label}>
            {/* Mostramos la imagen del producto en el PDF */}
            {product.imageUrl && <Image src={product.imageUrl} style={styles.productImage} />}
            <Text style={styles.text}>EAN: {product.ean}</Text>
            <Text style={styles.text}>Descripción: {product.description}</Text>
            <Text style={styles.text}>Precio: ${product.price.toFixed(2)}</Text>
            <Text style={styles.text}>Código QR:</Text>
            {product.qrCodeUrl && (
              <Image src={product.qrCodeUrl} style={styles.qrCode} />
            )}
          </View>
        ))}
      </Page>
    </Document>
  );

  // Función para imprimir una etiqueta específica
  const handlePrint = (ean) => {
    const printContent = document.getElementById(`label-${ean}`);
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Imprimir Etiqueta</title>');
    
    // Agregar estilo para la impresión
    printWindow.document.write(`
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .label {
          border: 2px solid #000;
          padding: 20px;
          width: 300px;
          margin: 0 auto;
          text-align: center;
          background-color: #f9f9f9;
        }
        .label img {
          max-width: 100%;
          height: auto;
          margin-top: 10px;
        }
        .label .text {
          font-size: 14px;
          margin-bottom: 10px;
          color: #333;
        }
        .label .title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #4CAF50;
        }
        .qr-code {
          margin-top: 10px;
          border: 1px solid #000;
          padding: 10px;
          width: 120px;
          height: 120px;
          margin-bottom: 15px;
        }

        @media print {
    button {
      display: none; /* Ocultar el botón de impresión cuando se imprime */
    }
    }
      </style>
    `);
    
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    
    // Asegurarse de que las imágenes se carguen antes de imprimir
    const images = printWindow.document.getElementsByTagName('img');
  
    const imageLoadPromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    });
  
    Promise.all(imageLoadPromises).then(() => {
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    });
  };
  
  return (
    <div className="label-page">
      <h1>Etiquetas de Productos</h1>
      {error && <p>{error}</p>}

      {/* Vista previa de las etiquetas */}
      <div className="label-preview">
        {products.map((product) => (
          <div key={product.ean} id={`label-${product.ean}`} className="label">
            {/* Mostramos la imagen del producto en la vista previa */}
            {product.imageUrl && <div className="product-image"><img src={product.imageUrl} alt={`Producto ${product.ean}`} /></div>}
            <p><strong>EAN:</strong> {product.ean}</p>
            <p><strong>Descripción:</strong> {product.description}</p>
            <p><strong>Precio:</strong> ${product.price.toFixed(2)}</p>
            <div className="qr-code">
              {product.qrCodeUrl && <img src={product.qrCodeUrl} alt={`QR code for ${product.ean}`} />}
            </div>
            <button className="button" onClick={() => handlePrint(product.ean)}>
              Imprimir Etiqueta
            </button>
          </div>
        ))}
      </div>

      {/* PDF Download Link */}
      <PDFDownloadLink
        document={<LabelDocument products={products} />}
        fileName="etiquetas_productos.pdf"
      >
        {({ loading }) => (loading ? 'Cargando PDF...' : 'Descargar Etiquetas PDF')}
      </PDFDownloadLink>
    </div>
  );
};

export default LabelPage;
