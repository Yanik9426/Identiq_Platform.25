// src/App.tsx - Updated for Role-Based Routes

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/HomePage';
// --- Import the Unauthorized page ---
import UnauthorizedPage from './pages/UnauthorizedPage'; // <-- IMPORT ADDED

function App() {
  return (
    <div className="App flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* === Public Routes === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* --- Add route for the Unauthorized page --- */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} /> {/* <-- ROUTE ADDED */}


          {/* === Protected Routes === */}
          {/* Example: Dashboard accessible ONLY by users with the 'candidate' role */}
          <Route
            path="/dashboard"
            element={
              // --- Pass allowedRoles prop to ProtectedRoute ---
              // Only users whose userRoles array includes 'candidate' can access this.
              <ProtectedRoute allowedRoles={['candidate']}> {/* <-- PROP ADDED */}
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* --- Example for future routes --- */}
          {/* A route only accessible by company admins */}
          {/* <Route
            path="/company/settings"
            element={
              <ProtectedRoute allowedRoles={['company_admin']}>
                <CompanySettingsPage />
              </ProtectedRoute>
            }
          /> */}

          {/* A route accessible by ANY logged-in user (no roles specified) */}
          {/* <Route
            path="/my-profile" // Example path
            element={
              <ProtectedRoute> // No allowedRoles means only login is checked
                <UserProfileEditPage />
              </ProtectedRoute>
            }
          /> */}

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;