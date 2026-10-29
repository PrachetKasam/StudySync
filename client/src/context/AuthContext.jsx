import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { getAuthToken, setAuthToken, clearAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(() => getAuthToken())
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    clearAuthToken()
    setTokenState(null)
    setUser(null)
  }, [])

  // Verify session on mount if token exists
  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      const existingToken = getAuthToken()
      if (!existingToken) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const res = await api.get('/api/auth/me')
        if (isMounted && res.success && res.data) {
          setUser(res.data)
        }
      } catch (err) {
        if (isMounted) {
          logout()
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUser()

    const handleUnauthorized = () => {
      logout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      isMounted = false
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    if (res.success && res.data) {
      const { user: userData, token: newToken } = res.data
      setAuthToken(newToken)
      setTokenState(newToken)
      setUser(userData)
      return userData
    }
    throw new Error(res.message || 'Login failed')
  }

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    if (res.success && res.data) {
      const { user: userData, token: newToken } = res.data
      setAuthToken(newToken)
      setTokenState(newToken)
      setUser(userData)
      return userData
    }
    throw new Error(res.message || 'Registration failed')
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
