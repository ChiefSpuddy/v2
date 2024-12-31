import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import './CardScanner.css';

function CardScanner() {
  const [image, setImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      await processImageForOCR(imageUrl);
    }
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      setImage(capturedImage);
      await processImageForOCR(capturedImage);
      setShowWebcam(false);
    }
  };

  const preprocessImage = (imageUrl) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl;

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Apply grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = avg; // Red
          imageData.data[i + 1] = avg; // Green
          imageData.data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL());
      };
    });
  };

  const processImageForOCR = async (imageUrl) => {
    setOcrLoading(true);
    const preprocessedImage = await preprocessImage(imageUrl);

    Tesseract.recognize(preprocessedImage, 'eng', {
      logger: (info) => console.log(info),
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /',
    })
      .then(({ data: { text } }) => {
        console.log('Extracted Text:', text);

        const lines = text.split('\n').map((line) => line.trim()).filter((line) => line);
        console.log('Lines Extracted from OCR:', lines);

        // Extract card name: Find the first line with alphabetic characters and spaces only
        const cardName = lines.find((line) => /^[A-Za-z\s]+$/.test(line)) || 'Unknown Card Name';

        // Extract card number: Find the first line matching the "number/number" format
        const cardNumber = lines.find((line) => /\d+\/\d+/.test(line)) || 'Unknown Card Number';

        setCardName(cardName.trim());
        setCardNumber(cardNumber.trim());
      })
      .catch((error) => {
        console.error('OCR Error:', error);
        setCardName('Unable to read card');
        setCardNumber('N/A');
      })
      .finally(() => {
        setOcrLoading(false);
      });
  };

  const fetchEbayData = () => {
    if (!cardName) {
      alert('Please upload an image or scan a card first!');
      return;
    }

    setLoading(true);
    fetch(
      `https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
        `${cardName} ${cardNumber}`
      )}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_EBAY_API_TOKEN}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log('eBay Data:', data);
        setResults(data.itemSummaries || []);
      })
      .catch((error) => {
        console.error('eBay API Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleWebcam = () => {
    setShowWebcam((prev) => !prev);
  };

  return (
    <div className="card-scanner">
      <h2>Card Scanner</h2>
      <p className="instructions">
        Use the card scanner to upload an image or scan your Pokémon cards. The app will identify the card name and
        number.
      </p>
      <ul className="instructions-list">
        <li>Select a file from your computer to upload.</li>
        <li>Open the webcam to scan the card directly.</li>
        <li>Preview the uploaded or scanned card below.</li>
      </ul>

      {/* File Upload */}
      <div className="file-input-wrapper">
        <button>Select File</button>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {/* Webcam Option */}
      <div>
        <button onClick={toggleWebcam}>
          {showWebcam ? 'Close Webcam' : 'Use Webcam'}
        </button>
      </div>

      {ocrLoading && <p>Processing image, please wait...</p>}

      {showWebcam && (
        <div className="webcam-section">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', height: 'auto' }}
          />
          <button onClick={captureImage}>Capture</button>
        </div>
      )}

      {image && (
        <div className="preview-section">
          <h3>Preview</h3>
          <img src={image} alt="Uploaded or Captured Card" />
        </div>
      )}

      {/* eBay Search */}
      <div className="ebay-search">
        <h3>eBay Search</h3>
        <p>
          Searching for: <strong>{cardName || 'No card name detected'}</strong>{' '}
          {cardNumber && <span>({cardNumber})</span>}
        </p>
        <button onClick={fetchEbayData} disabled={loading || ocrLoading}>
          {loading ? 'Searching...' : 'Search eBay'}
        </button>
        {loading && <p>Loading results...</p>}
        {!loading && results.length === 0 && cardName && <p>No results found for "{cardName}".</p>}
        <ul>
          {results.map((item, index) => (
            <li key={index}>
              <a href={item.itemWebUrl} target="_blank" rel="noopener noreferrer">
                {item.title} - ${item.price.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CardScanner;
