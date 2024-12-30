import React, { useState } from 'react';

function CardScanner() {
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <h2>Card Scanner</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Uploaded Card" style={{ width: '300px', marginTop: '10px' }} />}
    </div>
  );
}

export default CardScanner;
