// src/components/layout/Header.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides the .toBeInTheDocument() matcher

import Header from './Header';

// Test suite for the Header component
describe('Header Component', () => {

  // Individual test case
  test('renders header placeholder text correctly', () => {
    // 1. Arrange: Render the Header component into a virtual DOM
    render(<Header />);

    // 2. Act: Find the element containing the placeholder text.
    //    We use a regular expression with 'i' to make it case-insensitive.
    //    getByText will throw an error if the text is not found.
    const placeholderTextElement = screen.getByText(/Identiq Header Placeholder/i);

    // 3. Assert: Check if the element found actually exists in the document.
    expect(placeholderTextElement).toBeInTheDocument();
  });

  // You can add more test cases here later as the Header becomes more complex
});