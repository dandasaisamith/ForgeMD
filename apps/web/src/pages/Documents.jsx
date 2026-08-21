import { useState, useEffect } from 'react';
import { getDocuments, getGroups, createGroup, updateGroup, deleteGroup, updateDocument } from '../api.js';
import { FileText, Download, Eye, AlertCircle, Clock, CheckCircle, Folder, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import Viewer from './Viewer.jsx';

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingId, setViewingId] = useState(null);
  
  const [selectedGroupId, setSelectedGroupId] = useState(''); // '' means All, 'unassigned' means null
  
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');

  const [editingFileId, setEditingFileId] = useState(null);
  const [editFileName, setEditFileName] = useState('');

  const fetchData = async () => {
    try {
      const [docsData, groupsData] = await Promise.all([getDocuments(), getGroups()]);
      setDocs(docsData);
      setGroups(groupsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // poll for status updates
    return () => clearInterval(interval);
  }, []);

  if (viewingId) {
    return <Viewer id={viewingId} onBack={() => setViewingId(null)} />;
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await createGroup(newGroupName);
    setNewGroupName('');
    setIsCreatingGroup(false);
    fetchData();
  };

  const handleRenameGroup = async (id) => {
    if (!editGroupName.trim()) return;
    await updateGroup(id, editGroupName);
    setEditingGroupId(null);
    fetchData();
  };

  const handleDeleteGroup = async (id) => {
    if (confirm('Are you sure you want to delete this group? The documents will be kept.')) {
      await deleteGroup(id);
      if (selectedGroupId === id) setSelectedGroupId('');
      fetchData();
    }
  };

  const handleRenameFile = async (id) => {
    if (!editFileName.trim()) return;
    await updateDocument(id, { filename: editFileName });
    setEditingFileId(null);
    fetchData();
  };

  const handleAssignGroup = async (docId, groupId) => {
    await updateDocument(docId, { group_id: groupId });
    fetchData();
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle size={18} color="var(--success-color)" />;
      case 'ERROR': return <AlertCircle size={18} color="var(--error-color)" />;
      case 'CONVERTING': return <Clock size={18} color="var(--accent-color)" />;
      default: return <Clock size={18} color="var(--text-secondary)" />;
    }
  };

  const filteredDocs = docs.filter(d => {
    if (selectedGroupId === '') return true;
    if (selectedGroupId === 'unassigned') return !d.group_id;
    return d.group_id === selectedGroupId;
  });

  const selectedGroupObj = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '24px', maxWidth: '1200px', margin: '0 auto', alignItems: 'flex-start' }}>
      
      {/* Sidebar: Groups */}
      <aside className="glass-panel" style={{ width: '250px', flexShrink: 0 }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Folder size={18} /> Groups
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={selectedGroupId === '' ? 'primary' : 'secondary'} 
            style={{ justifyContent: 'flex-start', border: 'none', background: selectedGroupId === '' ? '' : 'transparent', textAlign: 'left' }}
            onClick={() => setSelectedGroupId('')}
          >
            All Documents
          </button>
          
          <button 
            className={selectedGroupId === 'unassigned' ? 'primary' : 'secondary'} 
            style={{ justifyContent: 'flex-start', border: 'none', background: selectedGroupId === 'unassigned' ? '' : 'transparent', textAlign: 'left' }}
            onClick={() => setSelectedGroupId('unassigned')}
          >
            Unassigned
          </button>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '8px 0' }} />

          {groups.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {editingGroupId === g.id ? (
                <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                  <input 
                    value={editGroupName} 
                    onChange={e => setEditGroupName(e.target.value)} 
                    style={{ flex: 1, padding: '4px' }}
                    autoFocus
                  />
                  <button className="primary" style={{ padding: '4px' }} onClick={() => handleRenameGroup(g.id)}><Check size={14}/></button>
                  <button className="secondary" style={{ padding: '4px' }} onClick={() => setEditingGroupId(null)}><X size={14}/></button>
                </div>
              ) : (
                <>
                  <button 
                    className={selectedGroupId === g.id ? 'primary' : 'secondary'} 
                    style={{ flex: 1, justifyContent: 'flex-start', border: 'none', background: selectedGroupId === g.id ? '' : 'transparent', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    onClick={() => setSelectedGroupId(g.id)}
                  >
                    <Folder size={14} style={{ marginRight: '8px', opacity: 0.7 }} /> {g.name}
                  </button>
                  <button className="secondary" style={{ padding: '4px', background: 'transparent', border: 'none' }} onClick={() => { setEditingGroupId(g.id); setEditGroupName(g.name); }}>
                    <Edit2 size={14} />
                  </button>
                  <button className="secondary" style={{ padding: '4px', background: 'transparent', border: 'none' }} onClick={() => handleDeleteGroup(g.id)}>
                    <Trash2 size={14} color="var(--error-color)" />
                  </button>
                </>
              )}
            </div>
          ))}

          {isCreatingGroup ? (
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <input 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)} 
                placeholder="New Group..." 
                style={{ flex: 1, padding: '4px' }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
              />
              <button className="primary" style={{ padding: '4px' }} onClick={handleCreateGroup}><Check size={14}/></button>
              <button className="secondary" style={{ padding: '4px' }} onClick={() => setIsCreatingGroup(false)}><X size={14}/></button>
            </div>
          ) : (
            <button className="secondary" style={{ marginTop: '8px', borderStyle: 'dashed' }} onClick={() => setIsCreatingGroup(true)}>
              <Plus size={16} /> Create Group
            </button>
          )}
        </div>
      </aside>

      {/* Main Content: Documents */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0 }}>
              {selectedGroupObj ? selectedGroupObj.name : (selectedGroupId === 'unassigned' ? 'Unassigned Documents' : 'All Documents')}
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>View, edit, and organize your files.</p>
          </div>
          
          {selectedGroupObj && (
            <a href={`/api/groups/${selectedGroupObj.id}/download`} download style={{ textDecoration: 'none' }}>
              <button className="primary" style={{ gap: '8px' }}>
                <Download size={18} /> Download Group ZIP
              </button>
            </a>
          )}
        </div>
        
        {loading && docs.length === 0 ? (
          <div>Loading...</div>
        ) : (
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                <tr>
                  <th style={{ padding: '16px' }}>Filename</th>
                  <th style={{ padding: '16px' }}>Group</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id} style={{ borderTop: '1px solid var(--panel-border)' }}>
                    <td style={{ padding: '16px' }}>
                      {editingFileId === doc.id ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input 
                            value={editFileName} 
                            onChange={e => setEditFileName(e.target.value)} 
                            style={{ flex: 1 }}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleRenameFile(doc.id)}
                          />
                          <button className="primary" style={{ padding: '6px' }} onClick={() => handleRenameFile(doc.id)}><Check size={14}/></button>
                          <button className="secondary" style={{ padding: '6px' }} onClick={() => setEditingFileId(null)}><X size={14}/></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={18} color="var(--text-secondary)" />
                          {doc.filename}
                          <button className="secondary" style={{ padding: '4px', background: 'transparent', border: 'none', marginLeft: 'auto' }} onClick={() => { setEditingFileId(doc.id); setEditFileName(doc.filename); }}>
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={doc.group_id || ''} 
                        onChange={(e) => handleAssignGroup(doc.id, e.target.value)}
                        style={{ padding: '6px', borderRadius: '4px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                      >
                        <option value="">-- None --</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getStatusIcon(doc.status)}
                        <span style={{ fontSize: '0.9rem' }}>{doc.status}</span>
                      </div>
                      {doc.error && <div style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '4px' }}>{doc.error}</div>}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="secondary" 
                          style={{ padding: '6px 12px' }}
                          disabled={doc.status !== 'COMPLETED'}
                          onClick={() => setViewingId(doc.id)}
                        >
                          <Eye size={16} /> View
                        </button>
                        <a 
                          href={`/api/documents/${doc.id}/download`} 
                          download
                          style={{ textDecoration: 'none' }}
                        >
                          <button 
                            style={{ padding: '6px 12px' }}
                            disabled={doc.status !== 'COMPLETED'}
                          >
                            <Download size={16} />
                          </button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No documents found in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
