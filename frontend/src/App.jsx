import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import SummaryPage from './pages/SummaryPage';
import QuizPage from './pages/QuizPage';
import ComparePage from './pages/ComparePage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </Layout>
  );
}
