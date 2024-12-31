import easyocr

def run_easyocr():
    # Initialize the EasyOCR reader
    reader = easyocr.Reader(['en'])

    # Specify the image path
    image_path = r"C:\Users\Sam\Documents\pikachu.jpg"


    # Process the image and extract text
    result = reader.readtext(image_path)

    # Print the results
    for detection in result:
        print(f"Detected text: {detection[1]} (Confidence: {detection[2]})")

if __name__ == "__main__":
    run_easyocr()
