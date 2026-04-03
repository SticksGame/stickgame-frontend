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

interface DragLine {
  startX: number
  startY: number
  endX: number
  endY: number
}

interface SticksPyramidProps {
  sticks: Stick[]
  disabled?: boolean
  onMove: (selected: { row: number; index: number }[]) => void
}

export function SticksPyramid({ sticks, disabled = false, onMove }: SticksPyramidProps) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragLine, setDragLine] = useState<DragLine | null>(null)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function getStick(row: number, index: number) {
    return sticks.find((s) => s.row === row && s.index === index)
  }

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

  function toContainerCoords(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function handlePointerDown(e: React.PointerEvent, row: number, index: number) {
    if (disabled) return
    const stick = getStick(row, index)
    if (stick?.crossed) return
    e.preventDefault()
    e.currentTarget.releasePointerCapture(e.pointerId)
    isDragging.current = true
    setDrag({ row, anchor: index, current: index })
    const { x, y } = toContainerCoords(e.clientX, e.clientY)
    setDragLine({ startX: x, startY: y, endX: x, endY: y })
  }

  function handleContainerPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || !drag) return

    // Update the visual line endpoint to follow the pointer
    const { x, y } = toContainerCoords(e.clientX, e.clientY)
    setDragLine((prev) => (prev ? { ...prev, endX: x, endY: y } : null))

    // Hit-test: find which stick element is directly under the pointer
    const elements = document.elementsFromPoint(e.clientX, e.clientY)
    const stickEl = elements.find(
      (el) =>
        el.hasAttribute('data-stick-row') &&
        !el.classList.contains('pyramid__stick--crossed')
    )
    if (stickEl) {
      const elRow = parseInt(stickEl.getAttribute('data-stick-row') ?? '-1')
      const elIndex = parseInt(stickEl.getAttribute('data-stick-index') ?? '-1')
      if (elRow === drag.row && elIndex >= 0) {
        setDrag((prev) => (prev ? { ...prev, current: elIndex } : null))
      }
    }
  }

  function handleContainerPointerUp() {
    if (!isDragging.current) return
    isDragging.current = false
    setDragLine(null) // triggers re-render → hasSelection becomes visible
  }

  useEffect(() => {
    window.addEventListener('pointerup', handleContainerPointerUp)
    return () => window.removeEventListener('pointerup', handleContainerPointerUp)
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
    setDragLine(null)
  }

  // Show confirm/cancel only after releasing the pointer
  const hasSelection =
    drag !== null && !isDragging.current && computeSelectedIndices(drag).length > 0

  return (
    <div
      className="pyramid"
      ref={containerRef}
      onPointerMove={handleContainerPointerMove}
    >
      {ROWS.map((count, rowIndex) => (
        <div key={rowIndex} className="pyramid__row">
          {Array.from({ length: count }).map((_, stickIndex) => {
            const stick = getStick(rowIndex, stickIndex)
            const crossed = stick?.crossed ?? false
            const selected = isSelected(rowIndex, stickIndex)
            return (
              <span
                key={stickIndex}
                data-stick-row={rowIndex}
                data-stick-index={stickIndex}
                className={[
                  'pyramid__stick',
                  crossed ? 'pyramid__stick--crossed' : '',
                  selected ? 'pyramid__stick--selected' : '',
                  disabled && !crossed ? 'pyramid__stick--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onPointerDown={(e) => handlePointerDown(e, rowIndex, stickIndex)}
              >
                |
              </span>
            )
          })}
        </div>
      ))}

      {/* Live line drawn by the pointer */}
      {dragLine && (
        <svg className="pyramid__line-overlay">
          <line
            x1={dragLine.startX}
            y1={dragLine.startY}
            x2={dragLine.endX}
            y2={dragLine.endY}
            stroke="#ff6b35"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      )}

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
