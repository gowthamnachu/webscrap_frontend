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
                gap: '1rem'
              }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                    {item.title || 'Untitled'}
                  </h4>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#4299e1', fontSize: '0.9rem', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
                    🔗 {item.url}
                  </a>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    ⏰ {new Date(item.created_at).toLocaleString()}
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
