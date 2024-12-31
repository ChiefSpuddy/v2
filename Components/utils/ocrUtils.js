import Tesseract from 'tesseract.js';

/**
 * Preprocess the image for OCR.
 * @param {string} imageUrl - The URL of the image to preprocess.
 * @returns {Promise<string>} - The processed image as a data URL.
 */
export const preprocessImage = (imageUrl) => {
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
        imageData.data[i] = avg;
        imageData.data[i + 1] = avg;
        imageData.data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL());
    };
  });
};

/**
 * Extract card name and number using OCR.
 * @param {string} preprocessedImage - The preprocessed image data URL.
 * @returns {Promise<{ cardName: string, cardNumber: string }>} - Extracted card name and number.
 */
export const extractCardDetails = async (preprocessedImage) => {
  return Tesseract.recognize(preprocessedImage, 'eng', {
    logger: (info) => console.log(info),
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /',
  })
    .then(({ data: { text } }) => {
      console.log('Extracted Text:', text);

      const lines = text.split('\n').map((line) => line.trim()).filter((line) => line);
      console.log('Lines Extracted from OCR:', lines);

      // Extract card name
      const cardName = lines.find((line) => /^[A-Za-z\s]+$/.test(line)) || 'Unknown Card Name';

      // Extract card number
      const cardNumber = lines.find((line) => /\b\d{1,3}\/\d{1,3}\b/.test(line)) || 'Unknown Card Number';

      return {
        cardName: cardName.trim(),
        cardNumber: cardNumber.trim(),
      };
    })
    .catch((error) => {
      console.error('OCR Error:', error);
      return {
        cardName: 'Unable to read card',
        cardNumber: 'N/A',
      };
    });
};
