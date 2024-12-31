import Tesseract from 'tesseract.js';

export const preprocessImage = (imageUrl, targetRegion = null) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // If a target region is defined, crop the image
      if (targetRegion) {
        const { x, y, width, height } = targetRegion;
        const croppedImageData = ctx.getImageData(x, y, width, height);
        canvas.width = width;
        canvas.height = height;
        ctx.putImageData(croppedImageData, 0, 0);
      }

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

export const extractTextFromImage = async (imageUrl) => {
  try {
    const preprocessedImage = await preprocessImage(imageUrl);

    const { data: { text } } = await Tesseract.recognize(preprocessedImage, 'eng', {
      logger: (info) => console.log(info),
    });

    console.log('Extracted Full Text:', text);

    // Extract card name
    const nameMatch = text.match(/^[A-Za-z]+[A-Za-z\s]*$/m);
    const cardName = nameMatch ? nameMatch[0].trim() : 'Unknown Card Name';

    // Extract card number (e.g., 076/191, 01/02)
    const numberMatch = text.match(/\b\d{1,3}\/\d{1,3}\b/);
    const cardNumber = numberMatch ? numberMatch[0] : 'Unknown Card Number';

    return { text, cardName, cardNumber };
  } catch (error) {
    console.error('Error in OCR:', error);
    return { text: 'Error extracting text', cardName: 'Unknown', cardNumber: 'Unknown' };
  }
};
