import { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadFile, uploadText } from '../api.js';

export default function Dashboard({ onConvert }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, error
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleConvertText = async () => {
    if (!text.trim()) return;
    try {
      setStatus('uploading');
      const res = await uploadText(text, 'Pasted_Text.txt');
      onConvert(res.id);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handleConvertFile = async () => {
    if (!file) return;
    try {
      setStatus('uploading');
      const res = await uploadFile(file);
      onConvert(res.id);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Convert Document</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Convert TXT, PDF, or DOCX files to clean Markdown locally.</p>
      
      {status === 'error' && (
        <div className="glass-panel" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error-color)', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AlertCircle color="var(--error-color)" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h3>Paste Text</h3>
        <textarea 
          placeholder="Paste large text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={status === 'uploading'}
        />
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleConvertText} disabled={!text.trim() || status === 'uploading'}>
            {status === 'uploading' ? <Loader size={18} /> : <FileType size={18} />}
            Convert Text
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0', color: 'var(--text-secondary)', fontWeight: 'bold' }}>OR</div>

      <div className="glass-panel">
        <h3>Upload File</h3>
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--panel-border)',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            background: file ? 'rgba(255,255,255,0.05)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => setFile(e.target.files[0])}
            accept=".txt,.pdf,.docx"
            style={{ display: 'none' }}
          />
          {file ? (
            <div>
              <CheckCircle size={48} color="var(--success-color)" style={{ marginBottom: '16px', margin: '0 auto' }} />
              <h4>{file.name}</h4>
              <p style={{ color: 'var(--text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <UploadCloud size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', margin: '0 auto' }} />
              <h4>Click or drag file here</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Supports TXT, PDF, DOCX</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleConvertFile} disabled={!file || status === 'uploading'}>
             {status === 'uploading' ? <Loader size={18} /> : <UploadCloud size={18} />}
            Convert File
          </button>
        </div>
      </div>
    </div>
  );
}
