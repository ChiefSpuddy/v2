import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import './CardScanner.css';

function CardScanner() {
  const [image, setImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [cardName, setCardName] = useState('');
  const webcamRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      // Start OCR
      setOcrLoading(true);
      Tesseract.recognize(imageUrl, 'eng', {
        logger: (info) => console.log(info),
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ',
      })
        .then(({ data: { text } }) => {
          console.log('Extracted Text:', text);
          setCardName(text.split('\n')[0]); // Extract the first line of text
        })
        .catch((error) => {
          console.error('OCR Error:', error);
          setCardName('Unable to read card');
        })
        .finally(() => {
          setOcrLoading(false);
        });
    }
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      setImage(capturedImage);

      // Start OCR
      setOcrLoading(true);
      Tesseract.recognize(capturedImage, 'eng', {
        logger: (info) => console.log(info),
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ',
      })
        .then(({ data: { text } }) => {
          console.log('Extracted Text:', text);
          setCardName(text.split('\n')[0]); // Extract the first line of text
        })
        .catch((error) => {
          console.error('OCR Error:', error);
          setCardName('Unable to read card');
        })
        .finally(() => {
          setOcrLoading(false);
        });

      setShowWebcam(false);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('eBay API Response:', data);

      const items = data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
      setResults(items);
    } catch (error) {
      console.error('Error fetching data from eBay:', error);
      alert('Failed to fetch data from eBay. Check console for details.');
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

      {ocrLoading && <p>Processing image, please wait...</p>}

      {showWebcam && (
        <div className="webcam-section">
          <select onChange={(e) => setDeviceId(e.target.value)} value={deviceId}>
            {devices.map((device, index) => (
              <option key={index} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>

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
        <button onClick={fetchEbayData} disabled={loading || ocrLoading}>
          {loading ? 'Searching...' : 'Search eBay'}
        </button>
        {loading && <p>Loading results...</p>}
        {!loading && results.length === 0 && cardName && <p>No results found for "{cardName}".</p>}
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
