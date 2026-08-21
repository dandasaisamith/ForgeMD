import { useState, useEffect } from 'react';
import { FileText, Settings, History, Upload, Activity } from 'lucide-react';
import { getHealth } from './api.js';
import Dashboard from './pages/Dashboard.jsx';
import Documents from './pages/Documents.jsx';
import SettingsPage from './pages/Settings.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(console.error);
    
    const handleKeyDown = (e) => {
      // Basic global shortcuts could be added here
      if (e.key === 'Escape') {
        // close modals logic
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard onConvert={(id) => setCurrentPage('documents')} />;
      case 'documents': return <Documents />;
      case 'settings': return <SettingsPage health={health} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <FileText size={24} color="var(--accent-color)" />
          ForgeMD
        </div>
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && setCurrentPage('dashboard')}
          >
            <Upload size={18} /> Convert
          </div>
          <div 
            className={`nav-item ${currentPage === 'documents' ? 'active' : ''}`}
            onClick={() => setCurrentPage('documents')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && setCurrentPage('documents')}
          >
            <History size={18} /> History
          </div>
          <div 
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && setCurrentPage('settings')}
          >
            <Settings size={18} /> Settings
          </div>
        </nav>
        {health && (
          <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={14} color={health.status === 'ok' ? 'var(--success-color)' : 'var(--error-color)'} />
              Server: {health.status.toUpperCase()}
            </div>
            <div>System RAM Used: {health.memory.system.usedPercent}%</div>
          </div>
        )}
      </aside>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
