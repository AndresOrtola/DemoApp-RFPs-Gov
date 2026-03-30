import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <div className="header-logo">
              <span className="logo-icon">🏛️</span>
              <div>
                <h1>Tender Analyzer</h1>
                <p>Diário da República – Microsoft Opportunities</p>
              </div>
            </div>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>
            Data sourced from{' '}
            <a
              href="https://diariodarepublica.pt/dr/pesquisa"
              target="_blank"
              rel="noopener noreferrer"
            >
              Diário da República
            </a>
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
