import React, { useState } from 'react';

const CardScanner = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [ocrResults, setOcrResults] = useState([]);
    const [ebayResults, setEbayResults] = useState([]);

    // Handle file input
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Function to call OCR backend
    const handleScan = async () => {
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const ocrResponse = await fetch('http://127.0.0.1:5000/ocr', {
                method: 'POST',
                body: formData,
            });
            const ocrData = await ocrResponse.json();
            setOcrResults(ocrData.text);

            if (ocrData.text.length) {
                // Automatically trigger eBay search using the detected text
                handleSearch(ocrData.text.join(' '));
            }
        } catch (error) {
            console.error('Error during OCR scan:', error);
        }
    };

    // Function to call eBay search backend
    const handleSearch = async (query) => {
        try {
            const searchResponse = await fetch('http://127.0.0.1:5000/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            const searchData = await searchResponse.json();
            setEbayResults(searchData.items || []);
        } catch (error) {
            console.error('Error during eBay search:', error);
        }
    };

    return (
        <div>
            <h1>Card Scanner</h1>
            <div>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleScan}>Scan Card</button>
            </div>
            <div>
                <h2>OCR Results:</h2>
                <ul>
                    {ocrResults.map((text, index) => (
                        <li key={index}>{text}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>eBay Search Results:</h2>
                <ul>
                    {ebayResults.map((item, index) => (
                        <li key={index}>
                            <a href={item.itemWebUrl} target="_blank" rel="noopener noreferrer">
                                {item.title} - {item.price.value} {item.price.currency}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CardScanner;
