import { useState, useEffect } from 'react';
import { dataAPI } from '../services/api';
import { showSuccess, showError, showWarning, showLoading, updateToast } from '../utils/toast';
import '../components.css';

const Dashboard = ({ onDataSelect }) => {
  const [stats, setStats] = useState(null);
  const [recentData, setRecentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh dashboard every 5 minutes
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, dataRes] = await Promise.all([
        dataAPI.getStatistics(),
        dataAPI.getAllData(1, 5)
      ]);
      setStats(statsRes.data.data);
      setRecentData(dataRes.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this data?')) return;
    
    const toastId = showLoading('Deleting...');
    
    try {
      const response = await dataAPI.deleteData(id);
      updateToast(toastId, 'success', response.data.message || 'Deleted successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete';
      updateToast(toastId, 'error', errorMessage);
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    // For older dates, show the actual date
    return past.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Helper function to check if scrape is from today or last 24 hours
  const isRecentScrape = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = (now - past) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <div className="spinner spinner-large" style={{ margin: '0 auto' }}></div>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '1.5rem', fontSize: '2rem' }}>📊 Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            {stats?.totalScraped || 0}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Total Scraped</div>
          <div className="badge badge-primary" style={{ marginTop: '0.75rem' }}>📝 Pages</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            {stats?.uniqueUrls || 0}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Unique URLs</div>
          <div className="badge badge-secondary" style={{ marginTop: '0.75rem' }}>🔗 Sources</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
            {stats?.recentScrapes || 0}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Last 24 Hours</div>
          <div className="badge badge-success" style={{ marginTop: '0.75rem' }}>⏰ Recent</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>📜 Recent Scrapes</h3>
        {recentData.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No data found. Start scraping to see results here!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentData.map((item) => {
              const isRecent = isRecentScrape(item.created_at);
              const timeAgo = getTimeAgo(item.created_at);
              
              return (
                <div key={item.id} className="card" style={{ 
                  padding: '1.25rem', 
                  background: 'var(--color-dark-grey)', 
                  border: isRecent ? '1px solid #10b981' : '1px solid var(--color-medium-grey)',
                  borderLeft: isRecent ? '4px solid #10b981' : '1px solid var(--color-medium-grey)',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  position: 'relative'
                }}>
                  {isRecent && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '0.75rem', 
                      right: '0.75rem',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      background: '#10b981',
                      color: '#000',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      🔥 NEW
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                      {item.title || 'Untitled'}
                    </h4>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" 
                       style={{ color: '#4299e1', fontSize: '0.9rem', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
                      🔗 {item.url}
                    </a>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ⏰ <span style={{ color: isRecent ? '#10b981' : 'var(--color-text-muted)', fontWeight: isRecent ? 'bold' : 'normal' }}>{timeAgo}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        📅 {new Date(item.created_at).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => onDataSelect && onDataSelect(item)}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 1.25rem' }}
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.75rem 1.25rem', borderColor: '#ef4444' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
