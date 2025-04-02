// src/App.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import '@testing-library/jest-dom';
import App from './App';

test('renders home page placeholder on initial load', () => {
  // Wrap the App component with BrowserRouter for testing
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // Check for content that should be on the home page ('/')
  const homePlaceholder = screen.getByText(/Home Page Placeholder/i);
  expect(homePlaceholder).toBeInTheDocument();
});
