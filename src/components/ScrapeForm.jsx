import { useState } from 'react';
import { scraperAPI } from '../services/api';
import { showSuccess, showError, showWarning, showLoading, updateToast } from '../utils/toast';
import '../components.css';

const ScrapeForm = ({ onScrapeComplete, onPreview }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [analyzeWithAI, setAnalyzeWithAI] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handleSubmit = async (e, isPreview = false) => {
    e.preventDefault();
    if (!url.trim()) {
      showWarning('Please enter a URL');
      return;
    }

    const toastId = showLoading(isPreview ? 'Loading preview...' : 'Scraping URL...');
    setLoading(true);
    
    try {
      const payload = { 
        url, 
        method, 
        analyzeWithAI,
        customPrompt: customPrompt.trim() || undefined
      };
      
      const response = isPreview 
        ? await scraperAPI.previewScrape(payload)
        : await scraperAPI.scrapeUrl(payload);
      
      if (isPreview && onPreview) {
        onPreview(response.data);
      } else if (onScrapeComplete) {
        onScrapeComplete(response.data);
      }
      
      const successMessage = isPreview 
        ? '✨ Preview loaded successfully!' 
        : response.data.message || '✅ URL scraped and saved!';
      
      updateToast(toastId, 'success', successMessage);
      
      if (!isPreview) {
        setUrl('');
        setCustomPrompt('');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      const errorMessage = error.response?.data?.details 
        || error.response?.data?.message 
        || error.message
        || 'Failed to scrape URL';
      
      updateToast(toastId, 'error', `❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '1.5rem', fontSize: '1.75rem' }}>
        🔍 Scrape Website Data
      </h2>
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="form-group">
          <label className="form-label">Website URL</label>
          <input
            type="text"
            className="form-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={analyzeWithAI}
              onChange={(e) => setAnalyzeWithAI(e.target.checked)}
              disabled={loading}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span className="form-label" style={{ marginBottom: 0 }}>🤖 Analyze content with AI</span>
          </label>
        </div>

        {analyzeWithAI && (
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                ✨ Custom AI Prompt (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowPromptInput(!showPromptInput)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                disabled={loading}
              >
                {showPromptInput ? '➖ Hide' : '➕ Add Custom Prompt'}
              </button>
            </div>
            {showPromptInput && (
              <>
                <textarea
                  className="form-textarea"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your custom analysis prompt here... (Leave empty to use default professional analysis)"
                  disabled={loading}
                  rows={6}
                />
                <small style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'block' }}>
                  💡 Tip: Be specific about what insights you want. Default prompt includes SEO, UX, monetization, and virality analysis.
                </small>
              </>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? '⏳ Scraping...' : '💾 Scrape & Save'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            {loading ? '⏳ Loading...' : '👁️ Preview Only'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScrapeForm;
