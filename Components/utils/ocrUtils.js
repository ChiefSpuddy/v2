import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (imageUrl) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (info) => console.log(info),
    });
    const lines = text.split('\n').map((line) => line.trim()).filter((line) => line);
    return lines; // Return all text lines
  } catch (error) {
    console.error('OCR Error:', error);
    return [];
  }
};
