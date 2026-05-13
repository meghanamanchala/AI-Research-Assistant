import { Link } from 'react-router-dom';
import { CircleHelp, ClipboardList, FileText, MessageSquareText, Scale } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>AI Research Assistant</h1>
          <p className="hero-description">Upload, analyze, and extract insights from your research documents with AI-powered tools.</p>
          <Link to="/upload" className="button button-primary">Get Started</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Core Features</h2>
        <div className="features-grid">
          <Link to="/upload" className="feature-card">
            <div className="feature-icon"><FileText size={36} strokeWidth={1.8} /></div>
            <h3>Upload</h3>
            <p>Import PDF documents for analysis</p>
          </Link>

          <Link to="/chat" className="feature-card">
            <div className="feature-icon"><MessageSquareText size={36} strokeWidth={1.8} /></div>
            <h3>Chat</h3>
            <p>Ask questions and get instant answers</p>
          </Link>

          <Link to="/summary" className="feature-card">
            <div className="feature-icon"><ClipboardList size={36} strokeWidth={1.8} /></div>
            <h3>Summarize</h3>
            <p>Generate bullet points or paragraphs</p>
          </Link>

          <Link to="/quiz" className="feature-card">
            <div className="feature-icon"><CircleHelp size={36} strokeWidth={1.8} /></div>
            <h3>Quiz</h3>
            <p>Create multiple-choice questions</p>
          </Link>

          <Link to="/compare" className="feature-card">
            <div className="feature-icon"><Scale size={36} strokeWidth={1.8} /></div>
            <h3>Compare</h3>
            <p>Compare topics across documents</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
