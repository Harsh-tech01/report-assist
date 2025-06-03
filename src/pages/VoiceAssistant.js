import React from 'react';

export default function VoiceAssistant() {
  return (
    <div style={{ backgroundColor: '#131712', color: 'white', fontFamily: 'Manrope, Noto Sans, sans-serif', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #2d372a' }}>
        <h2>Voice Reporting</h2>
        <div style={{ width: '40px', height: '40px', borderRadius: '9999px', backgroundColor: '#444' }}></div>
      </header>
      <main style={{ padding: '2rem' }}>
        <h1>Voice Assistant</h1>
        <div style={{ marginTop: '2rem' }}>
          <p style={{ background: '#2d372a', padding: '1rem', borderRadius: '8px' }}>AI Assistant: Hello! How can I assist you today?</p>
          <p style={{ background: '#53d22c', color: '#131712', padding: '1rem', borderRadius: '8px', marginTop: '1rem', alignSelf: 'flex-end', textAlign: 'right' }}>Sophia: What is the current sales performance?</p>
        </div>
      </main>
    </div>
  );
}
