import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { FormProvider } from './context/FormContext.jsx';

// Initialize theme from localStorage before first render to avoid flash
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme', 'light');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FormProvider>
        <App />
      </FormProvider>
    </BrowserRouter>
  </StrictMode>
)
