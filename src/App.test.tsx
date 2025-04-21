// src/App.test.tsx

import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Mock useAuth hook
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    loading: false,
    userRoles: null,
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn()
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

test('renders home page placeholder on initial load', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  // Make sure this text actually exists in your Home component
  const homePlaceholder = screen.getByText(/Welcome to Identiq/i);
  expect(homePlaceholder).toBeInTheDocument();
});

// Add any other tests for App, wrapping <App /> in <BrowserRouter><AuthProvider>...</AuthProvider></BrowserRouter>
// as needed.