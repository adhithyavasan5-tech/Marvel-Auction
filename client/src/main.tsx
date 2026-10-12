import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppWrapper } from './components/AppWrapper'
import { UserProvider } from './context/UserContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </UserProvider>
  </StrictMode>,
)
