import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back! 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Welcome back! 🎉')
      navigate('/')
    } catch (err) {
      // Only show error if it's not a user cancellation
      if (!err.message?.includes('cancelled')) {
        toast.error('Google login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-dark-bg via-slate-900 to-dark-bg' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-30 ${
          darkMode ? 'bg-purple-500' : 'bg-purple-300'
        } animate-pulse-slow`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-30 ${
          darkMode ? 'bg-blue-500' : 'bg-blue-300'
        } animate-pulse-slow animation-delay-200`}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-3 rounded-full transition-all duration-300 hover:scale-110 z-50 ${
          darkMode 
            ? 'bg-dark-border text-yellow-400 hover:bg-yellow-400/20' 
            : 'bg-white shadow-lg text-gray-600 hover:bg-gray-100'
        }`}
      >
        {darkMode ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        )}
      </button>

      {/* Login Card */}
      <div className={`relative w-full max-w-md ${darkMode ? 'bg-dark-card/90 backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl'} rounded-3xl shadow-2xl p-8 animate-scale-in`}>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
        </div>

        <h2 className={`text-3xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome Back
        </h2>
        <p className={`text-center mb-8 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
          Sign in to continue your journey
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
            darkMode 
              ? 'bg-dark-border hover:bg-dark-border/80 text-white border border-dark-border' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className={`flex-1 h-px ${darkMode ? 'bg-dark-border' : 'bg-gray-200'}`}></div>
          <span className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-400'}`}>or</span>
          <div className={`flex-1 h-px ${darkMode ? 'bg-dark-border' : 'bg-gray-200'}`}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-dark-text' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 outline-none ${
                darkMode 
                  ? 'bg-dark-bg border-dark-border text-dark-text focus:border-blue-500' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-blue-500'
              }`}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-dark-text' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 outline-none ${
                darkMode 
                  ? 'bg-dark-bg border-dark-border text-dark-text focus:border-blue-500' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-blue-500'
              }`}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <p className={`text-center mt-6 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-600 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}