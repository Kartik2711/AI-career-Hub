import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, logout } = useAuth()
  const { darkMode, setDarkMode } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    reminders: true
  })

  const handleNotificationChange = (key) => {
    setNotifications({...notifications, [key]: !notifications[key]})
    toast.success('Setting updated!')
  }

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ⚙️ Settings
      </h1>

      <div className="space-y-6 max-w-3xl">
        {/* Appearance */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎨 Appearance
          </h2>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className={darkMode ? 'text-white' : 'text-gray-900'}>Dark Mode</p>
              <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                Use dark theme for the interface
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-14 h-8 rounded-full transition-colors ${
                darkMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🔔 Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>Email Notifications</p>
                <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  Receive updates via email
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('email')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.email ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  notifications.email ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>Push Notifications</p>
                <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  Receive browser notifications
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('push')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.push ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  notifications.push ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>Weekly Progress</p>
                <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  Weekly summary of your progress
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('weekly')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.weekly ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  notifications.weekly ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>Daily Reminders</p>
                <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  Remind to practice daily
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('reminders')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.reminders ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  notifications.reminders ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            👤 Account
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>Email</p>
                <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button className="w-full py-3 rounded-xl text-red-500 border border-red-500 hover:bg-red-500/10 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ℹ️ About
          </h2>
          
          <div className="space-y-2">
            <p className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>
              <span className="font-medium">Version:</span> 1.0.0
            </p>
            <p className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>
              <span className="font-medium">AI Career Roadmap System</span>
            </p>
            <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
              Your personal AI-powered career preparation companion
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}