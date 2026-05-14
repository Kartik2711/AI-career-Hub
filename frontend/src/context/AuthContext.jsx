import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { signInWithGoogle, logout as firebaseLogout } from '../utils/firebase'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/profile')
      setUser(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data.user)
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data.user)
    return res.data
  }

  const loginWithGoogle = async () => {
    try {
      const idToken = await signInWithGoogle()
      const res = await axios.post('/api/auth/google-login', { idToken })
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      setUser(res.data.user)
      return res.data
    } catch (error) {
      // Check if it's a user cancelled popup - that's normal, don't show error
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled') {
        // User closed the popup - silently fail, they can try again
        return Promise.reject(new Error('Sign-in was cancelled'))
      }
      console.error('Google login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    try {
      firebaseLogout()
    } catch (e) {
      // Ignore
    }
  }

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data)
    setUser(res.data)
    return res.data
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}