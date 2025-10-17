import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrapeForm from './components/ScrapeForm';
import DataDisplay from './components/DataDisplay';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [selectedData, setSelectedData] = useState(null);
  const [activeTab, setActiveTab] = useState('scraper');

  const handleScrapeComplete = (data) => {
    setSelectedData(data.data);
    setActiveTab('result');
  };

  const handlePreview = (data) => {
    setSelectedData(data.data);
    setActiveTab('result');
  };

  const handleDataSelect = (data) => {
    setSelectedData(data);
    setActiveTab('result');
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#1a1a1a',
          color: '#e0e0e0',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      />
      <header className="app-header">
        <div className="container">
          <div className="app-header-content">
            <div className="app-header-brand">
              <div className="app-header-icon"></div>
              <div className="app-header-title">
                <h1>Web Intelligence Suite</h1>
                <p>Advanced Web Scraping & AI-Powered Content Analysis</p>
              </div>
            </div>
            
            <nav className="app-header-nav">
              <button
                className={activeTab === 'scraper' ? 'active' : ''}
                onClick={() => setActiveTab('scraper')}
              >
                <span className="nav-icon">🔍</span>
                <span className="nav-text">
                  <span className="nav-label">Scraper</span>
                  <span className="nav-desc">Extract data from URLs</span>
                </span>
              </button>
              <button
                className={activeTab === 'dashboard' ? 'active' : ''}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">
                  <span className="nav-label">Dashboard</span>
                  <span className="nav-desc">View analytics & stats</span>
                </span>
              </button>
              <button
                className={activeTab === 'result' ? 'active' : ''}
                onClick={() => setActiveTab('result')}
              >
                <span className="nav-icon">📄</span>
                <span className="nav-text">
                  <span className="nav-label">Results</span>
                  <span className="nav-desc">Detailed analysis</span>
                </span>
              </button>
            </nav>

            <div className="app-header-badge">
              ✨ Powered by Gemini AI
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="fade-in">
            {activeTab === 'scraper' && (
              <ScrapeForm 
                onScrapeComplete={handleScrapeComplete}
                onPreview={handlePreview}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard onDataSelect={handleDataSelect} />
            )}

            {activeTab === 'result' && (
              <DataDisplay data={selectedData} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
