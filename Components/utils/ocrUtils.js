import Tesseract from "tesseract.js";

const extractTextFromImage = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, "eng");
    return text;
  } catch (error) {
    console.error("Error extracting text:", error);
    return "";
  }
};

export { extractTextFromImage };
