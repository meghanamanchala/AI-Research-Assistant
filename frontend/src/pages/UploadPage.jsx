import { useEffect, useState } from 'react';
import { listDocuments, uploadDocument } from '../services/api';

export default function UploadPage() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function refreshDocuments() {
    const data = await listDocuments();
    setDocuments(data);
  }

  useEffect(() => {
    refreshDocuments().catch(() => setError('Could not load documents.'));
  }, []);

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) {
      setError('Choose a PDF first.');
      return;
    }
    setLoading(true);
    setError('');
    setStatus('Uploading document...');
    try {
      const result = await uploadDocument(file);
      setStatus(`Uploaded ${result.filename} with ${result.chunk_count} chunks.`);
      setFile(null);
      await refreshDocuments();
    } catch (uploadError) {
      setError(uploadError?.response?.data?.detail || 'Upload failed.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      {/* Upload Section */}
      <section className="page-section">
        <div className="section-header">
          <div className="section-icon">📄</div>
          <div>
            <h1>Upload Documents</h1>
            <p className="section-description">Add PDF files to your research library for analysis</p>
          </div>
        </div>
        
        <div className="section-content">
          <form className="upload-form-modern" onSubmit={handleUpload}>
            <label className="file-input-wrapper">
              <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              <span className="file-input-label">{file ? file.name : 'Choose PDF file'}</span>
            </label>
            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Uploading...' : '📤 Upload'}
            </button>
          </form>
          {status ? <p className="success">✓ {status}</p> : null}
          {error ? <p className="error">✕ {error}</p> : null}
        </div>
      </section>

      {/* Documents List Section */}
      <section className="page-section">
        <div className="section-header">
          <div className="section-icon">📚</div>
          <h2>Your Documents</h2>
        </div>
        
        <div className="section-content">
          {documents.length === 0 ? (
            <div className="empty-state">
              <p className="muted">No documents yet. Upload a PDF to get started.</p>
            </div>
          ) : (
            <div className="document-list">
              {documents.map((document) => (
                <article key={document.document_id} className="document-item-modern">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <strong>{document.filename}</strong>
                    <div className="doc-meta">
                      <span>{document.page_count} pages</span>
                      <span>•</span>
                      <span>{document.chunk_count} chunks</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
