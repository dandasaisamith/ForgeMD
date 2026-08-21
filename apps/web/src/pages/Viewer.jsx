import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Download } from 'lucide-react';
import { getDocument } from '../api.js';

export default function Viewer({ id, onBack }) {
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docData = await getDocument(id);
        setDoc(docData);
        
        const res = await fetch(`/api/documents/${id}/content`);
        if (res.ok) {
          const text = await res.text();
          setContent(text);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div>Loading document...</div>;
  if (!doc) return <div>Document not found.</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="secondary" onClick={onBack} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h2>{doc.filename} (Markdown)</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary" onClick={handleCopy}>
            {copied ? <Check size={18} color="var(--success-color)" /> : <Copy size={18} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <a href={`/api/documents/${doc.id}/download`} download style={{ textDecoration: 'none' }}>
            <button>
              <Download size={18} /> Download
            </button>
          </a>
        </div>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea 
          value={content}
          readOnly
          style={{ flex: 1, resize: 'none', border: 'none', background: 'transparent' }}
        />
      </div>
    </div>
  );
}
