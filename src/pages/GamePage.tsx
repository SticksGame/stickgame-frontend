import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { SticksPyramid } from '../components/game/SticksPyramid'
import { InviteModal } from '../components/game/InviteModal'
import './GamePage.css'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const location = useLocation()
  const [showInvite, setShowInvite] = useState(
    (location.state as { showInvite?: boolean } | null)?.showInvite ?? false
  )

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
