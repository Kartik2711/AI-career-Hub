import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Doubt() {
  const { token, user } = useAuth()
  const { darkMode } = useTheme()
  const [doubts, setDoubts] = useState([])
  const [selectedDoubt, setSelectedDoubt] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [myDoubtsOnly, setMyDoubtsOnly] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    category: 'general',
    description: '',
    isAnonymous: false,
    tags: ''
  })

  useEffect(() => {
    fetchDoubts()
  }, [filter, myDoubtsOnly])

  const fetchDoubts = async () => {
    try {
      let url = '/api/doubts?'
      if (filter !== 'all') url += `category=${filter}&`
      if (myDoubtsOnly) url += `status=all&`
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoubts(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const submitDoubt = async (e) => {
    e.preventDefault()
    if (!formData.question.trim()) {
      toast.error('Please enter your question')
      return
    }
    
    try {
      const res = await axios.post('/api/doubts/ask', {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setDoubts([res.data, ...doubts])
      setShowModal(false)
      setFormData({ question: '', category: 'general', description: '', isAnonymous: false, tags: '' })
      toast.success('Question posted! AI will answer shortly.')
    } catch (error) {
      toast.error('Failed to post question')
    }
  }

  const viewDoubt = async (doubt) => {
    try {
      const res = await axios.get(`/api/doubts/${doubt._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedDoubt(res.data)
    } catch (error) {
      toast.error('Failed to load doubt')
    }
  }

  const answerDoubt = async (answer) => {
    if (!answer.trim()) return
    
    try {
      const res = await axios.post('/api/doubts/answer',
        { doubtId: selectedDoubt._id, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedDoubt(res.data)
      toast.success('Answer added!')
    } catch (error) {
      toast.error('Failed to add answer')
    }
  }

  const regenerateAnswer = async () => {
    try {
      const res = await axios.post('/api/doubts/regenerate',
        { doubtId: selectedDoubt._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedDoubt(res.data)
      toast.success('Answer regenerated!')
    } catch (error) {
      toast.error('Failed to regenerate')
    }
  }

  const upvoteDoubt = async (doubtId) => {
    try {
      await axios.post(`/api/doubts/upvote/${doubtId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchDoubts()
    } catch (error) {
      // Ignore
    }
  }

  const deleteDoubt = async (doubtId) => {
    try {
      await axios.delete(`/api/doubts/${doubtId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoubts(doubts.filter(d => d._id !== doubtId))
      if (selectedDoubt?._id === doubtId) setSelectedDoubt(null)
      toast.success('Doubt deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const categoryColors = {
    study: 'bg-blue-500',
    personal: 'bg-pink-500',
    career: 'bg-green-500',
    general: 'bg-purple-500',
    technical: 'bg-orange-500'
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="loader"></div></div>
  }

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          💬 Doubt & Consultation
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
        >
          + Ask Question
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'study', 'personal', 'career', 'general', 'technical'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === cat 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-dark-border text-dark-muted hover:text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setMyDoubtsOnly(!myDoubtsOnly)}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            myDoubtsOnly 
              ? 'bg-green-500 text-white' 
              : darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-200 text-gray-700'
          }`}
        >
          My Questions
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {doubts.map(doubt => (
            <div
              key={doubt._id}
              onClick={() => viewDoubt(doubt)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                selectedDoubt?._id === doubt._id
                  ? 'border-blue-500 bg-blue-500/10'
                  : darkMode ? 'bg-dark-card border-dark-border hover:border-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded text-white ${categoryColors[doubt.category] || 'bg-gray-500'}`}>
                  {doubt.category}
                </span>
                <span className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  {doubt.answers?.length || 0} answers
                </span>
              </div>
              <h3 className={`font-medium line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {doubt.question}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  {doubt.isAnonymous ? 'Anonymous' : doubt.userName}
                </span>
                <span className="text-xs">👍 {doubt.upvotes || 0}</span>
              </div>
            </div>
          ))}
          {doubts.length === 0 && (
            <p className={`text-center py-8 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
              No questions yet. Be the first to ask!
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          {selectedDoubt ? (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded text-white ${categoryColors[selectedDoubt.category] || 'bg-gray-500'}`}>
                  {selectedDoubt.category}
                </span>
                <span className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  {selectedDoubt.isAnonymous ? 'Anonymous' : selectedDoubt.userName}
                </span>
                <span className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  • {new Date(selectedDoubt.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedDoubt.question}
              </h2>

              {selectedDoubt.description && (
                <p className={`mb-4 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  {selectedDoubt.description}
                </p>
              )}

              {/* AI Answer */}
              {selectedDoubt.aiAnswer && (
                <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🤖</span>
                    <h3 className="font-semibold text-blue-500">AI Mentor Answer</h3>
                    <button
                      onClick={regenerateAnswer}
                      className={`ml-2 text-xs px-2 py-1 rounded ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}
                    >
                      🔄
                    </button>
                  </div>
                  <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>
                    {selectedDoubt.aiAnswer}
                  </p>
                </div>
              )}

              {/* Community Answers */}
              {selectedDoubt.answers?.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Community Answers ({selectedDoubt.answers.length})
                  </h3>
                  {selectedDoubt.answers.map((ans, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {ans.userName}
                        </span>
                        {ans.isExpert && (
                          <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded">Expert</span>
                        )}
                      </div>
                      <p className={darkMode ? 'text-dark-muted text-sm' : 'text-gray-700 text-sm'}>
                        {ans.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => upvoteDoubt(selectedDoubt._id)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-dark-border hover:bg-green-500/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  👍 Upvote ({selectedDoubt.upvotes || 0})
                </button>
                {selectedDoubt.userId === user?._id && (
                  <button
                    onClick={() => deleteDoubt(selectedDoubt._id)}
                    className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Add Answer Form */}
              <div className="mt-6 pt-4 border-t">
                <AnswerForm onSubmit={answerDoubt} darkMode={darkMode} />
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-2xl border border-dashed text-center ${darkMode ? 'border-dark-border bg-dark-card' : 'border-gray-300 bg-gray-50'}`}>
              <p className={`text-4xl mb-4`}>💬</p>
              <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>
                Select a question to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ask Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl w-full max-w-lg ${darkMode ? 'bg-dark-card' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ask a Question
            </h2>
            <form onSubmit={submitDoubt} className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="study">📚 Study</option>
                  <option value="personal">💝 Personal</option>
                  <option value="career">💼 Career</option>
                  <option value="technical">💻 Technical</option>
                  <option value="general">💭 General</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Your Question *</label>
                <textarea
                  value={formData.question}
                  onChange={e => setFormData({...formData, question: e.target.value})}
                  placeholder="What's on your mind?"
                  className={`w-full p-3 rounded-xl border h-24 ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>More Details (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Add more context..."
                  className={`w-full p-3 rounded-xl border h-20 ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  placeholder="react, javascript, career"
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={e => setFormData({...formData, isAnonymous: e.target.checked})}
                />
                <label htmlFor="anonymous" className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>
                  Ask anonymously
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-3 rounded-xl ${darkMode ? 'bg-dark-border hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium"
                >
                  Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AnswerForm({ onSubmit, darkMode }) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    
    setSubmitting(true)
    await onSubmit(answer)
    setAnswer('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write an answer..."
        className={`flex-1 p-3 rounded-xl border ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
      />
      <button
        type="submit"
        disabled={submitting || !answer.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-xl disabled:opacity-50"
      >
        {submitting ? '...' : 'Reply'}
      </button>
    </form>
  )
}