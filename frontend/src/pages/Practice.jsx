import { useState, useEffect } from 'react'
import axios from 'axios'
import Editor from '@monaco-editor/react'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

const codingTopics = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Dynamic Programming', 
  'Graphs', 'Sorting', 'Searching', 'Stack', 'Queue', 'Hash Table', 'Recursion'
]

export default function Practice() {
  const { darkMode } = useTheme()
  const [mode, setMode] = useState('aptitude')
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [difficulty, setDifficulty] = useState('mixed')
  const [questionCount, setQuestionCount] = useState(15)
  
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [generating, setGenerating] = useState(false)

  const [codingQuestions, setCodingQuestions] = useState([])
  const [currentCodingQ, setCurrentCodingQ] = useState(0)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState(null)
  const [codingGenerating, setCodingGenerating] = useState(false)
  const [codingCount, setCodingCount] = useState(5)

  useEffect(() => {
    if (mode === 'aptitude') {
      axios.get('/api/practice/aptitude/topics').then(res => setTopics(res.data))
    } else {
      fetchCodingQuestions()
    }
  }, [mode])

  useEffect(() => {
    let timer
    if (showResult === false && timeLeft > 0 && questions.length > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && !showResult && selectedAnswer) {
      handleSubmit()
    }
    return () => clearInterval(timer)
  }, [timeLeft, showResult, questions, selectedAnswer])

  const generateQuestions = async () => {
    if (!selectedTopic) {
      toast.error('Please select a topic first')
      return
    }
    setGenerating(true)
    try {
      const res = await axios.post('/api/practice/aptitude/generate', {
        topic: selectedTopic,
        difficulty: difficulty,
        count: questionCount
      })
      setQuestions(res.data)
      setCurrentQ(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(60)
      toast.success(`Generated ${res.data.length} questions!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedAnswer) return
    try {
      const res = await axios.post('/api/practice/aptitude/submit', {
        questionId: questions[currentQ]._id,
        answer: selectedAnswer,
        timeTaken: 60 - timeLeft
      })
      setShowResult(true)
      if (res.data.isCorrect) {
        toast.success('Correct! 🎉')
      } else {
        toast.error('Wrong answer')
      }
    } catch (err) {
      toast.error('Failed to submit')
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(60)
    } else {
      toast.success('Quiz completed!')
    }
  }

  const generateCodingQuestions = async () => {
    if (!selectedTopic) {
      toast.error('Please select a topic first')
      return
    }
    setCodingGenerating(true)
    try {
      const res = await axios.post('/api/questions/generate', {
        type: 'coding',
        topic: selectedTopic,
        difficulty: difficulty === 'mixed' ? 'intermediate' : difficulty,
        count: codingCount
      })
      setCodingQuestions(res.data)
      setCurrentCodingQ(0)
      setCode('')
      setOutput(null)
      toast.success(`Generated ${res.data.length} coding problems!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate coding questions')
    } finally {
      setCodingGenerating(false)
    }
  }

  const fetchCodingQuestions = async (diff = '') => {
    try {
      const res = await axios.get(`/api/practice/coding/questions?${diff ? `difficulty=${diff}` : ''}`)
      setCodingQuestions(res.data)
      setCurrentCodingQ(0)
      setCode('')
      setOutput(null)
    } catch (err) {
      console.error('Failed to load questions')
    }
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }
    if (!codingQuestions[currentCodingQ]?._id) {
      toast.error('No question selected')
      return
    }
    
    setOutput({ status: 'Running...', output: '' })
    try {
      const res = await axios.post('/api/practice/coding/submit', {
        questionId: codingQuestions[currentCodingQ]._id,
        code,
        language
      })
      setOutput({
        status: res.data.status,
        output: res.data.output,
        isCorrect: res.data.isCorrect
      })
      if (res.data.isCorrect) {
        toast.success('Correct! All test cases passed! 🎉')
      } else {
        toast.error('Wrong answer - check your output')
      }
    } catch (err) {
      setOutput({ status: 'Error', output: err.response?.data?.message || 'Failed to run code' })
    }
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        💻 Coding Practice
      </h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => { setMode('aptitude'); setSelectedTopic(''); setQuestions([]) }}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
            mode === 'aptitude' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : (darkMode ? 'bg-dark-border text-dark-muted hover:text-white' : 'bg-gray-200 text-gray-700')
          }`}
        >
          🧮 Aptitude
        </button>
        <button
          onClick={() => { setMode('coding'); setSelectedTopic(''); setCodingQuestions([]) }}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
            mode === 'coding' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : (darkMode ? 'bg-dark-border text-dark-muted hover:text-white' : 'bg-gray-200 text-gray-700')
          }`}
        >
          💻 Coding
        </button>
      </div>

      {mode === 'aptitude' ? (
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generate Practice Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => { setSelectedTopic(e.target.value); setQuestions([]) }}
                  className={`w-full px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="">Select Topic</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="mixed">Mixed</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className={`w-full px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value={15}>15 Questions</option>
                  <option value={25}>25 Questions</option>
                  <option value={50}>50 Questions</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateQuestions}
                  disabled={generating || !selectedTopic}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-glow disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {questions.length > 0 ? (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>
                    Question {currentQ + 1} of {questions.length}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-100 text-gray-700'}`}>
                    {questions[currentQ]?.difficulty}
                  </span>
                </div>
                <span className={`text-lg font-bold ${timeLeft <= 15 ? 'text-red-500' : 'text-blue-500'}`}>
                  ⏱ {timeLeft}s
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {questions[currentQ]?.title}
                </h3>
                <p className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>
                  {questions[currentQ]?.description}
                </p>
              </div>
              
              <div className="space-y-2 mb-4">
                {questions[currentQ]?.options?.map((opt, idx) => {
                  const optionLetter = ['A', 'B', 'C', 'D'][idx]
                  return (
                    <button
                      key={idx}
                      onClick={() => !showResult && setSelectedAnswer(opt._id)}
                      disabled={showResult}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                        selectedAnswer === opt._id 
                          ? (darkMode ? 'border-blue-500 bg-blue-500/20' : 'border-blue-500 bg-blue-50')
                          : (darkMode ? 'border-dark-border hover:border-dark-muted' : 'hover:bg-gray-50')
                      } ${
                        showResult && opt.isCorrect 
                          ? (darkMode ? 'border-green-500 bg-green-500/20' : 'border-green-500 bg-green-50')
                          : ''
                      } ${
                        showResult && selectedAnswer === opt._id && !opt.isCorrect 
                          ? (darkMode ? 'border-red-500 bg-red-500/20' : 'border-red-500 bg-red-50')
                          : ''
                      }`}
                    >
                      <span className={`font-bold ${darkMode ? 'text-dark-muted' : 'text-gray-400'}`}>
                        {optionLetter})
                      </span>
                      <span className={darkMode ? 'text-white' : 'text-gray-700'}>
                        {opt.text}
                      </span>
                    </button>
                  )
                })}
              </div>

              {showResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>📝 Solution:</h4>
                    <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>
                      {questions[currentQ]?.solution}
                    </p>
                  </div>
                  {questions[currentQ]?.trick && (
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>⚡ Shortcut Trick:</h4>
                      <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>
                        {questions[currentQ]?.trick}
                      </p>
                    </div>
                  )}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>📖 Explanation:</h4>
                    <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>
                      {questions[currentQ]?.explanation}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {!showResult ? (
                  <button 
                    onClick={handleSubmit} 
                    disabled={!selectedAnswer} 
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    Submit
                  </button>
                ) : (
                  <button 
                    onClick={nextQuestion} 
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium"
                  >
                    {currentQ < questions.length - 1 ? 'Next →' : 'Finish'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-2xl border border-dashed text-center ${darkMode ? 'border-dark-border bg-dark-card' : 'border-gray-300 bg-gray-50'}`}>
              <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>
                Select a topic and generate questions to start!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generate Coding Problems
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="">Select Topic</option>
                  {codingTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>Problems</label>
                <select
                  value={codingCount}
                  onChange={(e) => setCodingCount(parseInt(e.target.value))}
                  className={`w-full px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value={5}>5 Problems</option>
                  <option value={10}>10 Problems</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateCodingQuestions}
                  disabled={codingGenerating || !selectedTopic}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {codingGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {codingQuestions.length > 0 ? (
            <>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {codingQuestions[currentCodingQ]?.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-100 text-gray-700'}`}>
                      {codingQuestions[currentCodingQ]?.difficulty}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentCodingQ(Math.max(0, currentCodingQ - 1))}
                      disabled={currentCodingQ === 0}
                      className={`px-3 py-1.5 rounded-lg ${darkMode ? 'bg-dark-border text-dark-muted disabled:opacity-50' : 'bg-gray-200 text-gray-700 disabled:opacity-50'}`}
                    >
                      ← Prev
                    </button>
                    <span className={`px-3 py-1.5 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                      {currentCodingQ + 1} / {codingQuestions.length}
                    </span>
                    <button
                      onClick={() => setCurrentCodingQ(Math.min(codingQuestions.length - 1, currentCodingQ + 1))}
                      disabled={currentCodingQ === codingQuestions.length - 1}
                      className={`px-3 py-1.5 rounded-lg ${darkMode ? 'bg-dark-border text-dark-muted disabled:opacity-50' : 'bg-gray-200 text-gray-700 disabled:opacity-50'}`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
                <p className={`text-sm mb-3 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                  {codingQuestions[currentCodingQ]?.description}
                </p>
                <div className="flex gap-2 items-center">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`px-3 py-1.5 border rounded-lg ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                  <button
                    onClick={() => {
                      if (codingQuestions[currentCodingQ]?.solution) {
                        setCode(codingQuestions[currentCodingQ].solution)
                        toast.success('Solution loaded!')
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}
                  >
                    Show Solution
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-dark-border' : 'border-gray-200'}`}>
                  <div className={`px-3 py-2.5 border-b font-medium flex justify-between ${darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-100 text-gray-700'}`}>
                    <span>Code Editor</span>
                    <span className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                      {language}
                    </span>
                  </div>
                  <Editor
                    height="400px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme={darkMode ? 'vs-dark' : 'vs-light'}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                  />
                </div>

                <div className="space-y-4">
                  <div className={`rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
                    <div className={`px-3 py-2.5 border-b font-medium ${darkMode ? 'text-dark-muted border-dark-border' : 'text-gray-700 border-gray-200'}`}>
                      Output Console
                    </div>
                    <div className={`p-4 min-h-[300px] font-mono text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                      {output ? (
                        <div className={output.isCorrect ? 'text-green-500' : ''}>
                          <div className="mb-2">Status: {output.status}</div>
                          <pre className="whitespace-pre-wrap">{output.output || 'No output'}</pre>
                        </div>
                      ) : (
                        <span className={darkMode ? 'text-dark-muted' : 'text-gray-400'}>
                          Write code and click "Run Code" to see output
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={runCode}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-glow"
                  >
                    ▶ Run Code
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={`p-8 rounded-2xl border border-dashed text-center ${darkMode ? 'border-dark-border bg-dark-card' : 'border-gray-300 bg-gray-50'}`}>
              <p className={`mb-4 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                Select a topic and generate coding problems to practice!
              </p>
              <p className={`text-sm ${darkMode ? 'text-dark-muted opacity-60' : 'text-gray-400'}`}>
                Write your solution in the editor and run to check against test cases
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}