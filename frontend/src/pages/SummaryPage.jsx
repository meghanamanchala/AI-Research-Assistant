import { useEffect, useState } from 'react';
import { listDocuments, summarizeDocument, extractTopics } from '../services/api';
import { AlertCircle, ClipboardList, FileText, LoaderCircle, Sparkles, Tags } from 'lucide-react';

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
    <div className="page-container">
      {/* Summary Generator Section */}
      <section className="page-section">
        <div className="section-header">
          <div className="section-icon"><ClipboardList size={44} strokeWidth={1.75} /></div>
          <div>
            <h1>Generate Summary</h1>
            <p className="section-description">Create concise summaries of your documents in bullet or paragraph format</p>
          </div>
        </div>
        
        <div className="section-content">
          <div className="summary-form">
            <div className="form-group">
              <label>Document</label>
              <select value={documentId} onChange={(event) => setDocumentId(event.target.value)} disabled={documents.length === 0}>
                {documents.length === 0 ? <option value="">No documents available</option> : null}
                {documents.map((document) => (
                  <option key={document.document_id} value={document.document_id}>
                    {document.filename}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Output Format</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" value="bullet" checked={style === 'bullet'} onChange={(event) => setStyle(event.target.value)} />
                  <span>Bullet Points</span>
                </label>
                <label className="radio-label">
                  <input type="radio" value="paragraph" checked={style === 'paragraph'} onChange={(event) => setStyle(event.target.value)} />
                  <span>Paragraph</span>
                </label>
              </div>
            </div>
            
            <button className="button button-primary" type="button" onClick={handleGenerate} disabled={loading}>
              {loading ? <><LoaderCircle className="button-icon spin" size={18} strokeWidth={2} /> Generating...</> : <><Sparkles className="button-icon" size={18} strokeWidth={2} /> Generate Summary</>}
            </button>
          </div>
          {error ? <p className="error"><AlertCircle className="status-icon" size={16} strokeWidth={2} />{error}</p> : null}
        </div>
      </section>

      {/* Summary Output Section */}
      {summary ? (
        <section className="page-section">
          <div className="section-header">
            <div className="section-icon"><FileText size={44} strokeWidth={1.75} /></div>
            <h2>Summary</h2>
          </div>
          
          <div className="section-content">
            <pre className="answer-box">{summary}</pre>
            
            {topics.length > 0 && (
              <div className="topics-section">
                <h3><Tags size={18} strokeWidth={2} /> Key Topics</h3>
                <div className="chip-list">
                  {topics.map((topic) => (
                    <span className="chip" key={topic}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
