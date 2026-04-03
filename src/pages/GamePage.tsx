import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SticksPyramid } from '../components/game/SticksPyramid'
import { InviteModal } from '../components/game/InviteModal'
import { JoinModal } from '../components/game/JoinModal'
import { useGameEvents } from '../hooks/useGameEvents'
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
  const [gameStarted, setGameStarted] = useState(false)

  const gameEvent = useGameEvents(gameStarted ? gameId : undefined, user)

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
          } else if (game.state === 'playing') {
            setGameStarted(true)
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
    setGameStarted(true)
  }

  function handleDecline() {
    navigate('/')
  }

  function handleInviteClose() {
    setModal('none')
    setGameStarted(true)
  }

  const isMyTurn = gameEvent?.isMyTurn ?? false
  const turnLabel = !gameStarted
    ? 'Waiting for opponent...'
    : gameEvent == null
      ? 'Connecting...'
      : isMyTurn
        ? 'Your turn'
        : 'Waiting for opponent...'

  return (
    <main className="game-page">
      <p className="game-page__id">Game: {gameId}</p>
      <p className={`game-page__turn ${isMyTurn && gameStarted ? 'game-page__turn--active' : ''}`}>
        {turnLabel}
      </p>
      <SticksPyramid disabled={!isMyTurn || !gameStarted} />
      {modal === 'invite' && gameId && (
        <InviteModal gameId={gameId} onClose={handleInviteClose} />
      )}
      {modal === 'join' && (
        <JoinModal onJoin={handleJoin} onDecline={handleDecline} />
      )}
    </main>
  )
}
