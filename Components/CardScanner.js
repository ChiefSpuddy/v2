import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { extractTextFromImage } from '.utils/ocrUtils';
import './CardScanner.css';

function CardScanner() {
  const [image, setImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [ocrResults, setOcrResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setLoading(true);
      const detectedText = await extractTextFromImage(imageUrl);
      setOcrResults(detectedText);
      setLoading(false);
    }
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      setImage(capturedImage);
      setLoading(true);
      const detectedText = await extractTextFromImage(capturedImage);
      setOcrResults(detectedText);
      setLoading(false);
      setShowWebcam(false);
    }
  };

  const toggleWebcam = () => {
    setShowWebcam((prev) => !prev);
    if (!devices.length) {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }
  };

  const handleDevices = (mediaDevices) => {
    const videoDevices = mediaDevices.filter((device) => device.kind === 'videoinput');
    setDevices(videoDevices);
    setDeviceId(videoDevices[0]?.deviceId || '');
  };

  return (
    <div className="card-scanner">
      <h2>Card Scanner</h2>
      <p className="instructions">
        Use the card scanner to upload an image or scan your Pokémon cards. The app will display all recognized text
        below.
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

          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              deviceId: deviceId ? { exact: deviceId } : undefined,
            }}
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

      {loading && <p>Processing image, please wait...</p>}

      {ocrResults.length > 0 && (
        <div className="ocr-results">
          <h3>Extracted Text</h3>
          <ul>
            {ocrResults.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CardScanner;
