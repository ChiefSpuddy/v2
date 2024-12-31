import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { extractTextFromImage } from './utils/ocrUtils';
import './CardScanner.css';

function CardScanner() {
  const [image, setImage] = useState(null);
  const [ocrResults, setOcrResults] = useState({ text: '', cardName: '', cardNumber: '' });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
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
      const results = await extractTextFromImage(imageUrl);
      setOcrResults(results);
    } catch (error) {
      console.error('OCR Processing Failed:', error);
      setOcrResults({ text: 'Error processing image', cardName: 'Unknown', cardNumber: 'Unknown' });
    } finally {
      setOcrLoading(false);
    }
  };

  const toggleWebcam = () => {
    setShowWebcam((prev) => !prev);
  };

  return (
    <div className="card-scanner">
      <h2>Card Scanner</h2>
      <p>Upload an image or scan a card to extract text.</p>

      <div className="file-input-wrapper">
        <button>Select File</button>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      <div>
        <button onClick={toggleWebcam}>
          {showWebcam ? 'Close Webcam' : 'Use Webcam'}
        </button>
      </div>

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

      {ocrLoading && <p>Processing image...</p>}

      {image && (
        <div className="preview-section">
          <h3>Preview</h3>
          <img src={image} alt="Uploaded or Captured Card" style={{ maxWidth: '300px' }} />
        </div>
      )}

      <div className="ocr-results">
        <h3>Extracted Text</h3>
        <textarea
          value={ocrResults.text}
          readOnly
          style={{ width: '100%', height: '200px', marginTop: '10px' }}
        />
        <p>
          Card Name: <strong>{ocrResults.cardName}</strong>
        </p>
        <p>
          Card Number: <strong>{ocrResults.cardNumber}</strong>
        </p>
      </div>
    </div>
  );
}

export default CardScanner;
