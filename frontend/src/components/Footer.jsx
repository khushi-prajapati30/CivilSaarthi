import React from 'react';

const Footer = () => {
  return (
    <footer className="dark:bg-slate-900 bg-slate-100 border-t dark:border-slate-800 border-slate-200 py-8 text-center mt-auto transition-colors duration-300">
      <p className="dark:text-slate-400 text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} SmartCity Civic Issue Management. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
