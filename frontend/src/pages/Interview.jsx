import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const categories = [
  { id: 'communication', title: '💬 Communication', desc: 'Master verbal communication and storytelling' },
  { id: 'technical', title: '💻 Technical Round', desc: 'Coding, problem-solving, and technical questions' },
  { id: 'body_language', title: '🎭 Body Language', desc: 'Non-verbal communication and professional presence' },
  { id: 'manager_round', title: '👔 Manager/HR Round', desc: 'Leadership, cultural fit, and behavioral questions' }
]

export default function Interview() {
  const { token } = useAuth()
  const { darkMode } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryData, setCategoryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userCategories, setUserCategories] = useState([])
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [generatingMore, setGeneratingMore] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/interview/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserCategories(res.data.map(c => c.category))
    } catch (error) {
      console.error(error)
    }
  }

  const generateContent = async (categoryId) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/interview/generate',
        { category: categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCategoryData(res.data)
      setSelectedCategory(categoryId)
      toast.success('Content generated!')
    } catch (error) {
      toast.error('Failed to generate content')
    }
    setLoading(false)
  }

  const loadCategory = async (categoryId) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/interview/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` } 
      })
      setCategoryData(res.data)
      setSelectedCategory(categoryId)
    } catch (error) {
      await generateContent(categoryId)
    }
    setLoading(false)
  }

  const generateMore = async () => {
    setGeneratingMore(true)
    try {
      const res = await axios.post('/api/interview/generate-more',
        { category: selectedCategory, count: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCategoryData(res.data)
      toast.success('5 more questions added!')
    } catch (error) {
      toast.error('Failed to generate more')
    }
    setGeneratingMore(false)
  }

  const toggleComplete = async (index) => {
    try {
      const res = await axios.post('/api/interview/toggle',
        { category: selectedCategory, questionIndex: index },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCategoryData(prev => ({
        ...prev,
        questions: res.data.questions
      }))
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        🎯 Interview Preparation
      </h1>

      {!selectedCategory ? (
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                darkMode 
                  ? 'bg-dark-card border-dark-border hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-500 shadow-lg'
              }`}
              onClick={() => loadCategory(cat.id)}
            >
              <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
              <p className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>{cat.desc}</p>
              {userCategories.includes(cat.id) && (
                <span className="inline-block mt-3 px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  ✓ Ready
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => { setSelectedCategory(null); setCategoryData(null); setExpandedQuestion(null) }}
            className={`mb-4 px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-dark-border hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            ← Back to Categories
          </button>

          <div className="flex justify-between items-center mb-4">
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border flex-1 mr-4`}>
              <h2 className="text-2xl font-bold mb-2">{categoryData?.title}</h2>
              <p className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>{categoryData?.description}</p>
            </div>
            <button
              onClick={generateMore}
              disabled={generatingMore}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {generatingMore ? 'Generating...' : '+5 More Questions'}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryData?.questions?.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition-all ${
                    darkMode 
                      ? 'bg-dark-card border-dark-border hover:border-blue-500/50' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  } ${q.practiceCompleted ? 'border-green-500 bg-green-500/5' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg flex-1">{q.question}</h3>
                    <button
                      onClick={() => toggleComplete(idx)}
                      className={`ml-3 px-3 py-1 rounded-full text-sm transition-colors shrink-0 ${
                        q.practiceCompleted 
                          ? 'bg-green-500 text-white' 
                          : darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {q.practiceCompleted ? '✓ Practiced' : 'Mark'}
                    </button>
                  </div>
                  
                  {q.overview && (
                    <p className={`text-sm mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      📋 {q.overview}
                    </p>
                  )}

                  {expandedQuestion === idx ? (
                    <div className="mt-4 space-y-4">
                      {q.sampleAnswer && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                          <p className="text-sm font-bold text-blue-600 mb-2">💬 Sample Answer:</p>
                          <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{q.sampleAnswer}</p>
                        </div>
                      )}
                      
                      {q.explanation && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                          <p className="text-sm font-bold text-purple-600 mb-2">📖 Explanation:</p>
                          <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{q.explanation}</p>
                        </div>
                      )}

                      {q.examples && q.examples.length > 0 && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
                          <p className="text-sm font-bold text-green-600 mb-2">🎯 Examples:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {q.examples.map((ex, i) => (
                              <li key={i} className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{ex}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {q.useCases && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                          <p className="text-sm font-bold text-yellow-600 mb-2">🏢 Use Cases:</p>
                          <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{q.useCases}</p>
                        </div>
                      )}

                      {q.keyPoints && q.keyPoints.length > 0 && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                          <p className="text-sm font-bold text-cyan-600 mb-2">⭐ Key Points:</p>
                          <div className="flex flex-wrap gap-2">
                            {q.keyPoints.map((kp, i) => (
                              <span key={i} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}>
                                {kp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.commonMistakes && q.commonMistakes.length > 0 && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                          <p className="text-sm font-bold text-red-600 mb-2">⚠️ Common Mistakes:</p>
                          <div className="flex flex-wrap gap-2">
                            {q.commonMistakes.map((cm, i) => (
                              <span key={i} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                                {cm}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.bestPractices && q.bestPractices.length > 0 && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
                          <p className="text-sm font-bold text-green-600 mb-2">✅ Best Practices:</p>
                          <div className="flex flex-wrap gap-2">
                            {q.bestPractices.map((bp, i) => (
                              <span key={i} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                {bp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Legacy tips support */}
                      {q.tips && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {q.tips.map((tip, i) => (
                            <span key={i} className={`px-2 py-1 rounded text-xs ${
                              darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                            }`}>
                              💡 {tip}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedQuestion(null)}
                        className="w-full py-2 text-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        ▲ Collapse
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedQuestion(idx)}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                    >
                      ▼ View Details
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}