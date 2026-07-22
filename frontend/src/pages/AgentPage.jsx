import { useEffect, useState } from 'react';
import { runAgentResearch, listDocuments } from '../services/api';
import { Bot, CheckCircle2, ChevronRight, Cpu, FileText, Layers, LoaderCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';

export default function AgentPage() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [goal, setGoal] = useState('Analyze the primary methodology and key findings across the research paper.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listDocuments().then((data) => {
      setDocuments(data);
      if (data.length > 0) {
        setDocumentId(data[0].document_id);
      }
    }).catch(() => setError('Could not load uploaded documents.'));
  }, []);

  async function handleResearch(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await runAgentResearch({
        goal,
        document_id: documentId || null,
        max_steps: 5,
      });
      setResult(response);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Agent research run failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      {/* Header Section */}
      <section className="page-section">
        <div className="section-header">
          <div className="section-icon"><Bot size={44} strokeWidth={1.75} /></div>
          <div>
            <h1>Autonomous Research Agent</h1>
            <p className="section-description">Multi-step ReAct reasoning loop with tool execution, vector retrieval, and cross-doc validation</p>
          </div>
        </div>

        <div className="section-content">
          <form className="chat-form" onSubmit={handleResearch}>
            <div className="form-group">
              <label>Target Document Context</label>
              <select value={documentId} onChange={(e) => setDocumentId(e.target.value)} disabled={documents.length === 0}>
                {documents.length === 0 ? <option value="">No documents available</option> : null}
                {documents.map((doc) => (
                  <option key={doc.document_id} value={doc.document_id}>
                    {doc.filename} ({doc.page_count} pages)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Research Goal / Question</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                placeholder="State your high-level research goal or question..."
              />
            </div>

            <button className="button button-primary" type="submit" disabled={loading || documents.length === 0}>
              {loading ? (
                <><LoaderCircle className="button-icon spin" size={18} /> Executing ReAct Agent...</>
              ) : (
                <><Sparkles className="button-icon" size={18} /> Launch Agentic Research</>
              )}
            </button>
          </form>
          {error ? <p className="error">{error}</p> : null}
        </div>
      </section>

      {/* Agent Execution Trace & Output */}
      {result && (
        <>
          {/* Step-by-Step ReAct Chain */}
          <section className="page-section">
            <div className="section-header">
              <div className="section-icon"><Cpu size={36} /></div>
              <h2>Agent Execution Trace (ReAct Loop)</h2>
            </div>
            <div className="section-content">
              <div className="agent-steps-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.thought_steps.map((step) => (
                  <div key={step.step} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                      <ChevronRight size={16} /> Step {step.step}: {step.thought}
                    </div>
                    {step.action && (
                      <div style={{ fontSize: '0.9rem', color: '#475569', marginLeft: '1.25rem', marginBottom: '0.25rem' }}>
                        <strong>Action:</strong> <code>{step.action}</code> ({step.action_input})
                      </div>
                    )}
                    {step.observation && (
                      <div style={{ fontSize: '0.9rem', color: '#0f766e', marginLeft: '1.25rem', background: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        <strong>Observation:</strong> {step.observation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final Synthesized Research Answer */}
          <section className="page-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="section-icon"><CheckCircle2 size={36} /></div>
                <h2>Synthesized Research Output</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 600 }}>
                <ShieldCheck size={18} /> Confidence: {(result.confidence_score * 100).toFixed(0)}%
              </div>
            </div>

            <div className="section-content">
              <div className="answer-box" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {result.answer}
              </div>

              {/* Citations Grid */}
              {result.citations.length > 0 && (
                <div className="sources-section" style={{ marginTop: '1.5rem' }}>
                  <h3><FileText size={18} /> Retrieved Evidence Chunks & Citations</h3>
                  <div className="source-grid" style={{ marginTop: '0.75rem' }}>
                    {result.citations.map((cite, idx) => (
                      <article className="source-card" key={idx} style={{ padding: '0.75rem', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                        <strong>[Chunk {idx + 1}] {cite.filename}</strong>
                        <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.25rem' }}>{cite.chunk_preview}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
