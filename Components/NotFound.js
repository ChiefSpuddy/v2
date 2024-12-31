import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <button onClick={() => (window.location.href = '/')}>Go Back to Home</button>
    </div>
  );
};

export default NotFound;
