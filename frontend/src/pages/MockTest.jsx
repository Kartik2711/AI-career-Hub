import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function MockTest() {
  const { token } = useAuth()
  const { darkMode } = useTheme()
  const [tests, setTests] = useState([])
  const [currentTest, setCurrentTest] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({ topic: '', type: 'mixed' })

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await axios.get('/api/mock-test', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTests(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createTest = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    setCreating(true)
    try {
      const res = await axios.post('/api/mock-test/create',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCurrentTest(res.data)
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setTests([res.data, ...tests])
      toast.success('Test created!')
    } catch (error) {
      toast.error('Failed to create test')
    }
    setCreating(false)
  }

  const submitAnswer = async () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer')
      return
    }
    try {
      await axios.post('/api/mock-test/answer',
        { testId: currentTest._id, questionIndex: currentQuestion, userAnswer: selectedAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (currentQuestion < currentTest.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        completeTest()
      }
    } catch (error) {
      toast.error('Failed to submit answer')
    }
  }

  const completeTest = async () => {
    try {
      const res = await axios.post('/api/mock-test/complete',
        { testId: currentTest._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCurrentTest(res.data)
      setShowResult(true)
      fetchTests()
      toast.success('Test completed!')
    } catch (error) {
      toast.error('Failed to complete test')
    }
  }

  const getStats = async () => {
    try {
      const res = await axios.get('/api/mock-test/stats/summary', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    } catch (error) {
      return null
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="loader"></div></div>
  }

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        📝 Mock Test
      </h1>

      {!currentTest ? (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Test</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[250px]">
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., JavaScript, Aptitude, React, Data Structures"
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`px-4 py-3 rounded-xl border ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="mixed">Mixed</option>
                  <option value="aptitude">Aptitude</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <button
                onClick={createTest}
                disabled={creating}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
              >
                {creating ? 'Creating...' : '🎯 Start Test'}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Tests</h3>
              {tests.length > 0 ? (
                <div className="space-y-3">
                  {tests.slice(0, 5).map(test => (
                    <div
                      key={test._id}
                      onClick={() => { setCurrentTest(test); setShowResult(test.status === 'completed') }}
                      className={`p-4 rounded-xl border cursor-pointer ${darkMode ? 'bg-dark-border border-dark-border hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{test.topic}</h4>
                          <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>{test.totalQuestions} questions</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${test.score >= 70 ? 'text-green-500' : test.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {test.score}%
                          </span>
                          <p className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>{test.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>No tests yet</p>
              )}
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'Python', 'SQL', 'Aptitude', 'Data Structures', 'Node.js', 'CSS'].map(topic => (
                  <button
                    key={topic}
                    onClick={() => { setFormData({ ...formData, topic }); createTest() }}
                    disabled={creating}
                    className={`px-4 py-2 rounded-full text-sm transition-all hover:scale-105 ${
                      darkMode ? 'bg-dark-border hover:bg-blue-500/20' : 'bg-gray-100 hover:bg-blue-100'
                    }`}
                  >
                    {topic} +
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : showResult ? (
        <div className="space-y-6">
          <div className={`text-center p-8 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Test Completed!</h2>
            <div className={`text-6xl font-bold mb-4 ${currentTest.score >= 70 ? 'text-green-500' : currentTest.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
              {currentTest.score}%
            </div>
            <p className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>
              {currentTest.correctAnswers} out of {currentTest.totalQuestions} correct
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <p className="text-sm opacity-70">Correct</p>
              <p className="text-2xl font-bold text-green-500">{currentTest.correctAnswers}</p>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <p className="text-sm opacity-70">Wrong</p>
              <p className="text-2xl font-bold text-red-500">{currentTest.totalQuestions - currentTest.correctAnswers}</p>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <p className="text-sm opacity-70">Total</p>
              <p className="text-2xl font-bold text-blue-500">{currentTest.totalQuestions}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Review Answers</h3>
            {currentTest.questions.map((q, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} ${
                q.userAnswer === q.correctAnswer ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">Q{idx + 1}: {q.question}</span>
                  <span className={q.userAnswer === q.correctAnswer ? 'text-green-500' : 'text-red-500'}>
                    {q.userAnswer === q.correctAnswer ? '✓' : '✗'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-2 rounded ${
                      i === q.correctAnswer ? 'bg-green-500/20 text-green-500' :
                      i === q.userAnswer ? 'bg-red-500/20 text-red-500' : ''
                    }`}>
                      {i + 1}. {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className={`mt-2 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setCurrentTest(null); setShowResult(false) }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium"
          >
            ← Back to Tests
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentTest.topic} - Question {currentQuestion + 1}/{currentTest.totalQuestions}
            </h3>
            <button
              onClick={() => { setCurrentTest(null); setShowResult(false) }}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-200'}`}
            >
              Exit
            </button>
          </div>

          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentTest.questions[currentQuestion]?.question}
            </h3>

            <div className="space-y-3">
              {currentTest.questions[currentQuestion]?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedAnswer === idx
                      ? 'border-blue-500 bg-blue-500/10'
                      : darkMode ? 'border-dark-border hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`font-medium mr-3 ${
                    selectedAnswer === idx ? 'text-blue-500' : ''
                  }`}>{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {currentQuestion === currentTest.totalQuestions - 1 ? 'Submit Test' : 'Next Question'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}