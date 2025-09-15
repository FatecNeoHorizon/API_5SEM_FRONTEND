import React from 'react';
import NavBar from '../NavBar/NavBar';

const Layout = ({ children }) => {
  return (
    <div>
      <NavBar />
      <div class="p-4">
        {children}
      </div>
    </div>
  );
}

export default Layout;