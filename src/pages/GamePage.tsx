import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { SticksPyramid } from '../components/game/SticksPyramid'
import type { Stick } from '../components/game/SticksPyramid'
import { InviteModal } from '../components/game/InviteModal'
import { JoinModal } from '../components/game/JoinModal'
import { useGameEvents } from '../hooks/useGameEvents'
import './GamePage.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

interface GameData {
  id: string
  state: string
  isOwner: boolean
  sticks: Stick[]
}

type ModalState = 'none' | 'invite' | 'join'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [modal, setModal] = useState<ModalState>('none')
  const [gameStarted, setGameStarted] = useState(false)
  const [initialSticks, setInitialSticks] = useState<Stick[] | null>(null)

  const gameEvent = useGameEvents(gameStarted ? gameId : undefined, user)
  const sticks = gameEvent?.sticks ?? initialSticks ?? []

  useEffect(() => {
    if (!gameId || !user) return

    user.getIdToken().then((token) =>
      fetch(`${BACKEND_URL}/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((game: GameData) => {
          setInitialSticks(game.sticks)
          if (game.state === 'ready') {
            setModal(game.isOwner ? 'invite' : 'join')
          } else if (game.state === 'playing') {
            setGameStarted(true)
          }
        })
        .catch(console.error)
    )
  }, [gameId, user])

  async function handleSignIn() {
    if (!auth) return
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Sign-in error:', err)
    }
  }

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

  async function handleMove(selected: { row: number; index: number }[]) {
    if (!gameId || !user) return
    const token = await user.getIdToken()
    await fetch(`${BACKEND_URL}/games/${gameId}/sticks`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sticks: selected }),
    })
  }

  if (loading) {
    return (
      <main className="game-page">
        <p className="game-page__status">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="game-page">
        <h2 className="game-page__status">You've been invited to a game!</h2>
        <p className="game-page__hint">Sign in to join</p>
        <button className="game-page__signin-btn" onClick={handleSignIn}>
          Sign in with Google
        </button>
      </main>
    )
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
      <SticksPyramid
        sticks={sticks}
        disabled={!isMyTurn || !gameStarted}
        onMove={handleMove}
      />
      {modal === 'invite' && gameId && (
        <InviteModal gameId={gameId} onClose={handleInviteClose} />
      )}
      {modal === 'join' && (
        <JoinModal onJoin={handleJoin} onDecline={handleDecline} />
      )}
    </main>
  )
}
