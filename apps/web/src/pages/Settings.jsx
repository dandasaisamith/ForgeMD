import { Server, Cpu, HardDrive, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Settings({ health }) {
  if (!health) return <div>Loading settings...</div>;

  const getStatusColor = (status) => {
    if (status === 'READY' || status === 'ok') return 'var(--success-color)';
    if (status === 'MISSING') return 'var(--error-color)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>System Settings & Health</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>ForgeMD runs entirely on your local hardware.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Server color="var(--accent-color)" />
            <h3>Server Status</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>API Status</span>
            <strong style={{ color: getStatusColor(health.status) }}>{health.status.toUpperCase()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Uptime</span>
            <strong>{Math.floor(health.uptime / 60)} mins</strong>
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Cpu color="var(--accent-color)" />
            <h3>Memory Usage</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total System RAM</span>
            <strong>{(health.memory.system.total / 1024 / 1024 / 1024).toFixed(2)} GB</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>System Used</span>
            <strong>{health.memory.system.usedPercent}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>App RSS Memory</span>
            <strong>{(health.memory.application.rss / 1024 / 1024).toFixed(2)} MB</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <HardDrive color="var(--accent-color)" />
            <h3>Conversion Engines</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div>
                <strong>PDF Engine (pdftotext)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Extracts text from PDF files</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor(health.engines.pdftotext) }}>
                {health.engines.pdftotext === 'READY' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                {health.engines.pdftotext}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div>
                <strong>DOCX Engine (pandoc)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Converts DOCX to Markdown</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor(health.engines.pandoc) }}>
                {health.engines.pandoc === 'READY' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                {health.engines.pandoc}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div>
                <strong>AI Engine (Ollama)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Optional local AI (TinyLlama) for text cleanup</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor(health.engines.ai) }}>
                {health.engines.ai === 'READY' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} color="var(--text-secondary)" />}
                {health.engines.ai}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
