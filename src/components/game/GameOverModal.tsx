import './GameOverModal.css'

interface GameOverModalProps {
  won: boolean
  winnerName: string
  onClose: () => void
}

export function GameOverModal({ won, winnerName, onClose }: GameOverModalProps) {
  return (
    <div className="gameover-modal__overlay">
      <div className="gameover-modal">
        <div className="gameover-modal__emoji">{won ? '🎉' : '😔'}</div>
        <h2 className="gameover-modal__title">{won ? 'You won!' : 'You lost!'}</h2>
        <p className="gameover-modal__message">
          {won
            ? `${winnerName} wins the game!`
            : `${winnerName} wins the game!`}
        </p>
        <button className="gameover-modal__btn" onClick={onClose}>
          Back to Home
        </button>
      </div>
    </div>
  )
}
