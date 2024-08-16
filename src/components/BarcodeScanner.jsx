import React, { useEffect } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected }) => {
  useEffect(() => {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: document.querySelector('#scanner-container'),
        constraints: {
          facingMode: 'environment' // Usa la cámara trasera
        }
      },
      decoder: {
        readers: ['ean_reader'] // Decodificador para códigos EAN
      }
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((data) => {
      onDetected(data.codeResult.code);
    });

    return () => {
      Quagga.stop();
    };
  }, [onDetected]);

  return (
    <div id="scanner-container" style={{ width: '100%', height: '300px' }}></div>
  );
};

export default BarcodeScanner;
