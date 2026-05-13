export default function HomePage() {
  return (
    <section className="hero card">
      <div className="hero-copy">
        <p className="eyebrow">Multi-Agent PDF Intelligence</p>
        <h1>Upload documents, ask grounded questions, and generate study material.</h1>
        <p className="lede">
          This MVP connects a FastAPI backend to a React interface for PDF upload,
          citation-aware Q&A, summaries, quizzes, and document comparison.
        </p>
        <div className="hero-grid">
          <article className="stat">
            <strong>PDF RAG</strong>
            <span>Upload and query documents</span>
          </article>
          <article className="stat">
            <strong>Summaries</strong>
            <span>Generate concise notes</span>
          </article>
          <article className="stat">
            <strong>Quizzes</strong>
            <span>Create MCQ sets fast</span>
          </article>
        </div>
      </div>
      <div className="hero-panel">
        <div className="panel-line" />
        <h2>Recommended flow</h2>
        <ol>
          <li>Upload a PDF.</li>
          <li>Select the document in Chat or Summary.</li>
          <li>Ask questions or generate outputs.</li>
        </ol>
      </div>
    </section>
  );
}
