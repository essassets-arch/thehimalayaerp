import React, { useState, useEffect } from 'react';

const LeadSyncMonitor = () => {
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    syncCount: 0,
    errors: [],
    health: 'healthy'
  });

  useEffect(() => {
    // Check sync health periodically
    const interval = setInterval(() => {
      checkSyncHealth();
    }, 60000); // Every minute

    checkSyncHealth(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const checkSyncHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        syncCount: prev.syncCount + 1,
        health: data.status === 'healthy' || data.status === 'Online' ? 'healthy' : 'degraded'
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        errors: [...prev.errors, { time: new Date().toISOString(), error: error.message }],
        health: 'unhealthy'
      }));
    }
  };

  return (
    <div className="sync-monitor" style={{
      padding: '16px',
      background: '#ffffff',
      border: '1px solid #D6E2F0',
      borderRadius: '12px',
      fontFamily: 'inherit',
      color: '#1e293b'
    }}>
      <div className="status-indicator" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontWeight: '700'
      }}>
        <span className={`dot ${syncStatus.health}`} style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          display: 'inline-block',
          background: syncStatus.health === 'healthy' ? '#10b981' : (syncStatus.health === 'degraded' ? '#eab308' : '#ef4444'),
          boxShadow: `0 0 8px ${syncStatus.health === 'healthy' ? '#10b981' : (syncStatus.health === 'degraded' ? '#eab308' : '#ef4444')}`
        }} />
        <span>Sync Status: <span style={{ textTransform: 'uppercase', color: syncStatus.health === 'healthy' ? '#10b981' : '#ef4444' }}>{syncStatus.health}</span></span>
      </div>
      
      <div className="stats" style={{
        fontSize: '13px',
        color: '#5E6B82',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div>Last Sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : 'Never'}</div>
        <div>Total Syncs: {syncStatus.syncCount}</div>
        <div>Errors Logged: {syncStatus.errors.length}</div>
      </div>
      
      {syncStatus.errors.length > 0 && (
        <div className="errors" style={{
          marginTop: '12px',
          borderTop: '1px solid #DCE5F0',
          paddingTop: '8px'
        }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#ef4444' }}>Recent Errors:</h4>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#ef4444' }}>
            {syncStatus.errors.slice(-5).map((err, i) => (
              <li key={i}>
                {new Date(err.time).toLocaleTimeString()}: {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LeadSyncMonitor;
