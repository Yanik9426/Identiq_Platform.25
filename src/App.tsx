// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';
// --- Import the new HomePage component ---
import HomePage from './pages/HomePage'; // <-- IMPORT ADDED

function App() {
  return (
    <div className="App flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* === Public Routes === */}
          {/* --- Update the route for the Home Page --- */}
          <Route path="/" element={<HomePage />} /> {/* <-- UPDATED ELEMENT */}

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />


          {/* === Protected Routes === */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Other routes will be added here later */}

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;