import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Roadmap from './pages/Roadmap'
import Practice from './pages/Practice'
import Notes from './pages/Notes'
import Questions from './pages/Questions'
import LearningPath from './pages/LearningPath'
import Interview from './pages/Interview'
import English from './pages/English'
import Calendar from './pages/Calendar'
import JobQuestions from './pages/JobQuestions'
import MockTest from './pages/MockTest'
import Doubt from './pages/Doubt'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="learning" element={<LearningPath />} />
        <Route path="practice" element={<Practice />} />
        <Route path="notes" element={<Notes />} />
        <Route path="questions" element={<Questions />} />
        <Route path="job-questions" element={<JobQuestions />} />
        <Route path="mock-test" element={<MockTest />} />
        <Route path="interview" element={<Interview />} />
        <Route path="english" element={<English />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="doubts" element={<Doubt />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
    </>
  )
}

export default App