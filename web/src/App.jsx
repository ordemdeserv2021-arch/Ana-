import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Condominiums from './pages/Condominiums'
import Residents from './pages/Residents'
import Visitors from './pages/Visitors'
import Devices from './pages/Devices'
import AccessLogs from './pages/AccessLogs'
import Users from './pages/Users'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="condominiums" element={<Condominiums />} />
        <Route path="residents" element={<Residents />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="devices" element={<Devices />} />
        <Route path="access" element={<AccessLogs />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  )
}
