import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { useSharePointUser } from './hooks/useSharePointUser'
import Home from './pages/Home'
import Admin from './pages/Admin'

function AdminGuard() {
  const { isAdmin, loading } = useSharePointUser()

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400">Cargando...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Admin />
}

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminGuard />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}
