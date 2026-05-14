import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

export default function Notes() {
  const { darkMode } = useTheme()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [topic, setTopic] = useState('')
  const [dreamJob, setDreamJob] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/notes')
      setNotes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const res = await axios.post('/api/notes/generate', { topic, dreamJob })
      setNotes([res.data, ...notes])
      setSelectedNote(res.data)
      setTopic('')
      toast.success('Note generated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate note')
    } finally {
      setGenerating(false)
    }
  }

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`)
      setNotes(notes.filter(n => n._id !== id))
      if (selectedNote?._id === id) setSelectedNote(null)
      toast.success('Note deleted')
    } catch (err) {
      toast.error('Failed to delete note')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="loader"></div></div>

  return (
    <div className={`space-y-6 ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>📝 Study Notes</h1>

      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generate Detailed Notes</h2>
        <form onSubmit={handleGenerate} className="flex gap-4 flex-wrap">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter any topic (e.g., CI/CD, Docker, Kubernetes, React, Python)"
            className={`flex-1 min-w-[250px] px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-dark-border border-dark-border text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'
            }`}
            required
          />
          <input
            type="text"
            value={dreamJob}
            onChange={(e) => setDreamJob(e.target.value)}
            placeholder="Dream job (e.g., DevOps Engineer, Full Stack Developer)"
            className={`flex-1 min-w-[250px] px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-dark-border border-dark-border text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'
            }`}
          />
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : '🚀 Generate'}
          </button>
        </form>
        <p className={`mt-3 text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
          💡 Enter any topic - programming languages, frameworks, DevOps, cloud, databases, tools, concepts...
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Notes ({notes.length})</h2>
          {notes.length > 0 ? (
            <div className={`space-y-3 max-h-[70vh] overflow-y-auto ${darkMode ? 'pr-2' : ''}`}>
              {notes.map(note => (
                <div
                  key={note._id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedNote?._id === note._id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : darkMode 
                        ? 'bg-dark-card border-dark-border hover:border-blue-500' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{note.topic}</h3>
                      <div className="flex gap-2 mt-2">
                        {note.category && (
                          <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                            {note.category}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-2 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                        {note.content?.keyPoints?.slice(0, 2).join(' • ') || 'No preview'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNote(note._id) }}
                      className={`p-1 rounded ${darkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>No notes yet. Generate your first note above!</p>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedNote ? (
            <div className={`p-6 rounded-2xl border max-h-[75vh] overflow-y-auto ${
              darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedNote.topic}</h2>
                  {selectedNote.category && (
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                      darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                    }`}>
                      📂 {selectedNote.category}
                    </span>
                  )}
                </div>
              </div>

              {selectedNote.content?.prerequisites?.length > 0 && (
                <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                  <h3 className="font-semibold text-lg mb-2 text-orange-600">📋 Prerequisites</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.content.prerequisites.map((prereq, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded text-sm ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNote.content?.overview && (
                <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <h3 className="font-semibold text-lg mb-2 text-blue-600">📝 Overview</h3>
                  <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{selectedNote.content.overview}</p>
                </div>
              )}

              {selectedNote.content?.detailedExplanation && (
                <div className="mb-6">
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>📖 Detailed Explanation</h3>
                  <div className={`whitespace-pre-line leading-relaxed ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                    {selectedNote.content.detailedExplanation}
                  </div>
                </div>
              )}

              {selectedNote.content?.toolsAndTechnologies?.length > 0 && (
                <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                  <h3 className="font-semibold text-lg mb-2 text-cyan-600">🛠️ Related Tools & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.content.toolsAndTechnologies.map((tool, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNote.content?.examples?.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>💡 Examples</h3>
                  <ul className="space-y-3">
                    {selectedNote.content.examples.map((ex, idx) => (
                      <li key={idx} className={`p-4 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Example {idx + 1}:</span>
                        <p className={`mt-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>{ex}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNote.content?.useCases?.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🎯 Real-World Use Cases</h3>
                  <ul className="space-y-2">
                    {selectedNote.content.useCases.map((uc, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNote.content?.relatedTopics?.length > 0 && (
                <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                  <h3 className="font-semibold text-lg mb-2 text-yellow-600">🔗 Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.content.relatedTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTopic(topic)
                          handleGenerate({ preventDefault: () => {} })
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${
                          darkMode ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {topic} +
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedNote.content?.keyPoints?.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🔑 Key Points</h3>
                  <ul className="space-y-2">
                    {selectedNote.content.keyPoints.map((kp, idx) => (
                      <li key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                        <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{idx + 1}.</span>
                        <span className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNote.content?.commonMistakes?.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>⚠️ Common Mistakes to Avoid</h3>
                  <ul className="space-y-2">
                    {selectedNote.content.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                        <span className="text-red-500 mt-1">✗</span>
                        <span className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNote.content?.bestPractices?.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>✅ Best Practices</h3>
                  <ul className="space-y-2">
                    {selectedNote.content.bestPractices.map((practice, idx) => (
                      <li key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${darkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
                        <span className="text-green-500 mt-1">★</span>
                        <span className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNote.content?.summary && (
                <div className={`mt-6 p-5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>📋 Summary</h3>
                  <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{selectedNote.content.summary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-dark-border bg-dark-card' : 'border-gray-300 bg-gray-50'}`}>
              <p className={`text-center ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Select a note to view its detailed content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}