const getApiUrl = (path) => {
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    return path;
  }
  return `http://127.0.0.1:3000${path}`;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(getApiUrl('/api/convert'), {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const uploadText = async (text, filename) => {
  const res = await fetch(getApiUrl('/api/convert/text'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, filename })
  });
  
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getDocuments = async () => {
  const res = await fetch(getApiUrl('/api/documents'));
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateDocument = async (id, data) => {
  const res = await fetch(getApiUrl(`/api/documents/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getGroups = async () => {
  const res = await fetch(getApiUrl('/api/groups'));
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createGroup = async (name) => {
  const res = await fetch(getApiUrl('/api/groups'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateGroup = async (id, name) => {
  const res = await fetch(getApiUrl(`/api/groups/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteGroup = async (id) => {
  const res = await fetch(getApiUrl(`/api/groups/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
};

export const getDocument = async (id) => {
  const res = await fetch(getApiUrl(`/api/documents/${id}`));
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getHealth = async () => {
  const res = await fetch(getApiUrl('/api/health'));
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
