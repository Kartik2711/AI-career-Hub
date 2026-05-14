import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function JobQuestions() {
  const { token, user } = useAuth()
  const { darkMode } = useTheme()
  const [jobRole, setJobRole] = useState(user?.dreamJob || '')
  const [questionType, setQuestionType] = useState('both')
  const [generating, setGenerating] = useState(false)
  const [questions, setQuestions] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('/api/job-questions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuestions(res.data)
      if (res.data.length > 0) {
        setSelectedJob(res.data[0])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = async () => {
    if (!jobRole.trim()) {
      toast.error('Please enter a job role')
      return
    }
    setGenerating(true)
    try {
      const res = await axios.post('/api/job-questions/generate',
        { jobRole, questionType, count: 20 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestions([res.data, ...questions])
      setSelectedJob(res.data)
      toast.success('Questions generated!')
    } catch (error) {
      toast.error('Failed to generate questions')
    }
    setGenerating(false)
  }

  const toggleComplete = async (questionId) => {
    try {
      const res = await axios.post('/api/job-questions/toggle',
        { questionId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestions(questions.map(q => q._id === res.data._id ? res.data : q))
      if (selectedJob?._id === res.data._id) {
        setSelectedJob(res.data)
      }
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const filteredQuestions = selectedJob?.questions?.filter(q => 
    filter === 'all' || q.type === filter || (filter === 'completed' && q.completed) || (filter === 'pending' && !q.completed)
  ) || []

  const technicalCount = selectedJob?.questions?.filter(q => q.type === 'technical').length || 0
  const hrCount = selectedJob?.questions?.filter(q => q.type === 'hr').length || 0
  const completedCount = selectedJob?.questions?.filter(q => q.completed).length || 0

  if (loading) {
    return <div className="flex justify-center py-20"><div className="loader"></div></div>
  }

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        💼 Job-Specific Questions
      </h1>

      <div className={`p-6 rounded-2xl border mb-6 ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Target Job Role</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Full Stack Developer, Data Scientist"
              className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className={`px-4 py-3 rounded-xl border ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="both">Both Technical & HR</option>
              <option value="technical">Technical Only</option>
              <option value="hr">HR Only</option>
            </select>
          </div>
          <button
            onClick={generateQuestions}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : '🎯 Generate Questions'}
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <p className="text-sm opacity-70">Total Questions</p>
            <p className="text-2xl font-bold">{selectedJob?.questions?.length || 0}</p>
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <p className="text-sm opacity-70">Technical</p>
            <p className="text-2xl font-bold text-blue-500">{technicalCount}</p>
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <p className="text-sm opacity-70">HR Questions</p>
            <p className="text-2xl font-bold text-purple-500">{hrCount}</p>
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <p className="text-sm opacity-70">Completed</p>
            <p className="text-2xl font-bold text-green-500">{completedCount}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generated Sets</h3>
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q._id}
                onClick={() => setSelectedJob(q)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedJob?._id === q._id
                    ? 'border-blue-500 bg-blue-500/10'
                    : darkMode ? 'bg-dark-card border-dark-border hover:border-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{q.jobRole}</h4>
                <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  {q.questions.length} questions
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-dark-muted' : 'text-gray-400'}`}>
                  {new Date(q.generatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {questions.length === 0 && (
              <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>No questions yet. Generate your first set!</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedJob && (
            <>
              <div className="flex gap-2 mb-4">
                {['all', 'technical', 'hr', 'completed', 'pending'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filter === f 
                        ? 'bg-blue-500 text-white' 
                        : darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border transition-all ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} ${q.completed ? 'border-green-500 bg-green-500/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          q.type === 'technical' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {q.type === 'technical' ? '💻 Technical' : '👔 HR'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                          q.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {q.difficulty}
                        </span>
                        {q.category && (
                          <span className={`text-xs px-2 py-0.5 rounded ml-2 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                            {q.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleComplete(q._id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          q.completed 
                            ? 'bg-green-500 text-white' 
                            : darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {q.completed ? '✓ Done' : 'Mark Done'}
                      </button>
                    </div>
                    
                    <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{q.question}</h3>
                    
                    {q.sampleAnswer && (
                      <div className={`p-3 rounded-lg mb-3 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                        <p className="text-sm font-medium text-blue-600 mb-1">📝 Sample Answer:</p>
                        <p className={darkMode ? 'text-dark-muted text-sm' : 'text-gray-700 text-sm'}>{q.sampleAnswer}</p>
                      </div>
                    )}
                    
                    {q.tips && q.tips.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {q.tips.map((tip, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                            💡 {tip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}