import { useEffect, useState } from 'react';
import { generateQuiz, listDocuments } from '../services/api';
import { AlertCircle, BarChart3, CircleHelp, LoaderCircle, Target } from 'lucide-react';

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
    <div className="page-container">
      {/* Quiz Generator Section */}
      <section className="page-section">
        <div className="section-header">
          <div className="section-icon"><CircleHelp size={44} strokeWidth={1.75} /></div>
          <div>
            <h1>Generate Quiz</h1>
            <p className="section-description">Create multiple-choice questions from your documents to test comprehension</p>
          </div>
        </div>
        
        <div className="section-content">
          <div className="quiz-form">
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
              <label>Number of Questions ({count})</label>
              <input type="range" min="1" max="20" value={count} onChange={(event) => setCount(event.target.value)} className="slider" />
            </div>
            
            <button className="button button-primary" type="button" onClick={handleGenerate} disabled={loading}>
              {loading ? <><LoaderCircle className="button-icon spin" size={18} strokeWidth={2} /> Generating...</> : <><Target className="button-icon" size={18} strokeWidth={2} /> Generate Quiz</>}
            </button>
          </div>
          {error ? <p className="error"><AlertCircle className="status-icon" size={16} strokeWidth={2} />{error}</p> : null}
        </div>
      </section>

      {/* Quiz Results Section */}
      {items.length > 0 ? (
        <section className="page-section">
          <div className="section-header">
            <div className="section-icon"><BarChart3 size={44} strokeWidth={1.75} /></div>
            <h2>Questions ({items.length})</h2>
          </div>
          
          <div className="section-content">
            <div className="quiz-items">
              {items.map((item, index) => (
                <article className="quiz-card-modern" key={`${index}-${item.question}`}>
                  <div className="quiz-number">Q{index + 1}</div>
                  <div className="quiz-content">
                    <h3>{item.question}</h3>
                    <div className="quiz-options">
                      {item.options.map((option, optIndex) => (
                        <label className="quiz-option" key={option}>
                          <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    <details className="quiz-answer">
                      <summary>Show Answer</summary>
                      <p><strong>Correct: {item.answer}</strong></p>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
