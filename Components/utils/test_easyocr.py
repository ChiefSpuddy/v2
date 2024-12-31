from Components.features.ocr_and_ebay import ocr_and_search

def run_test():
    image_path = "Components/assets/pikachu.jpg"
    app_id = "SamMay-CardScan-SBX-9faa35af2-f7a6d731"  # Replace with your actual eBay App ID
    results = ocr_and_search(image_path, app_id)

    print("OCR Results:")
    for result in results["ocr_results"]:
        print(f"{result['text']} (Confidence: {result['confidence']:.2f})")

    print("\neBay Results:")
    for item in results["ebay_results"]:
        print(f"{item['title']} - ${item['price']}")

if __name__ == "__main__":
    run_test()
