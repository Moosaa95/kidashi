import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainWrapper from './mainWrapper'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainWrapper />
  </StrictMode>
)
