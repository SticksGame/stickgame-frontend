import { useState, useEffect, useRef } from 'react'
import './SticksPyramid.css'

const ROWS = [1, 3, 5, 7]

export interface Stick {
  row: number
  index: number
  crossed: boolean
}

interface DragState {
  row: number
  anchor: number
  current: number
}

interface SticksPyramidProps {
  sticks: Stick[]
  disabled?: boolean
  onMove: (selected: { row: number; index: number }[]) => void
}

export function SticksPyramid({ sticks, disabled = false, onMove }: SticksPyramidProps) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const isDragging = useRef(false)

  function getStick(row: number, index: number) {
    return sticks.find((s) => s.row === row && s.index === index)
  }

  // Compute the valid contiguous selection from anchor toward current,
  // stopping before any crossed stick.
  function computeSelectedIndices(d: DragState): number[] {
    const dir = d.current >= d.anchor ? 1 : -1
    const result: number[] = []
    for (let i = d.anchor; i !== d.current + dir; i += dir) {
      const stick = getStick(d.row, i)
      if (!stick || stick.crossed) break
      result.push(i)
    }
    return result
  }

  function isSelected(row: number, index: number): boolean {
    if (!drag || drag.row !== row) return false
    return computeSelectedIndices(drag).includes(index)
  }

  function handlePointerDown(e: React.PointerEvent, row: number, index: number) {
    if (disabled) return
    const stick = getStick(row, index)
    if (stick?.crossed) return
    e.preventDefault()
    // Release pointer capture so pointerenter fires on other sticks during drag
    e.currentTarget.releasePointerCapture(e.pointerId)
    isDragging.current = true
    setDrag({ row, anchor: index, current: index })
  }

  function handlePointerEnter(row: number, index: number) {
    if (!isDragging.current || !drag) return
    if (drag.row !== row) return
    setDrag((prev) => (prev ? { ...prev, current: index } : null))
  }

  useEffect(() => {
    const handlePointerUp = () => {
      isDragging.current = false
    }
    window.addEventListener('pointerup', handlePointerUp)
    return () => window.removeEventListener('pointerup', handlePointerUp)
  }, [])

  function handleConfirm() {
    if (!drag) return
    const indices = computeSelectedIndices(drag)
    if (indices.length === 0) return
    onMove(indices.map((index) => ({ row: drag.row, index })))
    setDrag(null)
  }

  function handleCancel() {
    isDragging.current = false
    setDrag(null)
  }

  const hasSelection = drag !== null && computeSelectedIndices(drag).length > 0

  return (
    <div className="pyramid">
      {ROWS.map((count, rowIndex) => (
        <div key={rowIndex} className="pyramid__row">
          {Array.from({ length: count }).map((_, stickIndex) => {
            const stick = getStick(rowIndex, stickIndex)
            const crossed = stick?.crossed ?? false
            const selected = isSelected(rowIndex, stickIndex)
            return (
              <span
                key={stickIndex}
                className={[
                  'pyramid__stick',
                  crossed ? 'pyramid__stick--crossed' : '',
                  selected ? 'pyramid__stick--selected' : '',
                  disabled && !crossed ? 'pyramid__stick--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onPointerDown={(e) => handlePointerDown(e, rowIndex, stickIndex)}
                onPointerEnter={() => handlePointerEnter(rowIndex, stickIndex)}
              >
                |
              </span>
            )
          })}
        </div>
      ))}
      {hasSelection && (
        <div className="pyramid__actions">
          <button className="pyramid__btn pyramid__btn--confirm" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="pyramid__btn pyramid__btn--cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
