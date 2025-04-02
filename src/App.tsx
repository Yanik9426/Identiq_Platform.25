// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer'; // <-- Added Footer import
import './App.css'; // Make sure this imports necessary base styles or Tailwind entry point if needed

function App() {
  return (
    // Apply flex column layout and minimum screen height for sticky footer effect
    <div className="App flex flex-col min-h-screen bg-gray-100"> {/* Optional: Added light gray background */}
      <Header />

      {/* Apply flex-grow to allow this main section to expand */}
      {/* Added container, automatic horizontal margins, horizontal and vertical padding */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<div>Home Page Placeholder</div>} />
          <Route path="/login" element={<div>Login Page Placeholder</div>} />
          {/* Other routes will be added here later */}
        </Routes>
      </main>

      <Footer /> {/* <-- Added Footer component here */}
    </div>
  );
}

export default App;