import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CardScanner from './Components/CardScanner';
import HomePage from './Home/HomePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/card-scanner" element={<CardScanner />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
