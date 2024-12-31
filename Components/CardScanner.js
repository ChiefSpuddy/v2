import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { preprocessImage, extractCardDetails } from './utils/ocrUtils';
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

  const processImageForOCR = async (imageUrl) => {
    setOcrLoading(true);
    try {
      const { name, number } = await extractCardDetails(imageUrl);
      setCardName(name);
      setCardNumber(number);
    } catch (error) {
      console.error('OCR Processing Error:', error);
      setCardName('Error Processing Card');
      setCardNumber('N/A');
    } finally {
      setOcrLoading(false);
    }
  };

  const fetchEbayData = () => {
    if (!cardName || cardName === 'Unknown Card Name') {
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
        <button className="file-button">Select File</button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
        />
      </div>

      {/* Webcam Option */}
      <div className="webcam-toggle">
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
          Searching for: <strong>{cardName}</strong> {cardNumber && `(${cardNumber})`}
        </p>
        <button onClick={fetchEbayData} disabled={loading || ocrLoading}>
          {loading ? 'Searching...' : 'Search eBay'}
        </button>
        {results.length > 0 ? (
          <ul>
            {results.map((item, index) => (
              <li key={index}>
                <a href={item.itemWebUrl} target="_blank" rel="noopener noreferrer">
                  {item.title} - ${item.price.value}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No results found for "{cardName}".</p>
        )}
      </div>
    </div>
  );
}

export default CardScanner;
