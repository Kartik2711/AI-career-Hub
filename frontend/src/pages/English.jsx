import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function English() {
  const { token } = useAuth()
  const { darkMode } = useTheme()
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [expandedWord, setExpandedWord] = useState(null)

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    try {
      const res = await axios.get('/api/english', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWords(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const generateWords = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/english/generate',
        { count: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setWords(prev => [...res.data, ...prev])
      toast.success('10 new words generated!')
    } catch (error) {
      toast.error('Failed to generate words')
    }
    setLoading(false)
  }

  const toggleLearned = async (id) => {
    try {
      const res = await axios.put(`/api/english/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setWords(prev => prev.map(w => w._id === id ? res.data : w))
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const deleteWord = async (id) => {
    try {
      await axios.delete(`/api/english/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWords(prev => prev.filter(w => w._id !== id))
      toast.success('Word deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const filteredWords = filter === 'all' ? words : 
    filter === 'learned' ? words.filter(w => w.learned) : 
    words.filter(w => !w.learned)

  const learnedCount = words.filter(w => w.learned).length

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📚 English Learning
        </h1>
        <button
          onClick={generateWords}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
        >
          {loading ? 'Generating...' : '🎯 Generate 10 Words'}
        </button>
      </div>

      <div className={`grid md:grid-cols-4 gap-4 mb-6`}>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Total Words</p>
          <p className="text-2xl font-bold">{words.length}</p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Learned</p>
          <p className="text-2xl font-bold text-green-500">{learnedCount}</p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Remaining</p>
          <p className="text-2xl font-bold text-blue-500">{words.length - learnedCount}</p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Progress</p>
          <p className="text-2xl font-bold text-purple-500">
            {words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {['all', 'learned', 'unlearned'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-dark-border text-dark-muted hover:text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {words.length === 0 ? (
        <div className={`text-center py-16 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
          <p className="text-5xl mb-4">📖</p>
          <p className="text-lg">No words yet. Generate your first 10 words!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWords.map(word => (
            <div
              key={word._id}
              className={`p-4 rounded-xl border transition-all ${
                darkMode 
                  ? 'bg-dark-card border-dark-border hover:border-blue-500/50' 
                  : 'bg-white border-gray-200 hover:border-blue-300'
              } ${word.learned ? 'border-green-500/50 bg-green-500/5' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className={`text-xl font-bold ${word.learned ? 'text-green-500 line-through' : ''}`}>
                      {word.word}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {word.partOfSpeech}
                    </span>
                    {word.pronunciation && (
                      <span className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                        /{word.pronunciation}/
                      </span>
                    )}
                    {word.category && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {word.category}
                      </span>
                    )}
                  </div>
                  <p className={`mb-2 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>{word.meaning}</p>
                  {word.example && (
                    <p className={`text-sm italic ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      "{word.example}"
                    </p>
                  )}

                  {expandedWord === word._id && (
                    <div className="mt-4 space-y-3">
                      {word.synonyms && word.synonyms.length > 0 && (
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                          <p className="text-sm font-bold text-yellow-600 mb-1">🔄 Synonyms:</p>
                          <div className="flex flex-wrap gap-2">
                            {word.synonyms.map((s, i) => (
                              <span key={i} className={`px-2 py-1 rounded text-xs ${
                                darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {word.antonyms && word.antonyms.length > 0 && (
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                          <p className="text-sm font-bold text-red-600 mb-1">🔄 Antonyms:</p>
                          <div className="flex flex-wrap gap-2">
                            {word.antonyms.map((a, i) => (
                              <span key={i} className={`px-2 py-1 rounded text-xs ${
                                darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                              }`}>
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {word.usage && (
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                          <p className="text-sm font-bold text-cyan-600 mb-1">📝 Usage Tips:</p>
                          <p className={darkMode ? 'text-dark-muted text-sm' : 'text-gray-700 text-sm'}>{word.usage}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => toggleLearned(word._id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      word.learned 
                        ? 'bg-green-500 text-white' 
                        : darkMode ? 'bg-dark-border hover:bg-green-500/20' : 'bg-gray-200 hover:bg-green-100'
                    }`}
                  >
                    {word.learned ? '✓ Learned' : 'Mark Learned'}
                  </button>
                  <button
                    onClick={() => setExpandedWord(expandedWord === word._id ? null : word._id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {expandedWord === word._id ? '▲ Less' : '▼ More'}
                  </button>
                  <button
                    onClick={() => deleteWord(word._id)}
                    className={`p-1 rounded-lg text-sm transition-colors ${
                      darkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}