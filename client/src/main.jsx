import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import '@ant-design/v5-patch-for-react-19';
import 'virtual:uno.css';

createRoot(document.getElementById('root')).render(<App />);
