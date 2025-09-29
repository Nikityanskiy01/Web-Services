import { useRef, useEffect } from "react"

function RendCanvas({ originalImageData }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    if (!originalImageData) {
      canvas.width = 0
      canvas.height = 0
      ctx.clearRect(0, 0, 0, 0)
      return
    }

    const { width, height } = originalImageData

    canvas.width = width
    canvas.height = height

    ctx.putImageData(originalImageData, 0, 0)
  }, [originalImageData])

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export default RendCanvas
