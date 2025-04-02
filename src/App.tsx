import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>Home Page Placeholder</div>} />
        <Route path="/login" element={<div>Login Page Placeholder</div>} />
      </Routes>
    </div>
  );
}

export default App;
