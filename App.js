import React from 'react';
import './App.css';
import CardScanner from './Components/CardScanner';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Pokémon Card Scanner</h1>
        <p>Scan your Pokémon cards to get details and prices!</p>
      </header>
      <main className="app-main">
        <CardScanner />
      </main>
    </div>
  );
}

export default App;
