import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { extractTextFromImage } from './utils/ocrUtils';
import './CardScanner.css';

function CardScanner() {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setOcrLoading(true);

      const fullText = await extractTextFromImage(imageUrl);
      setExtractedText(fullText);

      setOcrLoading(false);
    }
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      setImage(capturedImage);
      setOcrLoading(true);

      const fullText = await extractTextFromImage(capturedImage);
      setExtractedText(fullText);

      setOcrLoading(false);
    }
  };

  const toggleWebcam = () => {
    setShowWebcam((prev) => !prev);
  };

  return (
    <div className="card-scanner">
      <h2>Card Scanner</h2>
      <p className="instructions">
        Upload or scan a card to extract all visible text.
      </p>

      <div className="file-input-wrapper">
        <button>Select File</button>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      <div>
        <button onClick={toggleWebcam}>{showWebcam ? 'Close Webcam' : 'Use Webcam'}</button>
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

      {ocrLoading && <p>Processing image, please wait...</p>}

      {image && (
        <div className="preview-section">
          <h3>Preview</h3>
          <img src={image} alt="Uploaded or Captured Card" />
        </div>
      )}

      <div className="text-output">
        <h3>Extracted Text</h3>
        {extractedText ? <pre>{extractedText}</pre> : <p>No text extracted yet.</p>}
      </div>
    </div>
  );
}

export default CardScanner;
