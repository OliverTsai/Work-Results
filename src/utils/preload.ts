import { imagesData } from '@/assets/picture/images'

export function preloadImages(): Promise<void> {
  const promises = Object.values(imagesData).map(src => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.src = src
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    })
  })
  return Promise.all(promises).then(() => void 0)
}