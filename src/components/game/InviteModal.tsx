import { useState } from 'react'
import './InviteModal.css'

interface InviteModalProps {
  gameId: string
  onClose: () => void
}

export function InviteModal({ gameId, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  const inviteLink = `${window.location.origin}/game/${gameId}`

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Invite a player</h2>
        <p className="modal__description">
          Share this link with someone to invite them to your game.
        </p>

        <div className="modal__link-row">
          <span className="modal__link">{inviteLink}</span>
          <button className="modal__copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        <button className="modal__close-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
