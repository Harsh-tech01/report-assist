import React from 'react';

export default function Reports() {
  return (
    <div style={{ backgroundColor: '#131712', color: 'white', minHeight: '100vh', fontFamily: 'Manrope, Noto Sans, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #2d372a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '24px', height: '24px' }}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 
              33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ReportAI</h2>
        </div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
          <a href="/reports" style={{ color: 'white', textDecoration: 'none' }}>Reports</a>
          <a href="/explore" style={{ color: 'white', textDecoration: 'none' }}>Explore</a>
        </nav>
      </header>
      <main style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Report Summary</h1>
        <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>Here's a summary of the key insights from your report, as analyzed by our AI. This will help you quickly grasp the main points and identify areas for further exploration.</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Key Insights</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: 1, minWidth: '280px', border: '1px solid #42513e', borderRadius: '12px', padding: '1rem' }}>
            <p>Sales Performance</p>
            <h3 style={{ fontSize: '2rem' }}>$2.5M</h3>
            <p>Last Quarter <span style={{ color: '#0bda35' }}>+12%</span></p>
          </div>
          <div style={{ flex: 1, minWidth: '280px', border: '1px solid #42513e', borderRadius: '12px', padding: '1rem' }}>
            <p>Customer Engagement</p>
            <h3 style={{ fontSize: '2rem' }}>45%</h3>
            <p>Last Month <span style={{ color: '#fa4b38' }}>-5%</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}
