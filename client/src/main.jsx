import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. IMPORT LIBRARY
import { pdfjs } from 'react-pdf';

// 2. IMPORT CSS
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// 3. CONFIGURATION (Local Worker)
// We use 'new URL' to point directly to the file inside 'node_modules'.
// This fixes CORS, 404, and "Module Specifier" errors.
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

// 4. RENDER
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
