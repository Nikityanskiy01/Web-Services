import { useState } from "react"
import InputFile from "./components/InputFile"
import RendCanvas from "./components/RendCanvas"
import StatusBar from "./components/StatusBar"

import ControlScale from "./components/ControlScale"
import ModalResize from "./components/ModalResize"
import { nearestNeighbor, bilinearInterpolation } from "./utils/interpolation"

import { useImageLoader } from "./hooks/useImageLoader"
import { useDisplayScaler } from "./hooks/useDisplayScaler"

import "./index.css"

function App() {
  const {
    originalImageData,
    imageInfo,
    status,
    handleFileSelect,
    setOriginalImageData,
    setImageInfo,
    setStatus,
  } = useImageLoader()

  const {
    currentScale,
    setCurrentScale,
    interpolationMethod: displayInterpolationMethod,
    handleInterpolationMethodChange: handleDisplayInterpolationMethodChange,
  } = useDisplayScaler(originalImageData, imageInfo, setStatus)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModalResize = () => {
    if (originalImageData) {
      setIsModalOpen(true)
      setStatus("Модальное окно изменения размера открыто.")
    } else {
      setStatus("Нет изображения для изменения размера.")
    }
  }

  const handleCloseModalResize = () => {
    setIsModalOpen(false)
    setStatus("Изменение размера отменено.")
  }

  const handleConfirmResize = ({
    newWidth,
    newHeight,
    interpolationMethod: modalInterpolationMethod,
  }) => {
    console.log("App.js: handleConfirmResize called with:", {
      newWidth,
      newHeight,
      modalInterpolationMethod,
    })

    if (!originalImageData) {
      setStatus("Ошибка: Нет исходного изображения для изменения размера.")
      setIsModalOpen(false)
      return
    }

    if (newWidth <= 0 || newHeight <= 0) {
      setStatus("Ошибка: Недопустимые размеры для изменения.")
      setIsModalOpen(false)
      return
    }

    setStatus(`Изменение размера изображения...`)
    setIsModalOpen(false)

    try {
      let resizedImageData

      if (
        originalImageData.width === newWidth &&
        originalImageData.height === newHeight
      ) {
        resizedImageData = originalImageData
      } else {
        if (modalInterpolationMethod === "nearest-neighbor") {
          resizedImageData = nearestNeighbor(
            originalImageData,
            newWidth,
            newHeight
          )
        } else {
          resizedImageData = bilinearInterpolation(
            originalImageData,
            newWidth,
            newHeight
          )
        }
      }
      setOriginalImageData(resizedImageData)

      setImageInfo({
        width: newWidth,
        height: newHeight,
        depth: imageInfo.depth,
      })

      setCurrentScale(1.0)

      setStatus(`Размер успешно изменен до ${newWidth}x${newHeight}px.`)
    } catch (error) {
      setStatus(`Ошибка при изменении размера: ${error.message}`)
    }
  }

  return (
    <div className="App">
      <h1>Загрузка и отображение изображения</h1>
      <InputFile
        onFileSelect={handleFileSelect}
        accept=".png, .jpg, .jpeg, .gb7"
      />
      {originalImageData && (
        <div className="controls-panel">
          <ControlScale
            currentScale={currentScale}
            onScaleChange={setCurrentScale}
          />
          <button onClick={handleOpenModalResize} className="resize-button">
            Изменить размер изображения
          </button>
          <label
            htmlFor="display-interpolation"
            className="display-interpolation-label"
          >
            Метод отображения:
          </label>
          <select
            id="display-interpolation"
            value={displayInterpolationMethod}
            onChange={(e) =>
              handleDisplayInterpolationMethodChange(e.target.value)
            }
            className="display-interpolation-select"
          >
            <option value="bilinear">Билинейная</option>
            <option value="nearest-neighbor">Ближайшего соседа</option>
          </select>
        </div>
      )}
      <RendCanvas
        originalImageData={originalImageData}
        scale={currentScale}
        interpolationMethod={displayInterpolationMethod}
      />

      <StatusBar
        statusText={status}
        width={imageInfo.width}
        height={imageInfo.height}
        depth={imageInfo.depth}
      />
      <ModalResize
        isOpen={isModalOpen}
        onClose={handleCloseModalResize}
        onConfirm={handleConfirmResize}
        originalWidth={imageInfo.width}
        originalHeight={imageInfo.height}
      />
    </div>
  )
}

export default App
