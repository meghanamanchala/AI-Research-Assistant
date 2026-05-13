import { useEffect, useState } from 'react';
import { listDocuments, summarizeDocument, extractTopics } from '../services/api';

export default function SummaryPage() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [style, setStyle] = useState('bullet');
  const [summary, setSummary] = useState('');
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listDocuments().then((data) => {
      setDocuments(data);
      if (data.length > 0) {
        setDocumentId(data[0].document_id);
      }
    }).catch(() => setError('Could not load documents.'));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const [summaryResponse, topicsResponse] = await Promise.all([
        summarizeDocument({ document_id: documentId || null, style }),
        extractTopics({ document_id: documentId || null }),
      ]);
      setSummary(summaryResponse.summary);
      setTopics(topicsResponse.topics || []);
    } catch (summaryError) {
      setError(summaryError?.response?.data?.detail || 'Summary failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack">
      <div className="card">
        <h1>Summary</h1>
        <div className="stack-form">
          <label>
            Document
            <select value={documentId} onChange={(event) => setDocumentId(event.target.value)}>
              {documents.length === 0 ? <option value="">No documents available</option> : null}
              {documents.map((document) => (
                <option key={document.document_id} value={document.document_id}>
                  {document.filename}
                </option>
              ))}
            </select>
          </label>
          <label>
            Style
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="bullet">Bullet</option>
              <option value="paragraph">Paragraph</option>
            </select>
          </label>
          <button className="button" type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </div>

      {summary ? (
        <div className="card">
          <h2>Summary Output</h2>
          <pre className="answer-box">{summary}</pre>
          <h3>Topics</h3>
          <div className="chip-list">
            {topics.map((topic) => (
              <span className="chip" key={topic}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
