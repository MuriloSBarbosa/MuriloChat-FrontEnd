import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Salas from './pages/Salas';
import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/salas" element={<Salas />} />
          <Route path="/cadastrar" element={<Cadastro />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
