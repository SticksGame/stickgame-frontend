import { useParams } from 'react-router-dom'
import { SticksPyramid } from '../components/game/SticksPyramid'
import './GamePage.css'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <main className="game-page">
      <p className="game-page__id">Game: {gameId}</p>
      <SticksPyramid />
    </main>
  )
}
