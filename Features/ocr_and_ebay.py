import easyocr
import requests

def run_ocr(image_path):
    """
    Run OCR on an image and extract text.
    :param image_path: Path to the image.
    :return: List of detected text with confidence.
    """
    reader = easyocr.Reader(['en'])
    results = reader.readtext(image_path)
    extracted_text = [
        {"text": text, "confidence": confidence}
        for _, text, confidence in results
        if confidence > 0.5
    ]
    return extracted_text

def search_ebay(query, app_id):
    """
    Search eBay for items based on a query string.
    :param query: The search query (e.g., 'Pikachu card 060').
    :param app_id: Your eBay Developer App ID.
    :return: List of search results with title and price.
    """
    url = "https://svcs.ebay.com/services/search/FindingService/v1"
    params = {
        "OPERATION-NAME": "findItemsByKeywords",
        "SERVICE-VERSION": "1.0.0",
        "SECURITY-APPNAME": app_id,
        "RESPONSE-DATA-FORMAT": "JSON",
        "keywords": query,
        "paginationInput.entriesPerPage": 5,
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        items = data.get("findItemsByKeywordsResponse", [])[0].get("searchResult", [])[0].get("item", [])
        return [{"title": item["title"][0], "price": item["sellingStatus"][0]["currentPrice"][0]["__value__"]} for item in items]
    else:
        print(f"eBay API error: {response.status_code}")
        return []

def ocr_and_search(image_path, app_id):
    """
    Perform OCR and search eBay based on detected text.
    :param image_path: Path to the image.
    :param app_id: Your eBay Developer App ID.
    :return: eBay search results.
    """
    ocr_results = run_ocr(image_path)
    keywords = " ".join([result["text"] for result in ocr_results[:3]])  # Top 3 results
    print(f"eBay Search Query: {keywords}")
    ebay_results = search_ebay(keywords, app_id)
    return {"ocr_results": ocr_results, "ebay_results": ebay_results}
