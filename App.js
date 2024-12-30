import React from 'react';
import CardScanner from './CardScanner';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Pokémon Card Scanner</h1>
        <p>Scan your Pokémon cards to get details and prices!</p>
      </header>
      <main>
        <CardScanner />
      </main>
    </div>
  );
}

export default App;
