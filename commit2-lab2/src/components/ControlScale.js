function ControlScale({ currentScale, onScaleChange }) {
  const scaleInPercent = Math.round(currentScale * 100)

  const predefinedScales = [
    0.12, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0,
  ]

  const handleSelectChange = (event) => {
    onScaleChange(parseFloat(event.target.value))
  }

  return (
    <div className="scale-controls">
      <label htmlFor="scale-select">Масштаб:</label>
      <select
        id="scale-select"
        value={currentScale}
        onChange={handleSelectChange}
      >
        {predefinedScales.map((scale) => (
          <option key={scale} value={scale}>
            {Math.round(scale * 100)}%
          </option>
        ))}
        {!predefinedScales.includes(currentScale) && currentScale > 0 && (
          <option key={currentScale} value={currentScale}>
            {scaleInPercent}% (текущий)
          </option>
        )}
      </select>
    </div>
  )
}
export default ControlScale
