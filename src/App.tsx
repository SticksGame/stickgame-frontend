import { signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from './config/firebase'
import { useAuth } from './context/AuthContext'
import './App.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

async function createGame(idToken: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/games`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) throw new Error('Failed to create game')

  const data = await res.json() as { id: string }
  return data.id
}

function App() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleNewGame() {
    if (!auth) return

    try {
      const currentUser = user ?? (await signInWithPopup(auth, googleProvider)).user
      const idToken = await currentUser.getIdToken()
      const gameId = await createGame(idToken)
      navigate(`/game/${gameId}`)
    } catch (err) {
      console.error('Error starting game:', err)
    }
  }

  return (
    <main className="home">
      <h1 className="home__title">SticksGame</h1>
      <div className="home__actions">
        <button className="home__btn home__btn--primary" onClick={handleNewGame}>
          New Game
        </button>
        <button className="home__btn home__btn--secondary">Join a Game</button>
      </div>
    </main>
  )
}

export default App
