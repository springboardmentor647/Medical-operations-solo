import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mediops-backend.onrender.com';

axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('127.0.0.1:8000')) {
    config.url = config.url.replace('http://127.0.0.1:8000', API_BASE_URL);
  } else if (config.url && config.url.includes('localhost:8000')) {
    config.url = config.url.replace('http://localhost:8000', API_BASE_URL);
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);