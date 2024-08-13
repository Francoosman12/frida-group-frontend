import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import SalesPage from './pages/SalesPage';
import SalesRecordPage from './pages/SalesRecordPage'; // Importa la nueva página
import { SalesProvider } from './context/SalesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css'; // Importa el archivo CSS global si es necesario

function App() {
  return (
    <SalesProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<SalesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/sales-record" element={<SalesRecordPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </SalesProvider>
  );
}

export default App;
