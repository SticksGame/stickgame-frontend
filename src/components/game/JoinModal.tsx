import './JoinModal.css'

interface JoinModalProps {
  onJoin: () => void
  onDecline: () => void
}

export function JoinModal({ onJoin, onDecline }: JoinModalProps) {
  return (
    <div className="join-modal__overlay">
      <div className="join-modal">
        <h2 className="join-modal__title">You've been invited!</h2>
        <p className="join-modal__message">Do you want to join this game?</p>
        <div className="join-modal__actions">
          <button className="join-modal__btn join-modal__btn--primary" onClick={onJoin}>
            Join Game
          </button>
          <button className="join-modal__btn join-modal__btn--secondary" onClick={onDecline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
