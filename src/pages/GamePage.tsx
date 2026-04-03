import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SticksPyramid } from '../components/game/SticksPyramid'
import { InviteModal } from '../components/game/InviteModal'
import './GamePage.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

interface Game {
  id: string
  state: string
  isOwner: boolean
}

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { user } = useAuth()
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    if (!gameId || !user) return

    user.getIdToken().then((token) =>
      fetch(`${BACKEND_URL}/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((game: Game) => {
          if (game.isOwner && game.state === 'ready') {
            setShowInvite(true)
          }
        })
        .catch(console.error)
    )
  }, [gameId, user])

  return (
    <main className="game-page">
      <p className="game-page__id">Game: {gameId}</p>
      <SticksPyramid />
      {showInvite && gameId && (
        <InviteModal gameId={gameId} onClose={() => setShowInvite(false)} />
      )}
    </main>
  )
}
