import { useEffect, useState } from 'react';
import { compareDocuments, listDocuments } from '../services/api';

export default function ComparePage() {
  const [documents, setDocuments] = useState([]);
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [comparison, setComparison] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listDocuments().then((data) => {
      setDocuments(data);
      if (data.length > 0) {
        setLeftId(data[0].document_id);
        setRightId(data[1]?.document_id || data[0].document_id);
      }
    }).catch(() => setError('Could not load documents.'));
  }, []);

  async function handleCompare() {
    setLoading(true);
    setError('');
    try {
      const response = await compareDocuments({ document_ids: [leftId, rightId] });
      setComparison(response.comparison);
    } catch (compareError) {
      setError(compareError?.response?.data?.detail || 'Compare failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      {/* Compare Section */}
      <section className="page-section">
        <div className="section-header">
          <div className="section-icon">⚖️</div>
          <div>
            <h1>Compare Documents</h1>
            <p className="section-description">Analyze similarities and differences between your research documents</p>
          </div>
        </div>
        
        <div className="section-content">
          <div className="compare-form">
            <div className="compare-grid">
              <div className="form-group">
                <label>First Document</label>
                <select value={leftId} onChange={(event) => setLeftId(event.target.value)} disabled={documents.length === 0}>
                  {documents.length === 0 ? <option value="">No documents available</option> : null}
                  {documents.map((document) => (
                    <option key={document.document_id} value={document.document_id}>
                      {document.filename}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="compare-vs">VS</div>
              
              <div className="form-group">
                <label>Second Document</label>
                <select value={rightId} onChange={(event) => setRightId(event.target.value)} disabled={documents.length === 0}>
                  {documents.length === 0 ? <option value="">No documents available</option> : null}
                  {documents.map((document) => (
                    <option key={document.document_id} value={document.document_id}>
                      {document.filename}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button className="button button-primary" type="button" onClick={handleCompare} disabled={loading} style={{ alignSelf: 'flex-start' }}>
              {loading ? '⏳ Comparing...' : '🔍 Compare'}
            </button>
          </div>
          {error ? <p className="error">✕ {error}</p> : null}
        </div>
      </section>

      {/* Comparison Results Section */}
      {comparison ? (
        <section className="page-section">
          <div className="section-header">
            <div className="section-icon">📊</div>
            <h2>Comparison Results</h2>
          </div>
          
          <div className="section-content">
            <pre className="answer-box">{comparison}</pre>
          </div>
        </section>
      ) : null}
    </div>
  );
}
