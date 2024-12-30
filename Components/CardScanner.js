import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import './CardScanner.css';

function CardScanner() {
  const [image, setImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      setImage(capturedImage);
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

  return (
    <div className="card-scanner">
      <h2>Card Scanner</h2>

      {/* File Upload */}
      <div className="file-input-wrapper">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <button>Select File</button>
      </div>

      {/* Webcam Option */}
      <div>
        <button className="webcam-toggle-button" onClick={toggleWebcam}>
          {showWebcam ? 'Close Webcam' : 'Use Webcam'}
        </button>
      </div>

      {showWebcam && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {/* Camera Selector */}
          <select
            onChange={(e) => setDeviceId(e.target.value)}
            value={deviceId}
            style={{
              marginBottom: '10px',
              padding: '5px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          >
            {devices.map((device, index) => (
              <option key={index} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>

          {/* Webcam View */}
          <div
            className="webcam-container"
            style={{
              display: 'inline-block',
              width: '400px',
              maxWidth: '100%',
              marginTop: '10px',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #ccc',
              aspectRatio: '16 / 9',
            }}
          >
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

          {/* Capture Button */}
          <div style={{ marginTop: '10px' }}>
            <button className="capture-button" onClick={captureImage}>
              Capture
            </button>
          </div>
        </div>
      )}

      {/* Display Image */}
      {image && (
        <div>
          <h3>Preview</h3>
          <img
            src={image}
            alt="Uploaded or Captured Card"
            style={{ width: '300px', marginTop: '10px' }}
          />
        </div>
      )}
    </div>
  );
}

export default CardScanner;
