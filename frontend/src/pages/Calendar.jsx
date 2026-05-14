import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Calendar() {
  const { token } = useAuth()
  const { darkMode } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({})
  const [stats, setStats] = useState(null)
  const [showLogModal, setShowLogModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [logForm, setLogForm] = useState({ type: 'coding', status: 'completed', duration: 30, details: '', problemName: '', problemUrl: '' })
  const [selectedDayLogs, setSelectedDayLogs] = useState(null)

  useEffect(() => {
    fetchCalendar()
    fetchStats()
  }, [currentDate.getMonth() + 1, currentDate.getFullYear()])

  const fetchCalendar = async () => {
    try {
      const res = await axios.get(`/api/practicelog/calendar?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCalendarData(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/practicelog/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setSelectedDayLogs(calendarData[dateStr] || null)
  }

  const submitLog = async () => {
    try {
      await axios.post('/api/practicelog/log',
        { ...logForm, date: selectedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Practice logged!')
      setShowLogModal(false)
      setLogForm({ type: 'coding', status: 'completed', duration: 30, details: '', problemName: '', problemUrl: '' })
      fetchCalendar()
      fetchStats()
    } catch (error) {
      toast.error('Failed to log practice')
    }
  }

  const getDayStatus = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarData[dateStr]
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const typeIcons = { coding: '💻', aptitude: '📊', interview: '🎯', english: '📚' }

  return (
    <div className={`animate-fade-in ${darkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        📅 Practice Calendar
      </h1>

      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Current Streak</p>
          <p className="text-2xl font-bold text-orange-500">{stats?.currentStreak || 0} 🔥</p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Longest Streak</p>
          <p className="text-2xl font-bold text-purple-500">{stats?.longestStreak || 0} ⭐</p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Completed</p>
          <p className="text-2xl font-bold text-green-500">{stats?.totalCompleted || 0}</p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Total Minutes</p>
          <p className="text-2xl font-bold text-blue-500">{stats?.totalMinutes || 0}</p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <p className="text-sm opacity-70">Missed</p>
          <p className="text-2xl font-bold text-red-500">{stats?.totalMissed || 0}</p>
        </div>
      </div>

      {stats?.byType && Object.keys(stats.byType).length > 0 && (
        <div className={`grid md:grid-cols-4 gap-4 mb-6 ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} p-4 rounded-xl border`}>
          <h3 className={`col-span-full text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Practice by Type</h3>
          {Object.entries(stats.byType).map(([type, data]) => (
            <div key={type} className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{typeIcons[type]}</span>
                <span className="font-medium capitalize">{type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="text-green-500 font-bold">{data.completed}</div>
                  <div className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Done</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-500 font-bold">{data.partial}</div>
                  <div className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Partial</div>
                </div>
                <div className="text-center">
                  <div className="text-red-500 font-bold">{data.missed}</div>
                  <div className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Missed</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handlePrevMonth}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-100'}`}
              >
                ←
              </button>
              <h2 className="text-xl font-bold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-100'}`}
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className={`text-center text-sm font-medium p-2 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const status = getDayStatus(day)
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
                
                let bgClass = ''
                if (status?.completed > 0) bgClass = 'bg-green-500'
                else if (status?.partial > 0) bgClass = 'bg-yellow-500'
                else if (status?.missed > 0) bgClass = 'bg-red-500'

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-110 ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    } ${
                      bgClass 
                        ? `${bgClass} text-white` 
                        : darkMode ? 'bg-dark-border text-dark-muted hover:bg-blue-500/20' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className={darkMode ? 'text-dark-muted' : 'text-gray-600'}>Missed</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              {selectedDate ? `📅 ${selectedDate}` : 'Select a date'}
            </h3>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              + Log
            </button>
          </div>

          {selectedDayLogs ? (
            <div className="space-y-3">
              {selectedDayLogs.logs?.map((log, i) => (
                <div key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-dark-border' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeIcons[log.type]}</span>
                        <span className="font-medium capitalize">{log.type}</span>
                      </div>
                      {log.problemName && (
                        <p className={`text-sm ${darkMode ? 'text-dark-muted' : 'text-gray-600'}`}>{log.problemName}</p>
                      )}
                      {log.details && (
                        <p className={`text-xs ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>{log.details}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.status === 'completed' ? 'bg-green-500 text-white' :
                        log.status === 'partial' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {log.status}
                      </span>
                      {log.duration && (
                        <p className={`text-xs mt-1 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>{log.duration}min</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-center py-8 ${darkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
              Click on a date to see practice logs
            </p>
          )}
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl w-full max-w-md ${darkMode ? 'bg-dark-card' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4">Log Practice - {selectedDate || new Date().toISOString().split('T')[0]}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Type</label>
                <select
                  value={logForm.type}
                  onChange={e => setLogForm({...logForm, type: e.target.value})}
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="coding">💻 Coding</option>
                  <option value="aptitude">📊 Aptitude</option>
                  <option value="interview">🎯 Interview</option>
                  <option value="english">📚 English</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-2">Status</label>
                <select
                  value={logForm.status}
                  onChange={e => setLogForm({...logForm, status: e.target.value})}
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="completed">✅ Completed</option>
                  <option value="partial">⚠️ Partial</option>
                  <option value="missed">❌ Missed</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={logForm.duration}
                    onChange={e => setLogForm({...logForm, duration: parseInt(e.target.value)})}
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setSelectedDate(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
              </div>

              {logForm.type === 'coding' && (
                <>
                  <div>
                    <label className="block text-sm mb-2">Problem Name (optional)</label>
                    <input
                      type="text"
                      value={logForm.problemName}
                      onChange={e => setLogForm({...logForm, problemName: e.target.value})}
                      placeholder="e.g., Two Sum"
                      className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Problem URL (optional)</label>
                    <input
                      type="url"
                      value={logForm.problemUrl}
                      onChange={e => setLogForm({...logForm, problemUrl: e.target.value})}
                      placeholder="https://leetcode.com/..."
                      className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm mb-2">Details</label>
                <textarea
                  value={logForm.details}
                  onChange={e => setLogForm({...logForm, details: e.target.value})}
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-dark-border border-dark-border' : 'bg-gray-50 border-gray-200'}`}
                  rows={2}
                  placeholder="What did you practice?"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogModal(false)}
                className={`flex-1 py-3 rounded-lg ${darkMode ? 'bg-dark-border hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={submitLog}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}