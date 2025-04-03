// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
// --- Import the new components ---
import DashboardPage from './pages/DashboardPage';   // <-- IMPORT DashboardPage
import ProtectedRoute from './routes/ProtectedRoute'; // <-- IMPORT ProtectedRoute

function App() {
  return (
    <div className="App flex flex-col min-h-screen bg-gray-100"> {/* Optional: Added light gray background */}
      <Header />

      {/* Apply flex-grow to allow this main section to expand */}
      {/* Added container, automatic horizontal margins, horizontal and vertical padding */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* === Public Routes === */}
          {/* Everyone can access these */}
          <Route path="/" element={<div>Home Page Placeholder</div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />


          {/* === Protected Routes === */}
          {/* Only logged-in users can access routes wrapped in ProtectedRoute */}
          <Route
            path="/dashboard" // The URL path for the dashboard
            element={
              // Wrap the component you want to protect (DashboardPage)
              // with the ProtectedRoute component
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* You can add more protected routes here using the same pattern */}
          {/* Example:
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          */}

        </Routes>
      </main>

      <Footer /> {/* <-- Existing Footer component */}
    </div>
  );
}

export default App;