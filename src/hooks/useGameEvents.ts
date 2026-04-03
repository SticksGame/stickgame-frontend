import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import type { Stick } from '../components/game/SticksPyramid'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

export interface GamePlayer {
  id: string
  displayName: string
  role: string
}

export interface GameEvent {
  state: string
  currentPlayerId: string | null
  players: GamePlayer[]
  sticks: Stick[]
}

export function useGameEvents(gameId: string | undefined, user: User | null): GameEvent | null {
  const [event, setEvent] = useState<GameEvent | null>(null)

  useEffect(() => {
    if (!gameId || !user) return

    let es: EventSource | null = null
    let cancelled = false

    user.getIdToken().then((token) => {
      if (cancelled) return

      es = new EventSource(
        `${BACKEND_URL}/games/${gameId}/events?token=${encodeURIComponent(token)}`
      )

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as GameEvent
          setEvent(data)
        } catch {
          console.error('Failed to parse SSE event', e.data)
        }
      }

      es.onerror = () => {
        console.warn('SSE connection error, closing')
        es?.close()
      }
    })

    return () => {
      cancelled = true
      es?.close()
    }
  }, [gameId, user])

  return event
}
