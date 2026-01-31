import React from 'react'
import ReactDOM from 'react-dom/client'
import { SidepanelApp } from './SidepanelApp'
import { ThemeProvider } from '../shared/ThemeContext'
import '../styles/globals.css'
import '../styles/sidepanel.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidepanelApp />
    </ThemeProvider>
  </React.StrictMode>,
)
