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
  const [languageCode, setLanguageCode] = useState("hi");
  const [audioUrl, setAudioUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      if (fileType === 'pdf') {
        text = await extractTextFromPDF(file);
      } else if (['xls', 'xlsx'].includes(fileType)) {
        text = await extractTextFromExcel(file);
      } else if (fileType === 'csv') {
        text = await extractTextFromCSV(file);
      } else {
        alert('Unsupported file format');
        return;
      }

      setExtractedText(text);
    } catch (error) {
      console.error("Error extracting text:", error);
    }
  };

  const handleListenClick = async () => {
    if (!extractedText) {
      alert("Please upload a report first.");
      return;
    }

    try {
      const res = await fetch("/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, languageCode }),
      });

      if (!res.ok) throw new Error("Failed to generate speech");

      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setShowModal(true);
    } catch (error) {
      alert("Error synthesizing speech: " + error.message);
    }
  };
  return (
    <div className="home-root">
      <header className="header">
        <div className="logo-title">
          <div className="logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M39.475 21.6262C..." fill="currentColor" />
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
                </select>
              </div>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
            <h3>Audio Summary</h3>
            <audio controls autoPlay src={audioUrl} onEnded={() => URL.revokeObjectURL(audioUrl)} />
          </div>
        </div>
      )}
    </div>
  );
}
