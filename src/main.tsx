import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { resources } from './utils/assets'

document.documentElement.style.setProperty('--forge-background-image', `url("${resources.background}")`)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
