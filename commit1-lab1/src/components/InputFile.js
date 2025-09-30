import { useState } from "react"

function InputFile({ onFileSelect, accept }) {
  const [inputKey, setInputKey] = useState(Date.now())

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (file && onFileSelect) {
      onFileSelect(event)
    }
    setInputKey(Date.now())
  }

  return (
    <div className="controls">
      <input
        key={inputKey}
        type="file"
        id="imageInput"
        accept={accept}
        onChange={handleFileChange}
      />
      <label htmlFor="imageInput">Выберите файл изображения</label>
    </div>
  )
}
export default InputFile
