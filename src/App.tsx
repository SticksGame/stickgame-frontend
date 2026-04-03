import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from './config/firebase'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const { user } = useAuth()

  function handleNewGame() {
    if (!user) {
      if (!auth) return
      signInWithPopup(auth, googleProvider)
      return
    }
    // TODO: navigate to new game
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
