import { useState, useEffect } from 'react';
import { dataAPI } from '../services/api';
import { showSuccess, showError, showWarning, showLoading, updateToast, showInfo } from '../utils/toast';
import '../components.css';

const Dashboard = ({ onDataSelect }) => {
  const [stats, setStats] = useState(null);
  const [recentData, setRecentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh dashboard every 60 seconds
    const refreshInterval = setInterval(() => {
      if (autoRefresh) {
        loadDashboardData(true); // silent refresh
      }
    }, 60000); // 60 seconds

    // Auto-refresh stale URLs every 60 seconds
    const urlRefreshInterval = setInterval(() => {
      if (autoRefresh) {
        refreshStaleUrls();
      }
    }, 60000); // 60 seconds

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(urlRefreshInterval);
      clearInterval(countdownInterval);
    };
  }, [autoRefresh]);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const [statsRes, dataRes] = await Promise.all([
        dataAPI.getStatistics(),
        dataAPI.getAllData(1, 5)
      ]);
      setStats(statsRes.data.data);
      setRecentData(dataRes.data.data);
      setLastUpdated(new Date());
      setCountdown(60); // Reset countdown
      
      if (silent) {
        showInfo('Dashboard refreshed');
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      if (!silent) {
        showError('Failed to load dashboard data');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    showInfo('Refreshing dashboard...');
    loadDashboardData(false);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    showSuccess(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
  };

  const refreshStaleUrls = async () => {
    try {
      const response = await dataAPI.refreshStaleUrls(60000); // 60 seconds
      if (response.data.success) {
        showInfo(`🔄 ${response.data.message}`);
        // Reload dashboard to show updated data
        setTimeout(() => loadDashboardData(true), 2000);
      }
    } catch (error) {
      console.error('Failed to refresh stale URLs:', error);
      // Don't show error toast for background refresh - fail silently
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

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <div className="spinner spinner-large" style={{ margin: '0 auto' }}></div>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading dashboard...</p>
    </div>
  );

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000); // seconds
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastUpdated.toLocaleTimeString();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getDataFreshnessColor = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000); // minutes
    
    if (diff < 5) return '#10b981'; // green - very fresh
    if (diff < 30) return '#3b82f6'; // blue - fresh
    if (diff < 60) return '#f59e0b'; // yellow - getting old
    return '#ef4444'; // red - old
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--color-text-primary)', fontSize: '2rem', margin: 0 }}>📊 Dashboard</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Last Updated Info */}
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: 'var(--color-dark-grey)', 
            borderRadius: '8px',
            border: '1px solid var(--color-medium-grey)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              🕐 Updated: {formatLastUpdated()}
            </span>
            {autoRefresh && (
              <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                Next: {countdown}s
              </span>
            )}
          </div>

          {/* Auto-refresh Toggle */}
          <button
            onClick={toggleAutoRefresh}
            className={autoRefresh ? 'btn btn-success' : 'btn btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            {autoRefresh ? '✅ Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={handleRefresh}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>
      
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
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>📜 Recent Scrapes</h3>
        {recentData.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No data found. Start scraping to see results here!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentData.map((item) => (
              <div key={item.id} className="card" style={{ 
                padding: '1.25rem', 
                background: 'var(--color-dark-grey)', 
                border: '1px solid var(--color-medium-grey)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                position: 'relative'
              }}>
                {/* Freshness Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: getDataFreshnessColor(item.created_at),
                  boxShadow: `0 0 10px ${getDataFreshnessColor(item.created_at)}`,
                  animation: 'pulse 2s infinite'
                }}></div>

                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                      {item.title || 'Untitled'}
                    </h4>
                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                      {formatTimeAgo(item.created_at)}
                    </span>
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#4299e1', fontSize: '0.9rem', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
                    🔗 {item.url}
                  </a>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    ⏰ Scraped: {new Date(item.created_at).toLocaleString()}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
