import { useState } from 'react';
import { showSuccess } from '../utils/toast';
import '../components.css';

const DataDisplay = ({ data }) => {
  const [activeTab, setActiveTab] = useState('ai-analysis');
  const [expandedSections, setExpandedSections] = useState({});

  if (!data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
           No data to display. Scrape a URL to see results here.
        </p>
      </div>
    );
  }

  console.log('DataDisplay received data:', data);

  // Handle different data structures
  const content = data.content || data;
  
  // Try to get AI analysis from multiple possible locations
  let analysis = null;
  if (content.aiAnalysis) {
    analysis = content.aiAnalysis;
  } else if (data.ai_analysis) {
    analysis = data.ai_analysis;
  } else if (data.content && data.content.aiAnalysis) {
    analysis = data.content.aiAnalysis;
  }

  console.log('Extracted analysis:', analysis);

  const stats = content.contentStats || {};

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('📋 Copied to clipboard!');
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scraped-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('📥 JSON downloaded successfully!');
  };

  const renderOriginalData = () => (
    <div className="fade-in">
      {/* Header Info */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}> Page Information</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--color-text-secondary)' }}>Title:</strong>
            <p style={{ color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>{content.title || 'N/A'}</p>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-secondary)' }}>URL:</strong>
            <a href={content.url} target="_blank" rel="noopener noreferrer" 
               style={{ color: '#4299e1', marginTop: '0.5rem', display: 'block', wordBreak: 'break-all' }}>
              {content.url}
            </a>
          </div>
          {content.description && (
            <div>
              <strong style={{ color: 'var(--color-text-secondary)' }}>Description:</strong>
              <p style={{ color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>{content.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Stats */}
      {stats.wordCount > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}> Content Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="badge badge-secondary"> {stats.wordCount?.toLocaleString()} words</div>
            <div className="badge badge-secondary"> {stats.readingTime} min read</div>
            {stats.hasVideo && <div className="badge badge-success"> Video</div>}
            {stats.hasAudio && <div className="badge badge-success"> Audio</div>}
            {stats.hasForm && <div className="badge badge-success"> Form</div>}
          </div>
        </div>
      )}

      {/* Metadata */}
      {content.metadata && Object.keys(content.metadata).length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}> Metadata</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {content.metadata.author && <div><strong>Author:</strong> {content.metadata.author}</div>}
            {content.metadata.keywords && <div><strong>Keywords:</strong> {content.metadata.keywords}</div>}
            {content.metadata.canonical && <div><strong>Canonical:</strong> {content.metadata.canonical}</div>}
          </div>
        </div>
      )}

      {/* Headings */}
      {content.headings && content.headings.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}> Page Structure</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {content.headings.map((heading, i) => (
              <div key={i} style={{ marginLeft: `${(heading.level - 1) * 20}px`, marginBottom: '0.5rem' }}>
                <span className="badge badge-secondary" style={{ marginRight: '0.5rem' }}>H{heading.level}</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{heading.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paragraphs */}
      {content.paragraphs && content.paragraphs.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => toggleSection('paragraphs')} className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
            {expandedSections.paragraphs ? '' : ''} Content Paragraphs ({content.paragraphs.length})
          </button>
          {expandedSections.paragraphs && (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {content.paragraphs.slice(0, 10).map((para, i) => (
                <p key={i} style={{ color: 'var(--color-text-primary)', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-medium-grey)' }}>
                  {para}
                </p>
              ))}
              {content.paragraphs.length > 10 && <p style={{ color: 'var(--color-text-muted)' }}>...and {content.paragraphs.length - 10} more</p>}
            </div>
          )}
        </div>
      )}

      {/* Links */}
      {content.links && content.links.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => toggleSection('links')} className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
            {expandedSections.links ? '' : ''} Links ({content.links.length})
          </button>
          {expandedSections.links && (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {content.links.slice(0, 20).map((link, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4299e1', wordBreak: 'break-all' }}>
                    {link.text || link.url}
                  </a>
                  {link.external && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>External</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Images */}
      {content.images && content.images.length > 0 && (
        <div className="card">
          <button onClick={() => toggleSection('images')} className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
            {expandedSections.images ? '' : ''} Images ({content.images.length})
          </button>
          {expandedSections.images && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {content.images.slice(0, 12).map((img, i) => (
                <div key={i}>
                  <img src={img.src} alt={img.alt} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--color-medium-grey)' }} />
                  {img.alt && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>{img.alt}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAIAnalysis = () => {
    console.log('renderAIAnalysis called, analysis:', analysis);
    
    if (!analysis || Object.keys(analysis).length === 0) {
      return (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
             No AI analysis available
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Make sure "Analyze with AI" is enabled when scraping.
          </p>
        </div>
      );
    }

    return (
      <div className="fade-in">
        {/* Summary */}
        {analysis.summary && (
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #4299e1' }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}> Executive Summary</h3>
            <p style={{ color: 'var(--color-text-primary)', lineHeight: '1.8', fontSize: '1.05rem' }}>{analysis.summary}</p>
          </div>
        )}

        {/* Key Points */}
        {analysis.keyPoints && analysis.keyPoints.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}> Key Points</h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              {analysis.keyPoints.map((point, i) => (
                <li key={i} style={{ color: 'var(--color-text-primary)', marginBottom: '0.75rem', lineHeight: '1.6' }}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Scores Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Content Quality */}
          {analysis.contentQuality && (
            <div className="card" style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Content Quality</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
                {analysis.contentQuality.score || 'N/A'}
              </div>
              <div className="badge badge-primary">{analysis.contentQuality.rating}</div>
            </div>
          )}

          {/* Trust Score */}
          {analysis.credibility && (
            <div className="card" style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Trust Score</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
                {analysis.credibility.trustScore || 'N/A'}
              </div>
              <div className="badge badge-secondary">Credibility</div>
            </div>
          )}

          {/* Monetization */}
          {analysis.monetizationPotential && (
            <div className="card" style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Monetization</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
                {analysis.monetizationPotential.score || 'N/A'}
              </div>
              <div className="badge badge-warning">Potential</div>
            </div>
          )}

          {/* Virality */}
          {analysis.viralityScore && (
            <div className="card" style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Virality</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>
                {analysis.viralityScore.score || 'N/A'}
              </div>
              <div className="badge badge-error">Share Potential</div>
            </div>
          )}
        </div>

        {/* SEO Analysis */}
        {analysis.seoAnalysis && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => toggleSection('seo')} className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
              {expandedSections.seo ? '' : ''}  SEO Analysis
            </button>
            {expandedSections.seo && (
              <div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div><strong>Title Optimization:</strong> {analysis.seoAnalysis.titleOptimization}</div>
                  <div><strong>Meta Description:</strong> {analysis.seoAnalysis.metaDescription}</div>
                  <div><strong>Header Structure:</strong> {analysis.seoAnalysis.headerStructure}</div>
                  <div><strong>Keyword Density:</strong> {analysis.seoAnalysis.keywordDensity}</div>
                </div>
                {analysis.seoAnalysis.recommendations && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Recommendations:</strong>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {analysis.seoAnalysis.recommendations.map((rec, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* UX Assessment */}
        {analysis.uxAssessment && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => toggleSection('ux')} className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
              {expandedSections.ux ? '' : ''}  UX Assessment
            </button>
            {expandedSections.ux && (
              <div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div><strong>Readability:</strong> {analysis.uxAssessment.readability}/100</div>
                  <div><strong>Visual Hierarchy:</strong> {analysis.uxAssessment.visualHierarchy}</div>
                  <div><strong>Call to Action:</strong> {analysis.uxAssessment.callToAction}</div>
                  <div><strong>Mobile Optimization:</strong> {analysis.uxAssessment.mobileOptimization}</div>
                </div>
                {analysis.uxAssessment.improvements && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Improvements:</strong>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {analysis.uxAssessment.improvements.map((imp, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Strategic Insights */}
        <div className="grid grid-2">
          {/* Competitive Advantages */}
          {analysis.competitiveAdvantages && (
            <div className="card">
              <h4 style={{ color: '#10b981', marginBottom: '1rem' }}> Strengths</h4>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {analysis.competitiveAdvantages.map((adv, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{adv}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {analysis.weaknesses && (
            <div className="card">
              <h4 style={{ color: '#ef4444', marginBottom: '1rem' }}> Weaknesses</h4>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {analysis.weaknesses.map((weak, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{weak}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {analysis.recommendations && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}> Strategic Recommendations</h3>
            <ol style={{ paddingLeft: '1.5rem' }}>
              {analysis.recommendations.map((rec, i) => (
                <li key={i} style={{ marginBottom: '0.75rem', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>{rec}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {analysis.category && <div className="badge badge-primary">Category: {analysis.category}</div>}
          {analysis.sentiment && <div className="badge badge-secondary">Sentiment: {analysis.sentiment}</div>}
          {analysis.targetAudience && <div className="badge badge-secondary" style={{ maxWidth: '100%', whiteSpace: 'normal' }}>Target: {analysis.targetAudience}</div>}
        </div>
      </div>
    );
  };

  const renderRawJSON = () => (
    <div className="fade-in">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--color-text-primary)' }}> Raw JSON Data</h3>
          <button onClick={() => copyToClipboard(JSON.stringify(data, null, 2))} className="btn btn-secondary">
             Copy
          </button>
        </div>
        <pre style={{ 
          background: 'var(--color-black)', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          overflow: 'auto',
          maxHeight: '600px',
          color: '#10b981',
          fontSize: '0.9rem'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="data-display-container">
      {/* Header with Title and Actions */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--color-darker-grey) 0%, var(--color-medium-grey) 100%)', border: '2px solid var(--color-light-grey)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '0.75rem', fontSize: '1.75rem' }}>
              {content.title || 'Untitled Page'}
            </h2>
            <a href={content.url} target="_blank" rel="noopener noreferrer" 
               style={{ color: '#4299e1', textDecoration: 'none', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔗</span> {content.url}
            </a>
            {content.customPromptUsed && (
              <div className="badge badge-warning" style={{ marginTop: '0.75rem' }}>
                 Custom Prompt Used
              </div>
            )}
          </div>
          <button onClick={downloadJSON} className="btn btn-primary">
             Download JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--color-medium-grey)', paddingBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('ai-analysis')}
            className={activeTab === 'ai-analysis' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
             AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('original-data')}
            className={activeTab === 'original-data' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
             Original Data
          </button>
          <button
            onClick={() => setActiveTab('raw-json')}
            className={activeTab === 'raw-json' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
             Raw JSON
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'ai-analysis' && renderAIAnalysis()}
      {activeTab === 'original-data' && renderOriginalData()}
      {activeTab === 'raw-json' && renderRawJSON()}
    </div>
  );
};

export default DataDisplay;

