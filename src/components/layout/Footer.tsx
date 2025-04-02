// src/components/layout/Footer.tsx

import React from 'react';

const Footer = () => {
  // Get the current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 p-4 mt-8 text-center">
      <div className="container mx-auto">
        <p>&copy; {currentYear} Identiq Platform. All rights reserved.</p>
        {/* Social links or other footer content can go here later */}
      </div>
    </footer>
  );
};

export default Footer;