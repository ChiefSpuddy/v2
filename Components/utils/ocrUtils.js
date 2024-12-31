import Tesseract from 'tesseract.js';

/**
 * Preprocess the image to enhance OCR accuracy.
 * Converts the image to grayscale for better text detection.
 * @param {string} imageUrl - The URL of the image to preprocess.
 * @returns {Promise<string>} - The preprocessed image as a data URL.
 */
export const preprocessImage = async (imageUrl) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = imageUrl;

  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Convert to grayscale
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

/**
 * Extract card details (name and card number) from the image using OCR.
 * Applies regex patterns to identify card name and number.
 * @param {string} imageUrl - The URL of the image to process.
 * @returns {Promise<{name: string, number: string}>} - The extracted card name and number.
 */
export const extractCardDetails = async (imageUrl) => {
  const preprocessedImage = await preprocessImage(imageUrl);

  return Tesseract.recognize(preprocessedImage, 'eng', {
    logger: (info) => console.log(info), // Log Tesseract progress for debugging
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /',
  })
    .then(({ data: { text } }) => {
      // Split text into lines and trim whitespace
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

      console.log('OCR Extracted Text:', lines);

      // Regex for card name: Find lines with alphabetic characters and spaces
      const name = lines.find((line) => /^[A-Za-z\s]+$/.test(line)) || 'Unknown Card Name';

      // Regex for card number: Match formats like 123/456, 02/034, or 1/2
      const number = lines.find((line) => /\b\d{1,3}\/\d{1,3}\b/.test(line)) || 'Unknown Card Number';

      return { name: name.trim(), number: number.trim() };
    })
    .catch((error) => {
      console.error('OCR Error:', error);
      return { name: 'Unable to read card', number: 'N/A' };
    });
};
