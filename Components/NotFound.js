import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './NotFound.css';
import NotFoundImage from './assets/jiggly-cry.gif'; // Adjusted path

const NotFound = () => {
  return (
    <div className="not-found-container">
              <img src={NotFoundImage} alt="404 Not Found" className="pikachu-baloon" />
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>

      <Link to="/" className="home-button">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
