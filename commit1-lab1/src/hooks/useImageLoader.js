import { useState, useCallback } from "react"
import { parseGb7 } from "../utils/Parser"

const parseJpegHeader = (arrayBuffer) => {
  const view = new DataView(arrayBuffer)
  try {
    if (view.byteLength < 2 || view.getUint16(0, false) !== 0xffd8) {
      throw new Error("Invalid JPEG SOI marker")
    }
    let offset = 2
    while (offset < view.byteLength - 1) {
      const marker = view.getUint16(offset, false)
      if (
        marker >= 0xffc0 &&
        marker <= 0xffcf &&
        marker !== 0xffc4 &&
        marker !== 0xffc8 &&
        marker !== 0xffcc
      ) {
        if (view.byteLength < offset + 8) {
          throw new Error("File too short for JPEG SOF marker data.")
        }
        const precision = view.getUint8(offset + 4)
        const height = view.getUint16(offset + 5, false)
        const width = view.getUint16(offset + 7, false)
        const numComponents = view.getUint8(offset + 9)

        const bitsPerPixel = precision * numComponents
        let depthDescription
        switch (numComponents) {
          case 1:
            depthDescription = `${bitsPerPixel}-бит оттенков серого`
            break
          case 3:
            depthDescription = `${bitsPerPixel}-бит RGB`
            break
          case 4:
            depthDescription = `${bitsPerPixel}-бит CMYK`
            break
          default:
            depthDescription = `JPEG (${bitsPerPixel} бит, ${numComponents} компонента)`
        }
        return { width, height, depthDescription, bitsPerPixel }
      }
      if (view.byteLength < offset + 2) break
      const segmentLength = view.getUint16(offset + 2, false)
      offset += 2 + segmentLength
    }
    throw new Error("Не удалось найти SOF маркер в JPEG.")
  } catch (error) {
    console.error("JPEG header parsing failed:", error)
    throw new Error("Не удалось разобрать заголовок JPEG.")
  }
}

const imgUrlToImageData = (imgUrl, callback) => {
  const img = new Image()
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      callback(null, {
        width: img.width,
        height: img.height,
        imageData: imageData,
      })
    } catch (error) {
      console.error("Error converting Image URL to ImageData:", error)
      callback(new Error("Ошибка обработки изображения."))
    }
  }
  img.onerror = () => {
    console.error("Error loading Image for conversion:", imgUrl)
    callback(new Error("Ошибка загрузки изображения."))
  }
  img.src = imgUrl
}

const parsePngHeader = (arrayBuffer) => {
  const view = new DataView(arrayBuffer)
  try {
    if (
      view.byteLength < 8 ||
      view.getUint32(0, false) !== 0x89504e47 ||
      view.getUint32(4, false) !== 0x0d0a1a0a
    ) {
      throw new Error("Invalid PNG signature")
    }
    const ihdrOffset = 8
    if (view.byteLength < ihdrOffset + 17) {
      throw new Error("File too short for PNG IHDR chunk.")
    }
    if (view.getUint32(ihdrOffset + 4, false) !== 0x49484452) {
      throw new Error("IHDR chunk not found at expected offset.")
    }
    const width = view.getUint32(ihdrOffset + 8, false)
    const height = view.getUint32(ihdrOffset + 12, false)
    const bitDepthPerChannel = view.getUint8(ihdrOffset + 16)
    const colorType = view.getUint8(ihdrOffset + 17)

    let depthDescription
    let bitsPerPixel

    switch (colorType) {
      case 0:
        bitsPerPixel = bitDepthPerChannel
        depthDescription = `${bitsPerPixel}-бит оттенков серого`
        break
      case 2:
        bitsPerPixel = bitDepthPerChannel * 3
        depthDescription = `${bitsPerPixel}-бит RGB`
        break
      case 3:
        bitsPerPixel = bitDepthPerChannel
        depthDescription = `${bitsPerPixel}-бит индексированный`
        break
      case 4:
        bitsPerPixel = bitDepthPerChannel * 2
        depthDescription = `${bitsPerPixel}-бит оттенков серого с альфа`
        break
      case 6:
        bitsPerPixel = bitDepthPerChannel * 4
        depthDescription = `${bitsPerPixel}-бит RGBA`
        break
      default:
        depthDescription = `PNG (тип цвета: ${colorType}, глубина на канал: ${bitDepthPerChannel})`
        bitsPerPixel = null
    }
    return { width, height, depthDescription, bitsPerPixel }
  } catch (error) {
    console.error("PNG header parsing failed:", error)
    throw new Error("Не удалось разобрать заголовок PNG.")
  }
}

export function useImageLoader() {
  const [status, setStatus] = useState("Ожидание загрузки изображения...")
  const [imageInfo, setImageInfo] = useState({
    width: null,
    height: null,
    depth: null,
  })
  const [originalImageData, setOriginalImageData] = useState(null)

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files ? event.target.files[0] : null
    if (!file) {
      setStatus("Выберите файл изображения.")
      setOriginalImageData(null)
      setImageInfo({ width: null, height: null, depth: null })
      return
    }

    setStatus(`Загрузка файла: ${file.name}...`)
    setOriginalImageData(null)
    setImageInfo({ width: null, height: null, depth: null })

    const fileName = file.name.toLowerCase()
    const reader = new FileReader()

    reader.onloadstart = () => {
      setStatus(`Чтение файла: ${file.name}...`)
    }

    reader.onload = (e) => {
      const arrayBuffer = e.target.result

      if (fileName.endsWith(".gb7")) {
        try {
          const {
            width,
            height,
            depthDescription,
            imageData: gb7ImageData,
          } = parseGb7(arrayBuffer)
          setOriginalImageData(gb7ImageData)
          setImageInfo({ width, height, depth: depthDescription })
          setStatus(`GrayBit-7 изображение загружено.`)
        } catch (error) {
          setStatus(`Ошибка обработки GB7: ${error.message}`)
          setImageInfo({ width: null, height: null, depth: null })
          setOriginalImageData(null)
          console.error("Ошибка обработки GB7:", error)
        }
      } else if (
        fileName.endsWith(".png") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg")
      ) {
        try {
          let headerInfo
          if (fileName.endsWith(".png")) {
            headerInfo = parsePngHeader(arrayBuffer)
          } else {
            headerInfo = parseJpegHeader(arrayBuffer)
          }

          setImageInfo({
            width: headerInfo.width,
            height: headerInfo.height,
            depth: headerInfo.depthDescription,
          })
          setStatus(
            `Заголовок ${fileName.toUpperCase()} прочитан (${
              headerInfo.depthDescription
            }). Готов к загрузке пикселей.`
          )

          const pixelReader = new FileReader()

          pixelReader.onload = (pixelEvent) => {
            const imgUrl = pixelEvent.target.result
            imgUrlToImageData(imgUrl, (imgError, result) => {
              if (imgError) {
                setStatus(`Ошибка загрузки пикселей: ${imgError.message}`)
                setOriginalImageData(null)
                console.error("Ошибка загрузки пикселей:", imgError)
              } else {
                setOriginalImageData(result.imageData)
                setStatus(`${fileName.toUpperCase()} изображение загружено`)
              }
            })
          }
          pixelReader.onerror = () => {
            setStatus("Ошибка чтения пиксельных данных.")
            setOriginalImageData(null)
          }
          pixelReader.readAsDataURL(file)
        } catch (error) {
          setStatus(`Ошибка обработки файла: ${error.message}`)
          setImageInfo({ width: null, height: null, depth: null })
          setOriginalImageData(null)
          console.error("Ошибка обработки файла:", error)
        }
      } else {
        setStatus(`Неподдерживаемый формат файла: ${file.type || file.name}.`)
        setImageInfo({ width: null, height: null, depth: null })
        setOriginalImageData(null)
      }
    }

    reader.onerror = () => {
      setStatus("Ошибка чтения файла.")
      setImageInfo({ width: null, height: null, depth: null })
      setOriginalImageData(null)
    }

    reader.readAsArrayBuffer(file)
  }, [])

  return {
    originalImageData,
    imageInfo,
    status,
    handleFileSelect,
  }
}
