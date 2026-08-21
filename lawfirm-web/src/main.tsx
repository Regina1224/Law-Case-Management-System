import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './app/router.tsx'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './app/msalInstance'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { ThemeProvider } from './components/theme-provider'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="lcms-theme">
      <MsalProvider instance={msalInstance}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </MsalProvider>
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
)
