import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('@ana:token')
    const storedUser = localStorage.getItem('@ana:user')
    
    if (token && storedUser) {
      api.defaults.headers.authorization = `Bearer ${token}`
      setUser(JSON.parse(storedUser))
    }
    
    setLoading(false)
  }, [])

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    const { user, token } = response.data
    
    localStorage.setItem('@ana:token', token)
    localStorage.setItem('@ana:user', JSON.stringify(user))
    
    api.defaults.headers.authorization = `Bearer ${token}`
    setUser(user)
    
    return user
  }

  function logout() {
    localStorage.removeItem('@ana:token')
    localStorage.removeItem('@ana:user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
