import "./App.css"
import InputFile from "./components/InputFile"
import RendCanvas from "./components/RendCanvas"
import StatusBar from "./components/StatusBar"
import { useImageLoader } from "./hooks/useImageLoader"

function App() {
  const { originalImageData, imageInfo, status, handleFileSelect } =
    useImageLoader()

  return (
    <div className="App">
      <h1>Загрузка и отображение изображения</h1>
      <InputFile
        onFileSelect={handleFileSelect}
        accept=".png, .jpg, .jpeg, .gb7"
      />
      <RendCanvas originalImageData={originalImageData} />
      <StatusBar
        statusText={status}
        width={imageInfo.width}
        height={imageInfo.height}
        depth={imageInfo.depth}
      />
    </div>
  )
}

export default App
