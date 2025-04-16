// src/App.tsx - Added route for profile setup

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
import UnauthorizedPage from './pages/UnauthorizedPage';
// --- Import the new CandidateProfileSetup page ---
import CandidateProfileSetup from './pages/CandidateProfileSetup'; // <-- IMPORT ADDED

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
          <Route path="/unauthorized" element={<UnauthorizedPage />} />


          {/* === Protected Routes === */}
          {/* Dashboard accessible only by 'candidate' role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* --- Add route for Candidate Profile Setup --- */}
          {/* This route is also protected and restricted to candidates */}
          <Route
            path="/profile-setup" // The URL for the setup flow
            element={
              <ProtectedRoute allowedRoles={['candidate']}> {/* Use ProtectedRoute */}
                <CandidateProfileSetup /> {/* Render the multi-step component */}
              </ProtectedRoute>
            }
          />

          {/* --- Examples for future routes --- */}
          {/* ... other potential protected routes ... */}

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;