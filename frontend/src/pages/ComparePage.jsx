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
    <section className="stack">
      <div className="card">
        <h1>Compare Documents</h1>
        <div className="stack-form two-col">
          <label>
            First document
            <select value={leftId} onChange={(event) => setLeftId(event.target.value)}>
              {documents.map((document) => (
                <option key={document.document_id} value={document.document_id}>
                  {document.filename}
                </option>
              ))}
            </select>
          </label>
          <label>
            Second document
            <select value={rightId} onChange={(event) => setRightId(event.target.value)}>
              {documents.map((document) => (
                <option key={document.document_id} value={document.document_id}>
                  {document.filename}
                </option>
              ))}
            </select>
          </label>
          <button className="button" type="button" onClick={handleCompare} disabled={loading}>
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </div>

      {comparison ? (
        <div className="card">
          <h2>Comparison</h2>
          <pre className="answer-box">{comparison}</pre>
        </div>
      ) : null}
    </section>
  );
}
