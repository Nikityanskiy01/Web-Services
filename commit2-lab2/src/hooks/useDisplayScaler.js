import { useState, useEffect, useCallback } from "react"

export function useDisplayScaler(originalImageData, imageDims, setStatus) {
  const [currentScale, setCurrentScale] = useState(1.0)
  const [interpolationMethod, setInterpolationMethod] = useState("bilinear")

  const calculateScaleToFit = useCallback(
    (imgWidth, imgHeight, padding = 50) => {
      if (!imgWidth || !imgHeight) return 1.0

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const maxCanvasWidth = viewportWidth - padding * 2
      const maxCanvasHeight = viewportHeight - padding * 2

      if (imgWidth > maxCanvasWidth || imgHeight > maxCanvasHeight) {
        const scaleX = maxCanvasWidth / imgWidth
        const scaleY = maxCanvasHeight / imgHeight
        const initialScale = Math.min(scaleX, scaleY)

        return initialScale
      } else {
        return 1.0
      }
    },
    []
  )

  useEffect(() => {
    if (imageDims.width && imageDims.height) {
      const initialScale = calculateScaleToFit(
        imageDims.width,
        imageDims.height
      )
      setCurrentScale(initialScale)
      if (setStatus) {
        setStatus(
          `Изображение загружено/изменено. Масштаб отображения: ${Math.round(
            initialScale * 100
          )}%.`
        )
      }
    } else {
      setCurrentScale(1.0)
    }
  }, [imageDims.width, imageDims.height, calculateScaleToFit, setStatus])

  const handleScaleChange = useCallback(
    (newScale) => {
      if (newScale > 0) {
        setCurrentScale(newScale)
        if (setStatus) {
          setStatus(
            `Масштаб отображения изменен на ${Math.round(newScale * 100)}%.`
          )
        }
      } else {
        if (setStatus) {
          setStatus("Неверное значение масштаба.")
        }
      }
    },
    [setStatus]
  )

  const handleInterpolationMethodChange = useCallback(
    (method) => {
      setInterpolationMethod(method)
      if (setStatus) {
        setStatus(`Метод отображения изменен на "${method}".`)
      }
    },
    [setStatus]
  )

  return {
    currentScale,
    setCurrentScale,
    handleScaleChange,
    interpolationMethod,
    setInterpolationMethod,
    handleInterpolationMethodChange,
  }
}
