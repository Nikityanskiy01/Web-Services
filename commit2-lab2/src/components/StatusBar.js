function StatusBar({ statusText, width, height, depth }) {
  return (
    <div className="status-bar">
      {statusText}
      {width != null &&
        height != null &&
        depth != null &&
        ` | Ширина: ${width}px, Высота: ${height}px, Глубина цвета: ${depth}`}
    </div>
  )
}
export default StatusBar
