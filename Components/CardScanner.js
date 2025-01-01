import React, { useState } from 'react';

function CardScanner() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length === 0) {
      setError('No file selected');
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/scan', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    }
  };

  return (
    <div>
      <h1>Pokémon Card Scanner</h1>
      <input type="file" id="file-input" accept="image/*" />
      <button onClick={handleScan}>Scan Card</button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data && (
        <div>
          <h3>Results:</h3>
          <p><strong>Name:</strong> {data.name || "Not found"}</p>
          <p><strong>Card Set:</strong> {data.card_set || "Not found"}</p>
        </div>
      )}
    </div>
  );
}

export default CardScanner;