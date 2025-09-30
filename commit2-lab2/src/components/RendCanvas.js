import { useRef, useEffect } from "react"

function RendCanvas({ originalImageData, scale = 1.0 }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!originalImageData) {
      canvas.width = 0
      canvas.height = 0
      ctx.clearRect(0, 0, 0, 0)
      return
    }

    const { width, height } = originalImageData

    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")

    tempCanvas.width = width
    tempCanvas.height = height
    tempCtx.putImageData(originalImageData, 0, 0)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height
    )

    setTimeout(() => {
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2
      container.scrollTop =
        (container.scrollHeight - container.clientHeight) / 2
    }, 0)
  }, [originalImageData, scale])

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export default RendCanvas
