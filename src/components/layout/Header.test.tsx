// src/components/layout/Header.test.tsx

import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides the .toBeInTheDocument() matcher
import { MemoryRouter } from 'react-router-dom'; // Add this import

import Header from './Header';
import { useAuth, AuthProvider } from '../../contexts/AuthContext'; // Import the exported parts

// Create a mock for the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    loading: false,
    userRoles: null,
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn()
  }),
  // Export the real AuthProvider component
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

// Test suite for the Header component
describe('Header Component', () => {

  // Individual test case
  test('renders header placeholder text correctly', () => {
    // Wrap with BOTH MemoryRouter AND AuthProvider
    render(
      <MemoryRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    // 2. Act: Find the element containing the placeholder text.
    const placeholderTextElement = screen.getByText(/Identiq/i);

    // 3. Assert: Check if the element found actually exists in the document.
    expect(placeholderTextElement).toBeInTheDocument();
  });

  // You can add more test cases here later as the Header becomes more complex
});