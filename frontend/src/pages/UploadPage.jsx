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
    <section className="stack">
      <div className="card">
        <h1>Upload PDF</h1>
        <p className="muted">The backend stores uploaded PDFs and indexes them for retrieval.</p>
        <form className="upload-form" onSubmit={handleUpload}>
          <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {status ? <p className="success">{status}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="card">
        <h2>Stored Documents</h2>
        <div className="document-list">
          {documents.length === 0 ? (
            <p className="muted">No documents uploaded yet.</p>
          ) : (
            documents.map((document) => (
              <article key={document.document_id} className="document-item">
                <strong>{document.filename}</strong>
                <span>{document.page_count} pages</span>
                <span>{document.chunk_count} chunks</span>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
