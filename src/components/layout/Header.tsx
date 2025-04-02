import React from 'react';

/*
This is a basic functional component named Header.
React.FC is a TypeScript type that stands for "Functional Component".
It provides type checking and autocompletion for functional components.
*/
const Header: React.FC = () => {
  /*
  The 'return' statement specifies what the component should render.
  We are using JSX (JavaScript XML) syntax here, which looks like HTML.
  */
  return (
    /*
    '<header>' is a standard HTML tag for the header section of a page.
    'className' is how you apply CSS classes in React (similar to 'class' in HTML).
    - 'bg-gray-800': Sets the background color to dark gray (Tailwind class).
    - 'text-white': Sets the text color to white (Tailwind class).
    - 'p-4': Adds padding of 1rem (16px) around the element (Tailwind class).
    */
    <header className="bg-gray-800 text-white p-4">
      {/*
      '<div>' is a standard HTML tag for a division or section.
      - 'container': Centers the content and sets a max-width (Tailwind class).
      - 'mx-auto': Centers the div horizontally by setting auto margins on the left/right (Tailwind class).
      */}
      <div className="container mx-auto">
        {/*
        '<h1>' is a standard HTML tag for a top-level heading.
        - 'text-xl': Sets the font size to extra-large (Tailwind class).
        */}
        <h1 className="text-xl">Identiq Header Placeholder</h1>
        {/* This is a placeholder comment for where navigation links might go later */}
      </div>
    </header>
  );
};

/*
'export default Header;' makes this component available for use in other parts of your application.
'default' means it's the main thing being exported from this file.
*/
export default Header; 