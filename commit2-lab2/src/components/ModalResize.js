import React, { useRef, useEffect, useState, useMemo } from "react"

const validateInput = (value) => {
  const num = parseInt(value, 10)
  return !isNaN(num) && num > 0 && Number.isInteger(num)
}

function ModalResize({
  isOpen,
  onClose,
  onConfirm,
  originalWidth,
  originalHeight,
}) {
  const dialogRef = useRef(null)

  const [resizeType, setResizeType] = useState("percent")
  const [inputWidth, setInputWidth] = useState("")
  const [inputHeight, setInputHeight] = useState("")
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [interpolationMethod, setInterpolationMethod] = useState("bilinear")

  const [editingField, setEditingField] = useState(null)

  const [widthError, setWidthError] = useState(false)
  const [heightError, setHeightError] = useState(false)
  const [modalError, setModalError] = useState("")

  const originalAspectRatio = useMemo(() => {
    if (originalWidth && originalHeight && originalHeight > 0) {
      return originalWidth / originalHeight
    }
    return 1
  }, [originalWidth, originalHeight])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog) {
      if (isOpen) {
        dialog.showModal()
        if (originalWidth && originalHeight) {
          setInputWidth("100")
          setInputHeight("100")
          setResizeType("percent")
          setMaintainAspectRatio(true)
          setInterpolationMethod("bilinear")
          setWidthError(false)
          setHeightError(false)
          setModalError("")
          setEditingField(null)
        } else {
          setInputWidth("")
          setInputHeight("")
          setResizeType("percent")
          setMaintainAspectRatio(true)
          setInterpolationMethod("bilinear")
          setWidthError(false)
          setHeightError(false)
          setModalError("")
          setEditingField(null)
        }
      } else {
        dialog.close()
        setInputWidth("")
        setInputHeight("")
        setWidthError(false)
        setHeightError(false)
        setModalError("")
        setEditingField(null)
      }
    }
  }, [isOpen, originalWidth, originalHeight])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && onClose) {
      const handleCancel = (event) => {
        event.preventDefault()
        onClose()
      }
      dialog.addEventListener("cancel", handleCancel)
      return () => {
        dialog.removeEventListener("cancel", handleCancel)
      }
    }
  }, [onClose])

  const calculatedNewDims = useMemo(() => {
    let w = null
    let h = null

    if (!originalWidth || !originalHeight) {
      return { width: null, height: null, isValid: false }
    }

    const isWInputValid = validateInput(inputWidth)
    const isHInputValid = validateInput(inputHeight)

    if (resizeType === "percent") {
      const inputWPercent = isWInputValid ? parseFloat(inputWidth) : null
      const inputHPercent = isHInputValid ? parseFloat(inputHeight) : null

      if (maintainAspectRatio) {
        if (editingField === "width" && inputWPercent !== null) {
          w = Math.round(originalWidth * (inputWPercent / 100))
          h = Math.round(w / originalAspectRatio)
        } else if (editingField === "height" && inputHPercent !== null) {
          h = Math.round(originalHeight * (inputHPercent / 100))
          w = Math.round(h * originalAspectRatio)
        } else if (inputWPercent !== null) {
          w = Math.round(originalWidth * (inputWPercent / 100))
          h = Math.round(w / originalAspectRatio)
        } else if (inputHPercent !== null) {
          h = Math.round(originalHeight * (inputHPercent / 100))
          w = Math.round(h * originalAspectRatio)
        }
      } else {
        if (inputWPercent !== null && inputHPercent !== null) {
          w = Math.round(originalWidth * (inputWPercent / 100))
          h = Math.round(originalHeight * (inputHPercent / 100))
        }
      }
    } else {
      const inputWValue = isWInputValid ? parseInt(inputWidth, 10) : null
      const inputHValue = isHInputValid ? parseInt(inputHeight, 10) : null

      if (maintainAspectRatio) {
        if (editingField === "width" && inputWValue !== null) {
          w = inputWValue
          h = Math.round(w / originalAspectRatio)
        } else if (editingField === "height" && inputHValue !== null) {
          h = inputHValue
          w = Math.round(h * originalAspectRatio)
        } else if (inputWValue !== null) {
          w = inputWValue
          h = Math.round(w / originalAspectRatio)
        } else if (inputHValue !== null) {
          h = inputHValue
          w = Math.round(h * originalAspectRatio)
        }
      } else {
        if (inputWValue !== null && inputHValue !== null) {
          w = inputWValue
          h = inputHValue
        }
      }
    }

    const isValid =
      w !== null &&
      h !== null &&
      w > 0 &&
      h > 0 &&
      Number.isInteger(w) &&
      Number.isInteger(h)

    return { width: w, height: h, isValid: isValid }
  }, [
    inputWidth,
    inputHeight,
    resizeType,
    maintainAspectRatio,
    originalWidth,
    originalHeight,
    editingField,
    originalAspectRatio,
  ])

  useEffect(() => {
    if (maintainAspectRatio && calculatedNewDims.isValid) {
      if (editingField !== "width") {
        if (resizeType === "percent") {
          const percentW = (calculatedNewDims.width / originalWidth) * 100
          if (inputWidth !== Math.round(percentW).toString()) {
            setInputWidth(Math.round(percentW).toString())
          }
        } else {
          if (inputWidth !== calculatedNewDims.width.toString()) {
            setInputWidth(calculatedNewDims.width.toString())
          }
        }
      }

      if (editingField !== "height") {
        if (resizeType === "percent") {
          const percentH = (calculatedNewDims.height / originalHeight) * 100
          if (inputHeight !== Math.round(percentH).toString()) {
            setInputHeight(Math.round(percentH).toString())
          }
        } else {
          if (inputHeight !== calculatedNewDims.height.toString()) {
            setInputHeight(calculatedNewDims.height.toString())
          }
        }
      }
    }
  }, [
    calculatedNewDims.isValid,
    calculatedNewDims.width,
    calculatedNewDims.height,
    resizeType,
    maintainAspectRatio,
    originalWidth,
    originalHeight,
    editingField,
    inputWidth,
    inputHeight,
  ])

  useEffect(() => {
    const isWInputValid = validateInput(inputWidth)
    const isHInputValid = validateInput(inputHeight)

    setWidthError(inputWidth !== "" && !isWInputValid)
    setHeightError(inputHeight !== "" && !isHInputValid)
  }, [inputWidth, inputHeight])

  const handleTypeChange = (event) => {
    const newValue = event.target.value
    setResizeType(newValue)

    setInputWidth("")
    setInputHeight("")
    setWidthError(false)
    setHeightError(false)
    setModalError("")
    setEditingField(null)
  }

  const handleWidthChange = (event) => {
    const value = event.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setInputWidth(value)
    }
  }

  const handleHeightChange = (event) => {
    const value = event.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setInputHeight(value)
    }
  }

  const handleAspectRatioChange = (event) => {
    const checked = event.target.checked
    setMaintainAspectRatio(checked)

    if (checked && originalWidth && originalHeight) {
      const currentInputWValue = parseInt(inputWidth, 10)
      const currentInputHValue = parseInt(inputHeight, 10)
      const originalAspectRatio = originalWidth / originalHeight

      if (
        validateInput(currentInputWValue) ||
        (!validateInput(currentInputWValue) &&
          !validateInput(currentInputHValue))
      ) {
        let newH
        if (resizeType === "percent") {
          const percentW = parseFloat(inputWidth)
          const calculatedW = Math.round(originalWidth * (percentW / 100))
          newH = Math.round(calculatedW / originalAspectRatio)
          newH = (newH / originalHeight) * 100
          setInputHeight(Math.round(newH).toString())
        } else {
          newH = Math.round(currentInputWValue / originalAspectRatio)
          setInputHeight(newH.toString())
        }
        setEditingField(null)
      } else if (validateInput(currentInputHValue)) {
        let newW
        if (resizeType === "percent") {
          const percentH = parseFloat(inputHeight)
          const calculatedH = Math.round(originalHeight * (percentH / 100))
          newW = Math.round(calculatedH * originalAspectRatio)
          newW = (newW / originalWidth) * 100
          setInputWidth(Math.round(newW).toString())
        } else {
          newW = Math.round(currentInputHValue * originalAspectRatio)
          setInputWidth(newW.toString())
        }
        setEditingField(null)
      } else {
        setEditingField(null)
      }
    }
  }

  const handleInterpolationChange = (event) => {
    setInterpolationMethod(event.target.value)
  }

  const handleConfirm = () => {
    if (!calculatedNewDims.isValid) {
      setModalError("Введены некорректные размеры. Невозможно подтвердить.")
      return
    }

    setModalError("")

    if (onConfirm) {
      onConfirm({
        newWidth: calculatedNewDims.width,
        newHeight: calculatedNewDims.height,
        interpolationMethod: interpolationMethod,
      })
    } else {
      setModalError("Внутренняя ошибка: onConfirm не определен.")
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const isWidthDisabled = maintainAspectRatio && editingField === "height"
  const isHeightDisabled = maintainAspectRatio && editingField === "width"

  const originalPixelCount =
    originalWidth && originalHeight
      ? ((originalWidth * originalHeight) / 1000000).toFixed(2)
      : "N/A"
  const newPixelCountDisplay = calculatedNewDims.isValid
    ? ((calculatedNewDims.width * calculatedNewDims.height) / 1000000).toFixed(
        2
      )
    : "N/A"

  const unitDisplay = resizeType === "percent" ? "%" : "px"

  return (
    <dialog ref={dialogRef} className="resize-modal-dialog">
      <h2>Изменить размер изображения</h2>
      {originalWidth != null && originalHeight != null && (
        <p>
          Исходный размер: {originalWidth} x {originalHeight} px (
          {originalPixelCount} Мп)
        </p>
      )}
      <p>
        Новый размер:
        {calculatedNewDims.width != null ? calculatedNewDims.width : "?"} x{" "}
        {calculatedNewDims.height != null ? calculatedNewDims.height : "?"} px (
        {newPixelCountDisplay} Мп)
      </p>
      {modalError && <p className="error-message">{modalError}</p>}
      <div className="modal-controls">
        {" "}
        <div className="control-group">
          <label htmlFor="resize-type">Изменить размер в:</label>
          <select
            id="resize-type"
            value={resizeType}
            onChange={handleTypeChange}
          >
            <option value="percent">Процентах</option>
            <option value="pixels">Пикселях</option>
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="new-width">Ширина:</label>
          <input
            type="number"
            id="new-width"
            value={inputWidth}
            onChange={handleWidthChange}
            onFocus={() => setEditingField("width")}
            onBlur={() => setEditingField(null)}
            className={`${widthError ? "input-error" : ""} ${
              isWidthDisabled ? "disabled-input" : ""
            }`}
            min="1"
            disabled={isWidthDisabled}
          />
          <span>{unitDisplay}</span>
          {widthError && <span className="error-message">Неверно</span>}
        </div>
        <div className="control-group">
          <label htmlFor="new-height">Высота:</label>
          <input
            type="number"
            id="new-height"
            value={inputHeight}
            onChange={handleHeightChange}
            onFocus={() => setEditingField("height")}
            onBlur={() => setEditingField(null)}
            className={`${heightError ? "input-error" : ""} ${
              isHeightDisabled ? "disabled-input" : ""
            }`}
            min="1"
            disabled={isHeightDisabled}
          />
          <span>{unitDisplay}</span>
          {heightError && <span className="error-message">Неверно</span>}
        </div>
        <div className="control-group checkbox-group">
          <label htmlFor="maintain-aspect">Сохранять пропорции:</label>
          <input
            type="checkbox"
            id="maintain-aspect"
            checked={maintainAspectRatio}
            onChange={handleAspectRatioChange}
            disabled={!originalWidth || !originalHeight}
          />
        </div>
        <div className="control-group">
          <label htmlFor="interpolation-method">Метод интерполяции:</label>
          <select
            id="interpolation-method"
            value={interpolationMethod}
            onChange={handleInterpolationChange}
          >
            <option value="bilinear">Билинейная (по умолчанию)</option>
            <option value="nearest-neighbor">Ближайшего соседа</option>
          </select>
        </div>
        {interpolationMethod === "bilinear" && (
          <p className="tooltip-text">
            Билинейная: обеспечивает более плавные переходы цветов, но может
            немного размывать изображение, особенно при сильном уменьшении.
          </p>
        )}
        {interpolationMethod === "nearest-neighbor" && (
          <p className="tooltip-text">
            Ближайший сосед: сохраняет резкость и контуры, но может создавать
            эффект "лестницы" (ступенчатые края) и блочность при
            масштабировании.
          </p>
        )}
      </div>
      <div className="modal-buttons">
        <button onClick={handleConfirm} disabled={!calculatedNewDims.isValid}>
          OK
        </button>
        <button onClick={handleCancel}>Отмена</button>
      </div>
    </dialog>
  )
}

export default ModalResize
