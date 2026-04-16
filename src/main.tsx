import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { LocalAuthProvider } from '@/contexts/LocalAuthContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import './index.css'

import Login from './pages/Login'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Animals from './pages/Animals'
import BuyerAnimalDashboard from './pages/BuyerAnimalDashboard'
import AddAnimal from './pages/AddAnimal'
import Crops from './pages/Crops'
import TraderRates from './pages/TraderRates'
import FarmerRegistration from './pages/FarmerRegistration'
import TraderRegistration from './pages/TraderRegistration'
import AdminDashboard from './pages/AdminDashboard'
import MarketDashboard from './pages/MarketDashboard'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LocalAuthProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/animals" element={<ProtectedRoute><Animals /></ProtectedRoute>} />
              <Route path="/buy-animals" element={<ProtectedRoute><BuyerAnimalDashboard /></ProtectedRoute>} />
              <Route path="/add-animal" element={<ProtectedRoute><AddAnimal /></ProtectedRoute>} />
              <Route path="/crops" element={<ProtectedRoute><Crops /></ProtectedRoute>} />
              <Route path="/trader-rates" element={<ProtectedRoute><TraderRates /></ProtectedRoute>} />
              <Route path="/farmer-registration" element={<ProtectedRoute><FarmerRegistration /></ProtectedRoute>} />
              <Route path="/trader-registration" element={<ProtectedRoute><TraderRegistration /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/market" element={<ProtectedRoute><MarketDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </LocalAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
