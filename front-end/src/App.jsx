import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Salas from './pages/Salas';
import Cadastro from './pages/Cadastro';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/salas" element={<Salas />} />
          <Route path="/cadastrar" element={<Cadastro />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
