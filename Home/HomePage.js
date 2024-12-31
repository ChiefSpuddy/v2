import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home">
      <h1>Welcome to the Pokémon Card Scanner</h1>
      <p>Scan your Pokémon cards to get details and prices!</p>
      <Link to="/scanner">
        <button>Go to Card Scanner</button>
      </Link>
    </div>
  );
}

export default HomePage;
