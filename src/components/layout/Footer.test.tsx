// src/components/layout/Footer.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides the .toBeInTheDocument() matcher

import Footer from './Footer';

// Test suite for the Footer component
describe('Footer Component', () => {

  // Individual test case
  test('renders copyright text correctly', () => {
    // 1. Arrange: Render the Footer component
    render(<Footer />);

    // 2. Act: Find the element containing the copyright text.
    const copyrightTextElement = screen.getByText(/Identiq Platform\. All rights reserved\./i);

    // 3. Assert: Check if the element exists in the document.
    expect(copyrightTextElement).toBeInTheDocument();
  });

  test('renders the current year dynamically', () => {
    // 1. Arrange
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString(); // Get current year as a string

    // 2. Act: Find element containing the current year
    const yearElement = screen.getByText(`© ${currentYear} Identiq Platform. All rights reserved.`, { exact: false });

    // 3. Assert
    expect(yearElement).toBeInTheDocument();
    expect(yearElement).toHaveTextContent(currentYear);
  });

});