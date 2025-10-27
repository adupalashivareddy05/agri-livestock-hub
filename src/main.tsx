import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext'
import './index.css'

import Index from './pages/Index'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Animals from './pages/Animals'
import AddAnimal from './pages/AddAnimal'
import Crops from './pages/Crops'
import TraderRates from './pages/TraderRates'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/add-animal" element={<AddAnimal />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/trader-rates" element={<TraderRates />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
