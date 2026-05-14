import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateProfile, token } = useAuth()
  const { darkMode } = useTheme()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    dreamJob: user?.dreamJob || '',
    currentSkills: (Array.isArray(user?.currentSkills) ? user.currentSkills.join(', ') : (user?.currentSkills || '')),
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedin: user?.linkedin || '',
    github: user?.github || ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        dreamJob: user.dreamJob || '',
        currentSkills: Array.isArray(user.currentSkills) ? user.currentSkills.join(', ') : (user.currentSkills || ''),
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        linkedin: user.linkedin || '',
        github: user.github || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      toast.success('Profile updated!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
    setSaving(false)
  }

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        👤 My Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className={`p-6 rounded-2xl border text-center ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-bold ${
              darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            } text-white`}>
              {formData.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className={`text-xl font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formData.name || 'User'}
            </h2>
            <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>
              {formData.email}
            </p>
            {formData.dreamJob && (
              <div className={`mt-4 px-4 py-2 rounded-full text-sm ${
                darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                🎯 {formData.dreamJob}
              </div>
            )}
          </div>

          <div className={`mt-6 p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.currentSkills?.split(',').filter(s => s.trim()).map((skill, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                }`}>
                  {skill.trim()}
                </span>
              ))}
              {(!formData.currentSkills || !formData.currentSkills.trim()) && (
                <p className={darkMode ? 'text-dark-muted text-sm' : 'text-gray-500 text-sm'}>
                  No skills added yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className={`space-y-6 p-6 rounded-2xl border ${
            darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  Email (cannot change)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className={`w-full px-4 py-3 rounded-xl border opacity-50 ${
                    darkMode ? 'bg-dark-border border-dark-border text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  🎯 Dream Job
                </label>
                <input
                  type="text"
                  value={formData.dreamJob}
                  onChange={(e) => setFormData({...formData, dreamJob: e.target.value})}
                  placeholder="e.g., Full Stack Developer"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  📍 Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, Country"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                💻 Current Skills (comma separated)
              </label>
              <input
                type="text"
                value={formData.currentSkills}
                onChange={(e) => setFormData({...formData, currentSkills: e.target.value})}
                placeholder="JavaScript, React, Node.js, Python"
                className={`w-full px-4 py-3 rounded-xl border ${
                  darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                📱 Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 9876543210"
                className={`w-full px-4 py-3 rounded-xl border ${
                  darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
                placeholder="Tell us about yourself..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  🔗 LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/username"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  🐙 GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({...formData, github: e.target.value})}
                  placeholder="https://github.com/username"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}