import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

const jobRoles = [
  'Data Analyst', 'Software Engineer', 'Cybersecurity Analyst', 
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Cloud Engineer', 'AI Engineer', 'Product Manager'
]

export default function Roadmap() {
  const { darkMode } = useTheme()
  const [roadmaps, setRoadmaps] = useState([])
  const [selectedRoadmap, setSelectedRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    dreamJob: '',
    currentSkills: [],
    duration: '90'
  })
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  const fetchRoadmaps = async () => {
    try {
      const res = await axios.get('/api/roadmap/all')
      setRoadmaps(res.data)
      if (res.data.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(res.data[0])
      }
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
      const res = await axios.post('/api/roadmap/generate', formData)
      setRoadmaps([res.data, ...roadmaps])
      setSelectedRoadmap(res.data)
      setShowForm(false)
      setFormData({ dreamJob: '', currentSkills: [], duration: '90' })
      toast.success('Roadmap generated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  const toggleTask = async (taskId) => {
    try {
      await axios.put(`/api/roadmap/${selectedRoadmap._id}/task/${taskId}`, { completed: true })
      fetchRoadmaps()
      toast.success('Task completed!')
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const deleteRoadmap = async (id) => {
    if (!confirm('Are you sure you want to delete this roadmap?')) return
    try {
      await axios.delete(`/api/roadmap/${id}`)
      const updatedRoadmaps = roadmaps.filter(r => r._id !== id)
      setRoadmaps(updatedRoadmaps)
      if (selectedRoadmap?._id === id) {
        setSelectedRoadmap(updatedRoadmaps[0] || null)
      }
      toast.success('Roadmap deleted!')
    } catch (err) {
      toast.error('Failed to delete roadmap')
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.currentSkills.includes(skillInput.trim())) {
      setFormData({ ...formData, currentSkills: [...formData.currentSkills, skillInput.trim()] })
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setFormData({ ...formData, currentSkills: formData.currentSkills.filter(s => s !== skill) })
  }

  if (loading) return <div className="flex justify-center py-20"><div className="loader"></div></div>

  return (
    <div className={`space-y-6 ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🗺️ Career Roadmap
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
        >
          + Create New Roadmap
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl w-full max-w-lg p-6 ${darkMode ? 'bg-dark-card' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Generate New Roadmap
              </h2>
              <button 
                onClick={() => setShowForm(false)} 
                className={`${darkMode ? 'text-dark-muted hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                  Dream Job Role
                </label>
                <select
                  value={formData.dreamJob}
                  onChange={(e) => setFormData({ ...formData, dreamJob: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                  required
                >
                  <option value="">Select a role</option>
                  {jobRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                  Current Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    className={`flex-1 px-3 py-2.5 border rounded-xl ${darkMode ? 'bg-dark-border border-dark-border text-white' : 'bg-gray-50 border-gray-200'}`}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button 
                    type="button" 
                    onClick={addSkill} 
                    className={`px-4 py-2.5 rounded-xl ${darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.currentSkills.map(skill => (
                    <span 
                      key={skill} 
                      className={`px-3 py-1 rounded-full text-sm ${
                        darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {skill} <button type="button" onClick={() => removeSkill(skill)} className="ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                  Duration
                </label>
                <div className="flex gap-4">
                  {['30', '60', '90'].map(d => (
                    <label key={d} className={`flex items-center ${darkMode ? 'text-dark-muted' : 'text-gray-700'}`}>
                      <input
                        type="radio"
                        name="duration"
                        value={d}
                        checked={formData.duration === d}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="mr-2"
                      />
                      {d} Days
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Roadmap'}
              </button>
            </form>
          </div>
        </div>
      )}

      {roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Roadmaps ({roadmaps.length})
              </h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {roadmaps.map(roadmap => (
                  <div
                    key={roadmap._id}
                    onClick={() => setSelectedRoadmap(roadmap)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedRoadmap?._id === roadmap._id 
                        ? (darkMode ? 'border-blue-500 bg-blue-500/20' : 'border-blue-500 bg-blue-50')
                        : (darkMode ? 'border-dark-border hover:border-dark-muted' : 'bg-gray-50 hover:bg-gray-100')
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {roadmap.dreamJob}
                        </h4>
                        <p className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                          {roadmap.duration} days • {new Date(roadmap.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRoadmap(roadmap._id) }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedRoadmap?.roadmap?.weeks ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
                  <div>
                    <h2 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      🎯 {selectedRoadmap.dreamJob}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                      {selectedRoadmap.duration} Day Roadmap
                    </p>
                  </div>
                </div>
                {selectedRoadmap.roadmap.weeks.map((week) => (
                  <div 
                    key={week.week} 
                    className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Week {week.week}: {week.focus}
                    </h3>
                    <div className="mb-4">
                      <span className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Topics: </span>
                      {week.topics?.map(topic => (
                        <span 
                          key={topic} 
                          className={`inline-block px-2 py-1 rounded text-sm mr-1 mb-1 ${
                            darkMode ? 'bg-dark-border text-dark-muted' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="mb-4">
                      <span className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Tools: </span>
                      {week.tools?.map(tool => (
                        <span 
                          key={tool} 
                          className={`inline-block px-2 py-1 rounded text-sm mr-1 mb-1 ${
                            darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Daily Tasks:</h4>
                      {week.dailyTasks?.map(task => (
                        <div 
                          key={task.day} 
                          className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                            darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task._id)}
                            className="w-4 h-4"
                          />
                          <span className={task.completed ? `line-through ${darkMode ? 'text-dark-muted' : 'text-gray-400'}` : (darkMode ? 'text-white' : 'text-gray-700')}>
                            Day {task.day}: {task.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-6 rounded-2xl border border-dashed text-center ${darkMode ? 'border-dark-border bg-dark-card' : 'border-gray-300 bg-gray-50'}`}>
                <p className={darkMode ? 'text-dark-muted' : 'text-gray-500'}>Select a roadmap to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`p-8 rounded-2xl border text-center ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className={`mb-4 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
            No roadmaps yet. Create your first roadmap!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow"
          >
            Generate Roadmap
          </button>
        </div>
      )}
    </div>
  )
}