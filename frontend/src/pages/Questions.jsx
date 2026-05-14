import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

export default function Questions() {
  const { darkMode } = useTheme()
  const [formData, setFormData] = useState({
    type: 'aptitude',
    difficulty: 'beginner',
    topic: '',
    count: 1
  })
  const [generating, setGenerating] = useState(false)
  const [questions, setQuestions] = useState([])

  const aptitudeTopics = ['Percentage', 'Ratio', 'Profit and Loss', 'Time and Work', 'Simple Interest', 'Number System', 'Averages', 'Probability']
  const codingTopics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Graphs', 'Sorting', 'Searching']

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const res = await axios.post('/api/questions/generate', formData)
      setQuestions(res.data)
      toast.success(`Generated ${res.data.length} question(s)!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  const currentTopics = formData.type === 'aptitude' ? aptitudeTopics : codingTopics

  return (
    <div className={`space-y-6 ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ❓ Practice Questions
      </h1>

      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Generate Questions
        </h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, topic: '' })}
                className={`w-full px-3 py-2 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                <option value="aptitude">Aptitude</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Topic</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                required
              >
                <option value="">Select topic</option>
                {currentTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Count</label>
              <select
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Questions'}
          </button>
        </form>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Generated Questions
          </h2>
          {questions.map((q, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  {q.difficulty}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-100 text-gray-700'
                }`}>
                  {q.topic}
                </span>
              </div>
              
              <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{q.title}</h3>
              <p className={`mb-4 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>{q.description}</p>

              {q.options && (
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${opt.isCorrect 
                      ? (darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-300')
                      : (darkMode ? 'bg-dark-border' : 'bg-gray-50')
                    }`}>
                      <span className={darkMode ? 'text-white' : 'text-gray-700'}>{opt.text}</span>
                      {opt.isCorrect && <span className="text-green-500 text-sm ml-2">✓</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                <p className={`font-medium text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Explanation:</p>
                <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}