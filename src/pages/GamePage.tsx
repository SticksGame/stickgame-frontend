import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SticksPyramid } from '../components/game/SticksPyramid'
import { InviteModal } from '../components/game/InviteModal'
import { JoinModal } from '../components/game/JoinModal'
import './GamePage.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

interface Game {
  id: string
  state: string
  isOwner: boolean
}

type ModalState = 'none' | 'invite' | 'join'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modal, setModal] = useState<ModalState>('none')

  useEffect(() => {
    if (!gameId || !user) return

    user.getIdToken().then((token) =>
      fetch(`${BACKEND_URL}/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((game: Game) => {
          if (game.state === 'ready') {
            setModal(game.isOwner ? 'invite' : 'join')
          }
        })
        .catch(console.error)
    )
  }, [gameId, user])

  async function handleJoin() {
    if (!gameId || !user) return
    const token = await user.getIdToken()
    await fetch(`${BACKEND_URL}/games/${gameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    setModal('none')
  }

  function handleDecline() {
    navigate('/')
  }

  return (
    <main className="game-page">
      <p className="game-page__id">Game: {gameId}</p>
      <SticksPyramid />
      {modal === 'invite' && gameId && (
        <InviteModal gameId={gameId} onClose={() => setModal('none')} />
      )}
      {modal === 'join' && (
        <JoinModal onJoin={handleJoin} onDecline={handleDecline} />
      )}
    </main>
  )
}
