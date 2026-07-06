import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Login from './pages/Login'
import Upload from './pages/Upload'
import ExamResult from './pages/ExamResult'
import WrongQuestions from './pages/WrongQuestions'
import RedoQuestion from './pages/RedoQuestion'
import KnowledgeBase from './pages/KnowledgeBase'
import KnowledgeDetail from './pages/KnowledgeDetail'
import Search from './pages/Search'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 page-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute>
                <ExamResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wrong-questions"
            element={
              <ProtectedRoute>
                <WrongQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/redo/:id"
            element={
              <ProtectedRoute>
                <RedoQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge"
            element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge/:id"
            element={
              <ProtectedRoute>
                <KnowledgeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {isLoggedIn && <BottomNav />}
    </div>
  )
}

export default App
