from flask import Flask, request, jsonify
import easyocr
from PIL import Image
import cv2
import numpy as np
import os
import io

# Initialize Flask app and OCR Reader
app = Flask(__name__)
reader = easyocr.Reader(['en'])  # Adjust language if needed

# Path to card set symbols
card_set_folder = "C:/Users/Sam/fresh-frontend/src/set_icons/"  # Path to your set icons folder

def load_card_set_icons():
    """Load card set icons into a dictionary."""
    card_sets = {}
    for filename in os.listdir(card_set_folder):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            path = os.path.join(card_set_folder, filename)
            icon_name = os.path.splitext(filename)[0]
            card_sets[icon_name] = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    return card_sets

# Load card set symbols at the start
card_sets = load_card_set_icons()

def compare_symbols(extracted_symbol, card_sets):
    """Compare extracted symbol to known card set icons."""
    best_match = None
    best_score = 0

    extracted_symbol_resized = cv2.resize(extracted_symbol, (50, 50))

    for name, template in card_sets.items():
        template_resized = cv2.resize(template, (50, 50))
        score = cv2.matchTemplate(extracted_symbol_resized, template_resized, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, _ = cv2.minMaxLoc(score)

        if max_val > best_score:
            best_score = max_val
            best_match = name

    return best_match if best_score > 0.8 else None

@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        print("OCR endpoint hit!")

        # Check if the request contains a file
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file uploaded'}), 400

        if not file.mimetype.startswith('image/'):
            return jsonify({'error': 'Invalid file type'}), 400

        # Read the file content as bytes
        file_bytes = file.read()
        np_image = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        # Crop the region for the set symbol
        height, width, _ = image.shape
        symbol_region = image[int(height * 0.85):height, int(width * 0.85):width]  # Adjust as needed
        symbol_gray = cv2.cvtColor(symbol_region, cv2.COLOR_BGR2GRAY)

        # Compare the extracted symbol with known card set icons
        matched_set = compare_symbols(symbol_gray, card_sets)

        # Perform OCR
        results = reader.readtext(image)

        name = None
        for item in results:
            cleaned_text = item[1].strip()
            if cleaned_text:  # Assuming any valid text is the name
                name = cleaned_text
                break

        response = {
            "name": name,
            "card_set": matched_set
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error during OCR: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
