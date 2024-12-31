import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './Components/NavBar'; // Assuming this path matches your structure
import HomePage from './Pages/HomePage';
import CardScanner from './Pages/CardScanner'; // Create this if it doesn’t already exist

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scanner" element={<CardScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
