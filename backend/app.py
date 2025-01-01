from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/api/scan', methods=['POST'])
def scan_card():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Save the file to a temporary location
        file_path = os.path.join('/tmp', file.filename)
        file.save(file_path)

        # Perform OCR or other processing on the file
        # For example, let's assume we have a function `process_card` that returns the card name and set
        name, matched_set = process_card(file_path)

        response = {
            "name": name,
            "card_set": matched_set
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error during OCR: {e}")
        return jsonify({'error': str(e)}), 500

def process_card(file_path):
    # Dummy implementation for example purposes
    # Replace this with actual OCR and card matching logic
    return "Pikachu", "Base Set"

if __name__ == '__main__':
    app.run(debug=True)