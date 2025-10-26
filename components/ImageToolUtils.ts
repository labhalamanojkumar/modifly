export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((b) => resolve(b as Blob), type, quality)
    } else {
      const data = canvas.toDataURL(type, quality)
      const byteString = atob(data.split(',')[1])
      const ia = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
      resolve(new Blob([ia], { type }))
    }
  })
}
