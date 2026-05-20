import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SimulationProvider } from './core/SimulationContext'
import { ErrorBoundary } from './core/ErrorBoundary'
import './index.css'
import './assets/fontello/css/fontello.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <SimulationProvider>
      <App />
    </SimulationProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
