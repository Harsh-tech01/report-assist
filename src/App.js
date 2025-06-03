import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import VoiceAssistant from './pages/VoiceAssistant';
import Summary from './pages/Summary';
import Help from './pages/Help';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/voice" element={<VoiceAssistant />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Router>
  );
}

export default App;
