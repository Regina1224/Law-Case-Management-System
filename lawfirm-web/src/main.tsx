import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './app/router.tsx'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './app/msalInstance'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={router} />
    </MsalProvider>
    
  </StrictMode>,
)
