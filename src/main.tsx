import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global styles are imported BEFORE the app, deliberately. Rollup emits CSS in
// module-graph order, so importing them after App would put the shared type and
// ground rules last and let them win over every CSS Module that is meant to
// refine them. Keep this line where it is.
import './styles/global.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
