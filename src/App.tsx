import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { validatePin } from './hooks/useAdminPin'
import Home from './pages/Home'
import Admin from './pages/Admin'

function AdminGuard() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setError(false)
    const valid = await validatePin(pin)
    setChecking(false)
    if (valid) {
      setUnlocked(true)
    } else {
      setError(true)
      setPin('')
    }
  }

  if (unlocked) return <Admin />

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Panel de Administración</h2>
        <p className="text-xs text-gray-400 text-center mb-6">Introduce el PIN para continuar</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false) }}
            placeholder="PIN"
            autoFocus
            className={`w-full border rounded-lg px-4 py-2 text-center text-lg tracking-widest outline-none transition
              ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-gray-500'}`}
          />
          {error && <p className="text-xs text-red-500 text-center">PIN incorrecto</p>}
          <button
            type="submit"
            disabled={!pin || checking}
            className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-40"
          >
            {checking ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
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
