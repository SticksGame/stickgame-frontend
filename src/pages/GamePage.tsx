import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { SticksPyramid } from '../components/game/SticksPyramid'
import type { Stick } from '../components/game/SticksPyramid'
import { InviteModal } from '../components/game/InviteModal'
import { GameOverModal } from '../components/game/GameOverModal'
import { useGameEvents } from '../hooks/useGameEvents'
import './GamePage.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

interface GameData {
  id: string
  state: string
  isOwner: boolean
  myPlayerId: string | null
  currentPlayerId: string | null
  sticks: Stick[]
}

type ModalState = 'none' | 'invite'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [modal, setModal] = useState<ModalState>('none')
  const [gameStarted, setGameStarted] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [myPlayerId, setMyPlayerId] = useState<string | null>(
    (location.state as { playerId?: string } | null)?.playerId ?? null
  )
  const [initialSticks, setInitialSticks] = useState<Stick[] | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const prevState = useRef<string | null>(null)

  const gameEvent = useGameEvents(gameStarted ? gameId : undefined, user)
  const sticks = gameEvent?.sticks ?? initialSticks ?? []
  const isMyTurn = !!myPlayerId && gameEvent?.currentPlayerId === myPlayerId

  const gameOver = gameEvent?.state === 'finished'
  const winner = gameOver && gameEvent?.winnerId
    ? gameEvent.players.find((p) => p.id === gameEvent.winnerId) ?? null
    : null
  const iWon = !!winner && winner.id === myPlayerId

  // Notify owner when guest joins
  useEffect(() => {
    if (!gameEvent || !isOwner) return
    if (prevState.current !== 'playing' && gameEvent.state === 'playing') {
      const guest = gameEvent.players.find((p) => p.role === 'guest')
      if (guest) setNotification(`${guest.displayName} has accepted the invitation`)
    }
    prevState.current = gameEvent.state
  }, [gameEvent, isOwner])

  useEffect(() => {
    if (!gameId || !user) return

    user.getIdToken().then((token) =>
      fetch(`${BACKEND_URL}/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((game: GameData) => {
          setInitialSticks(game.sticks)
          setIsOwner(game.isOwner)
          // Use playerId from navigation state if available, otherwise from API
          if (!myPlayerId && game.myPlayerId) setMyPlayerId(game.myPlayerId)
          if (game.state === 'ready') {
            if (game.isOwner) {
              setModal('invite')
            } else {
              handleJoin()
            }
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
    const res = await fetch(`${BACKEND_URL}/games/${gameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json() as { id: string }
    setMyPlayerId(data.id)
    setModal('none')
    setGameStarted(true)
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

  const turnLabel = !gameStarted
    ? 'Waiting for opponent...'
    : gameEvent == null
      ? 'Connecting...'
      : isMyTurn
        ? 'Your turn'
        : 'Waiting for opponent...'

  return (
    <main className="game-page">
      {notification && (
        <div className="game-page__notification">
          <span>{notification}</span>
          <button
            className="game-page__notification-close"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}
      <p className="game-page__id">Game: {gameId}</p>
      <p className={`game-page__turn ${isMyTurn && gameStarted ? 'game-page__turn--active' : ''}`}>
        {turnLabel}
      </p>
      <SticksPyramid
        sticks={sticks}
        disabled={!isMyTurn || !gameStarted || gameOver}
        onMove={handleMove}
      />
      {modal === 'invite' && gameId && (
        <InviteModal gameId={gameId} onClose={handleInviteClose} />
      )}
      {gameOver && winner && (
        <GameOverModal
          won={iWon}
          winnerName={winner.displayName}
          onClose={() => navigate('/')}
        />
      )}
    </main>
  )
}
