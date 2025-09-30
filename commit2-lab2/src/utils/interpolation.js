export function nearestNeighbor(originalImageData, newWidth, newHeight) {
  const originalWidth = originalImageData.width
  const originalHeight = originalImageData.height
  const originalData = originalImageData.data

  const newImageData = new ImageData(newWidth, newHeight)
  const newData = newImageData.data

  const xRatio = originalWidth / newWidth
  const yRatio = originalHeight / newHeight

  for (let y = 0; y < newHeight; y++) {
    const originalY = Math.floor(y * yRatio)

    const safeOriginalY = Math.max(0, Math.min(originalY, originalHeight - 1))

    for (let x = 0; x < newWidth; x++) {
      const originalX = Math.floor(x * xRatio)

      const safeOriginalX = Math.max(0, Math.min(originalX, originalWidth - 1))

      const originalIndex = (safeOriginalY * originalWidth + safeOriginalX) * 4

      const newIndex = (y * newWidth + x) * 4

      newData[newIndex] = originalData[originalIndex]
      newData[newIndex + 1] = originalData[originalIndex + 1]
      newData[newIndex + 2] = originalData[originalIndex + 2]
      newData[newIndex + 3] = originalData[originalIndex + 3]
    }
  }

  return newImageData
}

export function bilinearInterpolation(originalImageData, newWidth, newHeight) {
  const originalWidth = originalImageData.width
  const originalHeight = originalImageData.height
  const originalData = originalImageData.data

  const newImageData = new ImageData(newWidth, newHeight)
  const newData = newImageData.data

  const xRatio = originalWidth / newWidth
  const yRatio = originalHeight / newHeight

  const getPixel = (data, width, height, x, y) => {
    x = Math.max(0, Math.min(x, width - 1))
    y = Math.max(0, Math.min(y, height - 1))
    const index = (y * width + x) * 4
    return [data[index], data[index + 1], data[index + 2], data[index + 3]]
  }

  const lerp = (v0, v1, t) => {
    return v0 * (1 - t) + v1 * t
  }

  const interpolateChannel = (p11, p21, p12, p22, dx, dy) => {
    const top = lerp(p11, p21, dx)

    const bottom = lerp(p12, p22, dx)

    return lerp(top, bottom, dy)
  }

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const originalX = x * xRatio
      const originalY = y * yRatio

      const x1 = Math.floor(originalX)
      const y1 = Math.floor(originalY)

      const x2 = Math.min(x1 + 1, originalWidth - 1)
      const y2 = Math.min(y1 + 1, originalHeight - 1)

      const dx = originalX - x1
      const dy = originalY - y1

      const p11 = getPixel(originalData, originalWidth, originalHeight, x1, y1)
      const p21 = getPixel(originalData, originalWidth, originalHeight, x2, y1)
      const p12 = getPixel(originalData, originalWidth, originalHeight, x1, y2)
      const p22 = getPixel(originalData, originalWidth, originalHeight, x2, y2)

      const r = interpolateChannel(p11[0], p21[0], p12[0], p22[0], dx, dy)
      const g = interpolateChannel(p11[1], p21[1], p12[1], p22[1], dx, dy)
      const b = interpolateChannel(p11[2], p21[2], p12[2], p22[2], dx, dy)
      const a = interpolateChannel(p11[3], p21[3], p12[3], p22[3], dx, dy)

      const newIndex = (y * newWidth + x) * 4

      newData[newIndex] = Math.round(r)
      newData[newIndex + 1] = Math.round(g)
      newData[newIndex + 2] = Math.round(b)
      newData[newIndex + 3] = Math.round(a)
    }
  }

  return newImageData
}
