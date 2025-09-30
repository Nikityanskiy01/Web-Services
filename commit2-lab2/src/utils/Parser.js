export function parseGb7(arrayBuffer) {
  const view = new DataView(arrayBuffer)
  const fileSize = arrayBuffer.byteLength

  const width = view.getUint16(6, false)
  const height = view.getUint16(8, false)
  const maskFlag = view.getUint8(5) & 0x01
  const offset = 12

  if (fileSize < offset + width * height) {
    throw new Error(
      "Размер файла не соответствует заявленным размерам изображения."
    )
  }

  const pixelData = new Uint8Array(arrayBuffer, offset, width * height)
  const imageData = new ImageData(width, height)
  const data = imageData.data

  let pixelDataIndex = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gb7Byte = pixelData[pixelDataIndex++]
      const grayValue7Bit = gb7Byte & 0x7f
      const grayValue8Bit = Math.round((grayValue7Bit / 127) * 255)
      const maskBit = (gb7Byte >> 7) & 0x01

      let alpha = 255
      if (maskFlag === 1) {
        alpha = maskBit === 1 ? 255 : 0
      }

      const imageDataIndex = (y * width + x) * 4
      data[imageDataIndex] = grayValue8Bit
      data[imageDataIndex + 1] = grayValue8Bit
      data[imageDataIndex + 2] = grayValue8Bit
      data[imageDataIndex + 3] = alpha
    }
  }

  const depthDescription =
    maskFlag === 1
      ? "7-бит оттенков серого + 1-бит маски"
      : "7-бит оттенков серого"

  return { width, height, depthDescription, imageData }
}
