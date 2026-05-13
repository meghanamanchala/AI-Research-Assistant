import { useEffect, useState } from 'react';
import { generateQuiz, listDocuments } from '../services/api';

export default function QuizPage() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [count, setCount] = useState(5);
  const [items, setItems] = useState([]);
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

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const response = await generateQuiz({ document_id: documentId || null, count: Number(count) });
      setItems(response.items || []);
    } catch (quizError) {
      setError(quizError?.response?.data?.detail || 'Quiz generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack">
      <div className="card">
        <h1>Quiz Generator</h1>
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
            Number of questions
            <input type="number" min="1" max="20" value={count} onChange={(event) => setCount(event.target.value)} />
          </label>
          <button className="button" type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </div>

      {items.length > 0 ? (
        <div className="card stack">
          <h2>Questions</h2>
          {items.map((item, index) => (
            <article className="quiz-card" key={`${index}-${item.question}`}>
              <h3>{index + 1}. {item.question}</h3>
              <div className="quiz-options">
                {item.options.map((option) => (
                  <span className="chip" key={option}>
                    {option}
                  </span>
                ))}
              </div>
              <p className="muted">Answer: {item.answer}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
