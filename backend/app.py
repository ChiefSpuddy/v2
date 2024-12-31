from flask import Flask, request, jsonify
import easyocr
import requests

app = Flask(__name__)
reader = easyocr.Reader(['en'])

EBAY_API_KEY = 'Your-API-Key'  # Replace with your eBay API key

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    results = reader.readtext(file)
    return jsonify({"text": [res[1] for res in results]})

@app.route('/search', methods=['POST'])
def ebay_search():
    data = request.json
    search_term = data.get('query', '')
    response = requests.get(
        'https://api.ebay.com/buy/browse/v1/item_summary/search',
        headers={'Authorization': f'Bearer {EBAY_API_KEY}'},
        params={'q': search_term, 'limit': 5}
    )
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
