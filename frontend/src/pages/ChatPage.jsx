import { useEffect, useState } from 'react';
import { askQuestion, listDocuments } from '../services/api';
import { AlertCircle, Bookmark, Lightbulb, LoaderCircle, MessageSquareText, Search } from 'lucide-react';

export default function ChatPage() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [question, setQuestion] = useState('What is this document about?');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listDocuments().then((data) => {
      setDocuments(data);
      if (data.length > 0) {
        setDocumentId(data[0].document_id);
      }
    }).catch(() => setError('Could not load documents.'));
  }, []);

  async function handleAsk(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const response = await askQuestion({ question, document_id: documentId || null });
      setAnswer(response.answer);
      setSources(response.sources || []);
    } catch (askError) {
      setError(askError?.response?.data?.detail || 'Question failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      {/* Chat Section */}
      <section className="page-section">
        <div className="section-header">
          <div className="section-icon"><MessageSquareText size={44} strokeWidth={1.75} /></div>
          <div>
            <h1>Chat with Documents</h1>
            <p className="section-description">Ask questions and get instant answers from your research materials</p>
          </div>
        </div>
        
        <div className="section-content">
          <form className="chat-form" onSubmit={handleAsk}>
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
              <label>Your Question</label>
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} placeholder="What would you like to know about this document?" />
            </div>
            
            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? <><LoaderCircle className="button-icon spin" size={18} strokeWidth={2} /> Thinking...</> : <><Search className="button-icon" size={18} strokeWidth={2} /> Ask</>}
            </button>
          </form>
          {error ? <p className="error"><AlertCircle className="status-icon" size={16} strokeWidth={2} />{error}</p> : null}
        </div>
      </section>

      {/* Answer Section */}
      {answer ? (
        <section className="page-section">
          <div className="section-header">
            <div className="section-icon"><Lightbulb size={44} strokeWidth={1.75} /></div>
            <h2>Answer</h2>
          </div>
          
          <div className="section-content">
            <pre className="answer-box">{answer}</pre>
            
            {sources.length > 0 && (
              <div className="sources-section">
                <h3><Bookmark size={18} strokeWidth={2} /> Sources</h3>
                <div className="source-grid">
                  {sources.map((source, index) => (
                    <article className="source-card" key={`${source.document_id || 'source'}-${index}`}>
                      <strong>{source.filename}</strong>
                      <p>{source.chunk_preview}</p>
                    </article>
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
