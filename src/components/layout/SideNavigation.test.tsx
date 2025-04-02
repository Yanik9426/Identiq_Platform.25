// src/components/layout/SideNavigation.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides the .toBeInTheDocument() matcher

import SideNavigation from './SideNavigation';

// Test suite for the SideNavigation component
describe('SideNavigation Component', () => {

  // Individual test case
  test('renders navigation heading and placeholder text', () => {
    // 1. Arrange: Render the SideNavigation component
    render(<SideNavigation />);

    // 2. Act & Assert: Find key elements and check if they exist
    //    Check for the heading
    const headingElement = screen.getByRole('heading', { name: /navigation/i });
    expect(headingElement).toBeInTheDocument();

    //    Check for one of the placeholder list items (example)
    const linkPlaceholder = screen.getByText(/\(Placeholder Link 1\)/i);
    expect(linkPlaceholder).toBeInTheDocument();

    //    Check for the main placeholder text
    const placeholderTextElement = screen.getByText(/Side Navigation Placeholder/i);
    expect(placeholderTextElement).toBeInTheDocument();
  });

  // Add more tests later for actual navigation links, etc.
});