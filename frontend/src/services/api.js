import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

export async function checkHealth() {
  const response = await api.get('/api/health');
  return response.data;
}

export async function listDocuments() {
  const response = await api.get('/api/documents');
  return response.data;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function askQuestion(payload) {
  const response = await api.post('/api/ask', payload);
  return response.data;
}

export async function runAgentResearch(payload) {
  const response = await api.post('/api/agent/research', payload);
  return response.data;
}

export async function summarizeDocument(payload) {
  const response = await api.post('/api/summarize', payload);
  return response.data;
}

export async function generateQuiz(payload) {
  const response = await api.post('/api/quiz', payload);
  return response.data;
}

export async function extractTopics(payload) {
  const response = await api.post('/api/topics', payload);
  return response.data;
}

export async function compareDocuments(payload) {
  const response = await api.post('/api/compare', payload);
  return response.data;
}
