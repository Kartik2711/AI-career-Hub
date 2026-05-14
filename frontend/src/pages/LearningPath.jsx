import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

export default function LearningPath() {
  const { darkMode } = useTheme()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedPath, setSelectedPath] = useState(null)
  const [currentPhaseContent, setCurrentPhaseContent] = useState(null)
  const [formData, setFormData] = useState({
    topic: '',
    dreamJob: '',
    unitCount: 5
  })
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [explaining, setExplaining] = useState(false)

  useEffect(() => {
    fetchPaths()
  }, [])

  const fetchPaths = async () => {
    try {
      const res = await axios.get('/api/learning')
      setPaths(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSyllabus = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await axios.post('/api/learning/create-syllabus', formData)
      setPaths([res.data, ...paths])
      setSelectedPath(res.data)
      setFormData({ topic: '', dreamJob: '', unitCount: 5 })
      toast.success('Learning path created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create path')
    } finally {
      setCreating(false)
    }
  }

  const deletePath = async (id) => {
    try {
      await axios.delete(`/api/learning/${id}`)
      setPaths(paths.filter(p => p._id !== id))
      if (selectedPath?._id === id) setSelectedPath(null)
      toast.success('Path deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const startUnit = async (unitIndex) => {
    try {
      const res = await axios.post('/api/learning/start-unit', {
        pathId: selectedPath._id,
        unitNumber: unitIndex
      })
      setSelectedPath(res.data)
      setSelectedUnit(res.data.syllabus.units[unitIndex])
      setShowUnitModal(true)
      toast.success(`Started Unit ${unitIndex + 1}!`)
    } catch (err) {
      toast.error('Failed to start unit')
    }
  }

  const explainPhase = async (phaseIndex) => {
    setExplaining(true)
    try {
      const res = await axios.post('/api/learning/explain-phase', {
        pathId: selectedPath._id,
        unitIndex: selectedUnit.unitNumber - 1,
        phaseIndex
      })
      setCurrentPhaseContent(res.data)
      toast.success('Phase explained!')
    } catch (err) {
      toast.error('Failed to explain phase')
    } finally {
      setExplaining(false)
    }
  }

  const completePhase = async (phaseIndex) => {
    try {
      await axios.post('/api/learning/complete-phase', {
        pathId: selectedPath._id,
        unitIndex: selectedUnit.unitNumber - 1,
        phaseIndex
      })
      fetchPaths()
      setSelectedPath(null)
      toast.success('Phase completed!')
    } catch (err) {
      toast.error('Failed to complete phase')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="loader"></div></div>

  return (
    <div className={`space-y-6 ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>📚 AI Learning Path</h1>
        <p className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>Create a structured learning path with units and phases</p>
      </div>

      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Learning Path</h2>
        <form onSubmit={handleCreateSyllabus} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Enter any topic (e.g., DevOps, AWS, React, Python)"
              className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-dark-border border-dark-border text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'
              }`}
              required
            />
            <input
              type="text"
              value={formData.dreamJob}
              onChange={(e) => setFormData({ ...formData, dreamJob: e.target.value })}
              placeholder="Dream job (e.g., DevOps Engineer)"
              className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-dark-border border-dark-border text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'
              }`}
            />
            <select
              value={formData.unitCount}
              onChange={(e) => setFormData({ ...formData, unitCount: parseInt(e.target.value) })}
              className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <option value={3}>3 Units</option>
              <option value={5}>5 Units</option>
              <option value={7}>7 Units</option>
              <option value={10}>10 Units</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
          >
            {creating ? 'Creating...' : '🚀 Create Learning Path'}
          </button>
        </form>
        <p className={`mt-3 text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
          💡 Enter any topic - programming, DevOps, cloud, databases, frameworks, tools...
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Learning Paths ({paths.length})</h2>
          {paths.length > 0 ? (
            <div className={`space-y-3 max-h-[70vh] overflow-y-auto ${darkMode ? 'pr-2' : ''}`}>
              {paths.map(path => (
                <div
                  key={path._id}
                  onClick={() => setSelectedPath(path)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedPath?._id === path._id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : darkMode 
                        ? 'bg-dark-card border-dark-border hover:border-blue-500' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{path.topic}</h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {path.category && (
                          <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                            {path.category}
                          </span>
                        )}
                        {path.dreamJob && (
                          <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                            {path.dreamJob}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-2 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                        {path.syllabus?.units?.length || 0} Units
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePath(path._id) }}
                      className={`p-1 rounded ${darkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>No learning paths yet</p>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedPath ? (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPath.topic}</h2>
                  {selectedPath.category && (
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                      📂 {selectedPath.category}
                    </span>
                  )}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedPath.status === 'completed' 
                    ? 'bg-green-500/20 text-green-400' 
                    : darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedPath.status}
                </span>
              </div>

              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>📚 Syllabus Units</h3>
              <div className="space-y-4">
                {selectedPath.syllabus?.units?.map((unit, idx) => (
                  <div key={idx} className={`p-5 rounded-xl border transition-all ${
                    unit.completed 
                      ? 'border-green-500 bg-green-500/5' 
                      : darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            unit.completed 
                              ? 'bg-green-500 text-white' 
                              : darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {unit.unitNumber}
                          </span>
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{unit.title}</h4>
                        </div>
                        <p className={`mt-2 ml-11 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>{unit.description}</p>
                      </div>
                      <div className="ml-4">
                        {unit.completed ? (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">✓ Completed</span>
                        ) : (
                          <button
                            onClick={() => startUnit(idx)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-lg hover:shadow-glow transition-all"
                          >
                            Start Unit
                          </button>
                        )}
                      </div>
                    </div>
                    {unit.completed && (
                      <div className="mt-4 ml-11 flex flex-wrap gap-2">
                        {unit.phases?.map((phase, pIdx) => (
                          <span key={pIdx} className={`text-xs px-3 py-1 rounded-full ${
                            phase.completed 
                              ? 'bg-green-500/20 text-green-400' 
                              : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {phase.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-dark-border bg-dark-card' : 'border-gray-300 bg-gray-50'}`}>
              <p className={`text-center ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Select a learning path to view its syllabus</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Modal */}
      {showUnitModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Unit {selectedUnit.unitNumber}: {selectedUnit.title}
                </h2>
                {selectedUnit.phases?.[0]?.type && (
                  <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedUnit.phases[0].type}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setShowUnitModal(false); setCurrentPhaseContent(null) }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-100'}`}
              >
                ✕
              </button>
            </div>

            <p className={`mb-6 ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>{selectedUnit.description}</p>

            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>📖 Phases</h3>
            <div className="space-y-3 mb-6">
              {selectedUnit.phases?.map((phase, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    phase.completed 
                      ? 'border-green-500 bg-green-500/5' 
                      : darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          phase.completed 
                            ? 'bg-green-500 text-white' 
                            : darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {phase.phaseNumber}
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{phase.title}</span>
                      </div>
                      {phase.content && (
                        <p className={`text-sm mt-1 ml-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Content loaded</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {phase.completed ? (
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">✓ Done</span>
                      ) : (
                        <>
                          <button
                            onClick={() => explainPhase(idx)}
                            disabled={explaining}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-lg hover:shadow-glow transition-all disabled:opacity-50"
                          >
                            {explaining ? 'Explaining...' : '📚 Explain'}
                          </button>
                          {phase.content && (
                            <button
                              onClick={() => completePhase(idx)}
                              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                            >
                              ✓ Mark Done
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentPhaseContent && (
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📚 {currentPhaseContent.phase.title}
                </h3>
                
                {currentPhaseContent.phase.type && (
                  <span className={`inline-block mb-4 px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    Type: {currentPhaseContent.phase.type}
                  </span>
                )}

                {currentPhaseContent.phase.detailedContent && (
                  <div className={`mb-6 whitespace-pre-line leading-relaxed ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                    {currentPhaseContent.phase.detailedContent}
                  </div>
                )}

                {currentPhaseContent.phase.codeSnippets?.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>💻 Code Examples:</h4>
                    {currentPhaseContent.phase.codeSnippets.map((snippet, i) => (
                      <div key={i} className={`p-4 rounded-lg mb-2 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white font-mono text-sm`}>
                        <span className="text-gray-400">{snippet.language}</span>
                        <pre className="mt-2 overflow-x-auto">{snippet.code}</pre>
                      </div>
                    ))}
                  </div>
                )}

                {currentPhaseContent.phase.examples?.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>💡 Examples:</h4>
                    <ul className="space-y-2">
                      {currentPhaseContent.phase.examples.map((ex, i) => (
                        <li key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-white'}`}>
                          <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span>
                          <span className={`ml-2 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentPhaseContent.phase.keyConcepts?.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🔑 Key Concepts:</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentPhaseContent.phase.keyConcepts.map((kc, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {kc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentPhaseContent.phase.commonMistakes?.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>⚠️ Common Mistakes:</h4>
                    <ul className="space-y-2">
                      {currentPhaseContent.phase.commonMistakes.map((mistake, i) => (
                        <li key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
                          darkMode ? 'bg-red-500/10' : 'bg-red-50'
                        }`}>
                          <span className="text-red-500">✗</span>
                          <span className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentPhaseContent.phase.useCases?.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🎯 Use Cases:</h4>
                    <ul className="space-y-2">
                      {currentPhaseContent.phase.useCases.map((uc, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{uc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentPhaseContent.phase.summary && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>📋 Summary:</h4>
                    <p className={darkMode ? 'text-dark-muted' : 'text-gray-700'}>{currentPhaseContent.phase.summary}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}