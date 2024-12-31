import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import './CardScanner.css';

function CardScanner() {
  const [image, setImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState(''); // Card name for eBay search
  const webcamRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setCardName('Pikachu'); // Placeholder: Replace with actual OCR or user input
    }
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      setImage(capturedImage);
      setCardName('Charizard'); // Placeholder: Replace with actual OCR or user input
      setShowWebcam(false); // Close webcam after capturing
    }
  };

  const handleDevices = (mediaDevices) => {
    const videoDevices = mediaDevices.filter((device) => device.kind === 'videoinput');
    setDevices(videoDevices);
    setDeviceId(videoDevices[0]?.deviceId || '');
  };

  const toggleWebcam = () => {
    setShowWebcam((prev) => !prev);

    if (!devices.length) {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }
  };

  const fetchEbayData = async () => {
    if (!cardName) {
      alert('Please provide a card name to search eBay.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://svcs.sandbox.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SECURITY-APPNAME=${process.env.REACT_APP_EBAY_APP_ID}&RESPONSE-DATA-FORMAT=JSON&keywords=${encodeURIComponent(
          cardName
        )}`
      );
      const data = await response.json();
      setResults(data.findItemsByKeywordsResponse[0].searchResult[0].item || []);
    } catch (error) {
      console.error('Error fetching data from eBay:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-scanner">
      <h2>Card Scanner</h2>
      <p className="instructions">
        Use the card scanner to upload an image or scan your Pokémon cards. Choose one of the options below:
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

      {showWebcam && (
        <div className="webcam-section">
          {/* Camera Selector */}
          <select onChange={(e) => setDeviceId(e.target.value)} value={deviceId}>
            {devices.map((device, index) => (
              <option key={index} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>

          {/* Webcam View */}
          <div className="webcam-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: deviceId ? { exact: deviceId } : undefined,
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <button onClick={captureImage}>Capture</button>
        </div>
      )}

      {/* Display Image */}
      {image && (
        <div className="preview-section">
          <h3>Preview</h3>
          <img
            src={image}
            alt="Uploaded or Captured Card"
            style={{ width: '300px', marginTop: '10px' }}
          />
        </div>
      )}

      {/* eBay Search */}
      <div className="ebay-search">
        <h3>eBay Search</h3>
        <p>Searching for: <strong>{cardName || 'No card selected'}</strong></p>
        <button onClick={fetchEbayData} disabled={!cardName || loading}>
          {loading ? 'Searching...' : 'Search eBay'}
        </button>
        <ul>
          {results.map((item, index) => (
            <li key={index}>
              <a href={item.viewItemURL[0]} target="_blank" rel="noopener noreferrer">
                {item.title[0]} - ${item.sellingStatus[0].currentPrice[0].__value__}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CardScanner;
