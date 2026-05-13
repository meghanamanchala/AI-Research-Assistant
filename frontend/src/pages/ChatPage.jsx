import { useEffect, useState } from 'react';
import { askQuestion, listDocuments } from '../services/api';

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
    <section className="stack">
      <div className="card">
        <h1>Ask Questions</h1>
        <form className="stack-form" onSubmit={handleAsk}>
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
            Question
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={5} />
          </label>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </div>

      {answer ? (
        <div className="card">
          <h2>Answer</h2>
          <pre className="answer-box">{answer}</pre>
          <h3>Sources</h3>
          <div className="source-grid">
            {sources.map((source, index) => (
              <article className="source-card" key={`${source.document_id || 'source'}-${index}`}>
                <strong>{source.filename}</strong>
                <p>{source.chunk_preview}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
