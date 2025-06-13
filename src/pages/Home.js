import React, { useState } from 'react';
import './Home.css';
import { FaUpload, FaMicrophone, FaHeadphones, FaTimes } from 'react-icons/fa';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as XLSX from 'xlsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [audioUrl, setAudioUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item) => item.str).join(" ");
          fullText += text + "\n";
        }
        resolve(fullText);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromExcel = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        let result = '';
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          result += json.map((row) => row.join(' ')).join('\n') + '\n';
        });
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromCSV = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setSelectedFile(file);
  setStep(1);
  setAudioUrl(null);
  setShowModal(false);

  const fileType = file.name.split('.').pop().toLowerCase();
  let text = '';

  try {
    // Upload file to Flask server
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

    console.log("File uploaded:", uploadData.filename);

    // Extract text based on file type
    if (fileType === "pdf") {
      text = await extractTextFromPDF(file);
    } else if (["xls", "xlsx"].includes(fileType)) {
      text = await extractTextFromExcel(file);
    } else if (fileType === "csv") {
      text = await extractTextFromCSV(file);
    } else {
      alert("Unsupported file format");
      return;
    }

    setExtractedText(text);
  } catch (error) {
    console.error("Error processing file:", error);
    alert("Error handling the file: " + error.message);
  }
};

const handleListenClick = async () => {
  if (!extractedText) {
    alert("Please upload a report first.");
    return;
  }

  setIsLoading(true);
  try {
    const res = await fetch("/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: extractedText,
        languageCode,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to generate speech");
    }

    const audioBlob = await res.blob();
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    setShowModal(true);
  } catch (error) {
    alert("Error synthesizing speech: " + error.message);
    console.error("TTS error:", error);
  } finally {
    setIsLoading(false);
  }
};




const handleCloseModal = () => {
  setShowModal(false);
  window.location.reload(); // Refresh the page
};



  return (
    <div className="home-root">
      <header className="header">
        <div className="logo-title">
          <div className="logo">
             <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">Add commentMore actions
              <path fillRule="evenodd" clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 
                21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 
                25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 
                38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 
                40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 
                39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 
                30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 
                22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 
                44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 
                43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 
                29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 
                21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 
                3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 
                7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 
                18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 
                27.8527 4.41189 29.2403Z"
                fill="currentColor" />
            </svg>
          </div>
          <h2>ReportAssist</h2>
        </div>
        <nav className="nav-links">
          <a href="/">Overview</a>
          <a href="/reports">Reports</a>
          <a href="/help">Help</a>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Transform Your Reports with AI</h1>
          <h2>Upload your reports and let our AI voice assistant bring your data to life. Experience a new way to interact with and understand your information.</h2>

           <div className="upload-section">
  {selectedFile && (
    <div className="uploaded-file-name">
      <strong>Uploaded File:</strong> {selectedFile.name}
    </div>
  )}

  <input
    type="file"
    accept=".pdf,.xls,.xlsx,.csv"
    style={{ display: 'none' }}
    id="fileUpload"
    onChange={handleFileChange}
  />
  <button onClick={() => document.getElementById('fileUpload').click()}>
    Upload Report
  </button>
</div>

          {step === 1 && (
            <>
              <div style={{ marginTop: "10px" }}>
                <label htmlFor="languageSelect">Choose Language: </label>
                <select
                  id="languageSelect"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  style={{ marginLeft: "8px" }}
                >
                 <option value="en">English</option>
  <option value="hi">Hindi</option>
  <option value="es">Spanish</option>
  <option value="fr">French</option>
  <option value="de">German</option>
  <option value="zh-CN">Chinese</option>
  <option value="ar">Arabic</option>
                </select>
              </div>
                            {isLoading && (
                  <div className="loader-overlay">
                    <div className="loader-spinner"></div>
                    <p className="loader-text">Generating Audio... Please wait.</p>
                  </div>
                )}


              <button style={{ marginTop: "10px" }} onClick={handleListenClick}>
                Listen to Summary
              </button>
            </>
          )}

       

          <section className="formats-section">
            <h2>Supported Formats</h2>
            <div className="formats-grid">
              <div className="format-card"><span className="format-icon">📄</span><h3>PDF</h3></div>
              <div className="format-card"><span className="format-icon">📊</span><h3>EXCEL</h3></div>
              <div className="format-card"><span className="format-icon">📈</span><h3>CSV</h3></div>
            </div>
          </section>
        </div>
      </main>

      <div className="how-it-works">
        <h2 className="how-it-works-title">How it works?</h2>
        <div className="steps-container">
          <div className="step"><FaUpload className="step-icon" /><h3 className="step-title">Upload Report</h3><p className="step-description">Upload your PDF or Excel reports.</p></div>
          <div className="step"><FaMicrophone className="step-icon" /><h3 className="step-title">Choose Language</h3><p className="step-description">Select your narration language.</p></div>
          <div className="step"><FaHeadphones className="step-icon" /><h3 className="step-title">Listen</h3><p className="step-description">AI reads out key insights.</p></div>
        </div>
      </div>

      {/* Modal Audio Player */}
      {showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content audio-player-container" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={handleCloseModal}>&times;</button>
      <h3>Audio Summary</h3>
      <div className="custom-audio-player">
        <audio controls className="styled-audio" autoPlay src={audioUrl} onEnded={() => URL.revokeObjectURL(audioUrl)} />
      </div>
    </div>
  </div>
)}

    </div>
  );
}
