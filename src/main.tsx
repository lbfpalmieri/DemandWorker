import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { DemandProvider } from './store/DemandContext'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemandProvider>
        <App />
      </DemandProvider>
    </BrowserRouter>
  </React.StrictMode>
)

