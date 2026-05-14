import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const { darkMode } = useTheme()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/dashboard')
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const analyzePerformance = async () => {
    setAnalyzing(true)
    try {
      const res = await axios.post('/api/feedback/analyze')
      setFeedback(res.data)
    } catch (err) {
      toast.error('Failed to analyze performance')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )

  const progressPercent = data?.roadmap ? Math.round((data.roadmap.completedTasks / data.roadmap.totalTasks) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome back, <span className="text-gradient">{data?.user?.name}!</span>
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
          Here's your learning progress at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: '🔥', label: 'Day Streak', value: data?.streak || 0, color: 'from-orange-500 to-red-500', bg: 'orange' },
          { icon: '🧮', label: 'Aptitude Score', value: `${data?.progress?.aptitudeScore || 0}%`, color: 'from-green-500 to-emerald-500', bg: 'green' },
          { icon: '💻', label: 'Coding Score', value: `${data?.progress?.codingScore || 0}%`, color: 'from-blue-500 to-cyan-500', bg: 'blue' },
          { icon: '📝', label: 'Notes Created', value: data?.notesCount || 0, color: 'from-purple-500 to-pink-500', bg: 'purple' }
        ].map((stat, idx) => (
          <div 
            key={idx}
            className={`stat-card group animate-slide-up`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-100 text-gray-600'
                }`}>All time</span>
              </div>
              <div className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stat.value}
              </div>
              <div className={`text-sm mt-1 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap Progress */}
      {data?.roadmap && (
        <div className={`rounded-2xl p-6 animate-slide-up animation-delay-200 ${
          darkMode ? 'bg-dark-card border border-dark-border' : 'bg-white border border-gray-100 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                📚 {data.roadmap.dreamJob}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                {data.roadmap.duration} Day Plan
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {progressPercent}%
              </div>
              <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Complete</p>
            </div>
          </div>
          <div className={`h-3 rounded-full ${darkMode ? 'bg-dark-border' : 'bg-gray-100'}`}>
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className={`text-sm mt-3 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
            {data.roadmap.completedTasks} of {data.roadmap.totalTasks} tasks completed
          </p>
        </div>
      )}

      {/* Weak Areas & AI Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Areas */}
        <div className={`rounded-2xl p-6 animate-slide-up animation-delay-300 ${
          darkMode ? 'bg-dark-card border border-dark-border' : 'bg-white border border-gray-100 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              ⚠️ Weak Areas
            </h2>
            <button 
              onClick={analyzePerformance}
              disabled={analyzing}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                analyzing 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : darkMode 
                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {analyzing ? 'Analyzing...' : 'Get AI Feedback'}
            </button>
          </div>
          {data?.weakAreas?.length > 0 ? (
            <div className="space-y-3">
              {data.weakAreas.slice(0, 5).map((area, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    darkMode ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <span className={darkMode ? 'text-dark-text' : 'text-gray-700'}>{area.topic}</span>
                  <span className="text-red-500 font-semibold">{area.score}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
              <p>No weak areas identified yet!</p>
              <p className="text-sm mt-1">Keep practicing to see your performance analysis</p>
            </div>
          )}
        </div>

        {/* AI Feedback */}
        {feedback && (
          <div className={`rounded-2xl p-6 animate-slide-up animation-delay-400 ${
            darkMode ? 'bg-dark-card border border-dark-border' : 'bg-white border border-gray-100 shadow-lg'
          }`}>
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🤖 AI Feedback
            </h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Performance
                </p>
                <p className={darkMode ? 'text-dark-text' : 'text-gray-700'}>{feedback.overallPerformance}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Strengths
                </p>
                <p className={darkMode ? 'text-dark-text' : 'text-gray-700'}>
                  {feedback.strengths?.join(', ') || 'Keep it up!'}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Suggestions
                </p>
                <p className={darkMode ? 'text-dark-text' : 'text-gray-700'}>
                  {feedback.suggestions?.join('. ') || 'Keep practicing!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up animation-delay-500">
        {[
          { title: 'Generate Roadmap', desc: 'Create a new learning path', icon: '🗺️', link: '/roadmap' },
          { title: 'Practice Aptitude', desc: 'Sharpen your skills', icon: '🧮', link: '/practice' },
          { title: 'Generate Notes', desc: 'Create study materials', icon: '📝', link: '/notes' }
        ].map((action, idx) => (
          <a
            key={idx}
            href={action.link}
            className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
              darkMode 
                ? 'bg-dark-card border border-dark-border hover:border-blue-500/50' 
                : 'bg-white border border-gray-100 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {action.icon}
            </div>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{action.title}</h3>
            <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>{action.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}