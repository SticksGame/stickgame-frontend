import './SticksPyramid.css'

const ROWS = [1, 3, 5, 7]

export function SticksPyramid() {
  return (
    <div className="pyramid">
      {ROWS.map((count, rowIndex) => (
        <div key={rowIndex} className="pyramid__row">
          {Array.from({ length: count }).map((_, stickIndex) => (
            <span key={stickIndex} className="pyramid__stick">|</span>
          ))}
        </div>
      ))}
    </div>
  )
}
