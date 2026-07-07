/**
 * Read EXIF orientation from a JPEG file.
 * Returns 1-8 as per EXIF spec, or 1 if unknown.
 *
 * Orientation values:
 *   1 = normal
 *   3 = rotated 180°
 *   6 = rotated 90° CW (common for portrait phone photos)
 *   8 = rotated 90° CCW
 */
export function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const view = new DataView(reader.result as ArrayBuffer)
      // Check JPEG SOI marker
      if (view.getUint16(0, false) !== 0xffd8) {
        resolve(1)
        return
      }
      const length = view.byteLength
      let offset = 2
      while (offset < length) {
        if (view.getUint8(offset) !== 0xff) break
        const marker = view.getUint8(offset + 1)
        // APP1 marker contains EXIF
        if (marker === 0xe1) {
          const exifOffset = offset + 4
          const exifHeader = view.getUint32(exifOffset, false)
          if (exifHeader !== 0x45786966) { // "Exif"
            resolve(1)
            return
          }
          const tiffOffset = exifOffset + 6
          const littleEndian = view.getUint16(tiffOffset, false) === 0x4949
          const ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, littleEndian)
          const entryCount = view.getUint16(ifdOffset, littleEndian)
          for (let i = 0; i < entryCount; i++) {
            const entryOffset = ifdOffset + 2 + i * 12
            const tag = view.getUint16(entryOffset, littleEndian)
            if (tag === 0x0112) {
              // Orientation tag found
              const orientation = view.getUint16(entryOffset + 8, littleEndian)
              resolve(orientation >= 1 && orientation <= 8 ? orientation : 1)
              return
            }
          }
          resolve(1)
          return
        }
        offset += 2 + view.getUint16(offset + 2, false)
      }
      resolve(1)
    }
    reader.onerror = () => resolve(1)
    reader.readAsArrayBuffer(file.slice(0, 65536)) // Only need first 64KB for EXIF
  })
}

/**
 * Apply EXIF orientation to a file, returning a new rotated File and a preview URL.
 */
export async function orientImage(file: File): Promise<{ file: File; previewUrl: string }> {
  const orientation = await getExifOrientation(file)
  if (orientation === 1) {
    // No rotation needed
    return { file, previewUrl: URL.createObjectURL(file) }
  }

  // Load raw pixels. Some browsers auto-apply EXIF by default, so disable it
  // here and apply the transform ourselves to avoid double rotation.
  const img = await createImageBitmap(file, { imageOrientation: 'none' })
  const { width, height } = img

  const swapsDimensions = orientation >= 5 && orientation <= 8

  const canvas = document.createElement('canvas')
  canvas.width = swapsDimensions ? height : width
  canvas.height = swapsDimensions ? width : height
  const ctx = canvas.getContext('2d')!

  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0)
      break
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height)
      break
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height)
      break
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0)
      break
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0)
      break
    case 7:
      ctx.transform(0, -1, -1, 0, height, width)
      break
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width)
      break
  }
  ctx.drawImage(img, 0, 0)

  // Get blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('canvas toBlob failed'))
    }, 'image/jpeg', 0.92)
  })

  const correctedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
    type: 'image/jpeg',
  })

  return {
    file: correctedFile,
    previewUrl: URL.createObjectURL(correctedFile),
  }
}

export async function rotateImage(file: File, degrees: number): Promise<{ file: File; previewUrl: string }> {
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  if (normalizedDegrees === 0) {
    return { file, previewUrl: URL.createObjectURL(file) }
  }

  const img = await createImageBitmap(file, { imageOrientation: 'none' })
  const { width, height } = img
  const swapsDimensions = normalizedDegrees === 90 || normalizedDegrees === 270

  const canvas = document.createElement('canvas')
  canvas.width = swapsDimensions ? height : width
  canvas.height = swapsDimensions ? width : height
  const ctx = canvas.getContext('2d')!

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((normalizedDegrees * Math.PI) / 180)
  ctx.drawImage(img, -width / 2, -height / 2)
  img.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('canvas toBlob failed'))
    }, 'image/jpeg', 0.92)
  })

  const rotatedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
    type: 'image/jpeg',
  })

  return {
    file: rotatedFile,
    previewUrl: URL.createObjectURL(rotatedFile),
  }
}
