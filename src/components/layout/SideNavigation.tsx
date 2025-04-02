// src/components/layout/SideNavigation.tsx

import React from 'react';

const SideNavigation = () => {
  return (
    // Using <aside> tag, could also be <nav>
    // Basic styling for width, background, padding
    <aside className="w-64 h-full bg-gray-700 text-white p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <ul>
        <li className="mb-2">(Placeholder Link 1)</li>
        <li className="mb-2">(Placeholder Link 2)</li>
        <li className="mb-2">(Placeholder Link 3)</li>
      </ul>
      <p className="mt-4 text-sm">Side Navigation Placeholder</p>
    </aside>
  );
};

export default SideNavigation;