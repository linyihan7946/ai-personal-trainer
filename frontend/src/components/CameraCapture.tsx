import { useRef, useCallback, useState } from 'react'
import { Camera, Image, X } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState('')

  const startCamera = useCallback(async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowCamera(true)
    } catch {
      setError('无法访问摄像头，请检查权限设置')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setShowCamera(false)
  }, [])

  const takePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
        stopCamera()
      }
    }, 'image/jpeg', 0.9)
  }, [onCapture, stopCamera])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onCapture(file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [onCapture]
  )

  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <button onClick={stopCamera} className="absolute top-4 right-4 z-10 text-white p-2">
          <X size={28} />
        </button>
        <video ref={videoRef} autoPlay playsInline className="flex-1 w-full object-cover" />
        <div className="p-6 flex justify-center bg-black">
          <button
            onClick={takePhoto}
            className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="upload-capture-panel">
      <div>
        <h2 className="text-base font-semibold text-text">上传方式</h2>
        <p className="text-xs text-text-secondary mt-1">拍摄清晰、平整的试卷，识别效果会更好</p>
      </div>

      {error && (
        <div className="text-sm text-danger bg-red-50 px-4 py-2 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={startCamera}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
            <Camera size={26} />
          </div>
          <span className="text-sm font-semibold text-primary">拍照上传</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
            <Image size={26} />
          </div>
          <span className="text-sm font-semibold text-primary">相册选取</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-text-secondary text-center">支持 JPG、PNG 格式，单张图片不超过 10MB</p>
    </div>
  )
}
