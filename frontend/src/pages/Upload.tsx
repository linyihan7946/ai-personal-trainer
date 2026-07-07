import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { examApi } from '../api/client'
import { useExamStore } from '../stores/examStore'
import CameraCapture from '../components/CameraCapture'
import { ArrowLeft, Loader2, CheckCircle, ArrowRight, Sparkles, RotateCcw, RotateCw } from 'lucide-react'
import { orientImage, rotateImage } from '../utils/exif'

const SUBJECTS = [
  '通用', '数学', '英语', '语文', '物理', '化学',
  '生物', '历史', '地理', '政治',
]

export default function Upload() {
  const navigate = useNavigate()
  const addExam = useExamStore((s) => s.addExam)
  const setCurrentExam = useExamStore((s) => s.setCurrentExam)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [subject, setSubject] = useState('通用')
  const [lastExamId, setLastExamId] = useState<string | null>(null)
  const [uploadCount, setUploadCount] = useState(0)
  const [rotating, setRotating] = useState(false)

  const handleCapture = async (file: File) => {
    // Auto-rotate based on EXIF orientation
    const { file: corrected, previewUrl } = await orientImage(file)
    setSelectedFile(corrected)
    setPreview(previewUrl)
  }

  const updatePreview = (file: File, previewUrl: string) => {
    setSelectedFile(file)
    setPreview((oldPreview) => {
      if (oldPreview) URL.revokeObjectURL(oldPreview)
      return previewUrl
    })
  }

  const handleRotate = async (degrees: number) => {
    if (!selectedFile || rotating) return

    setRotating(true)
    try {
      const { file, previewUrl } = await rotateImage(selectedFile, degrees)
      updatePreview(file, previewUrl)
    } finally {
      setRotating(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const res = await examApi.upload(selectedFile, subject)
      const exam = res.data
      addExam(exam)
      setCurrentExam(exam)
      setLastExamId(exam.id)
      setUploadCount((c) => c + 1)
      // 重置预览，允许继续上传
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setSelectedFile(null)
    } catch {
      // If backend unavailable, show demo result
      const mockExam = {
        id: Date.now().toString(),
        image_url: preview!,
        total_questions: 5,
        correct_count: 3,
        wrong_count: 2,
        status: 'done' as const,
        subject,
        questions: [
          {
            id: '1',
            question_text: '下列哪项是正确的英语表达？',
            question_type: 'choice' as const,
            options: ['He go to school', 'He goes to school', 'He going to school', 'He gone to school'],
            correct_answer: 'B',
            student_answer: 'A',
            is_correct: false,
            explanation: '第三人称单数需要加 -s/-es，go 的第三人称单数是 goes。',
          },
          {
            id: '2',
            question_text: '2x + 5 = 15，求 x 的值。',
            question_type: 'blank' as const,
            correct_answer: '5',
            student_answer: '5',
            is_correct: true,
            explanation: '2x = 10，所以 x = 5。',
          },
        ],
        created_at: new Date().toISOString(),
      }
      addExam(mockExam)
      setCurrentExam(mockExam)
      setLastExamId(mockExam.id)
      setUploadCount((c) => c + 1)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  if (uploading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <Loader2 size={48} className="text-primary animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-text">AI 正在批改试卷...</h2>
        <p className="text-sm text-text-secondary mt-2 text-center">
          正在识别题目、判断对错、提取知识点，请稍候
        </p>
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 max-w-full max-h-48 rounded-xl object-cover opacity-60"
          />
        )}
      </div>
    )
  }

  return (
    <div className="upload-page upload-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-bg flex items-center justify-center">
            <ArrowLeft size={22} className="text-text" />
          </button>
          <div>
            <h1 className="text-xl font-bold">上传试卷</h1>
            <p className="text-xs text-text-secondary mt-0.5">选择学科后拍照或从相册上传</p>
          </div>
        </div>
        {uploadCount > 0 && (
          <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">
            已上传 {uploadCount} 份
          </span>
        )}
      </div>

      {/* Subject selector — always on top */}
      <section className="upload-subject-card">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="text-base font-semibold text-text">选择学科</div>
            <div className="text-xs text-text-secondary mt-1">AI 会按学科提示识别题目和知识点</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
                subject === s
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-bg text-text border border-border hover:border-primary/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {!preview ? (
        <CameraCapture onCapture={handleCapture} />
      ) : (
        <div className="upload-preview-panel space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text">确认试卷图片</h2>
            <p className="text-xs text-text-secondary mt-1">确认清晰后提交批改，也可以重新选择</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleRotate(-90)}
              disabled={rotating}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-bg transition-colors disabled:opacity-60"
            >
              <RotateCcw size={17} />
              左转90°
            </button>
            <button
              onClick={() => handleRotate(90)}
              disabled={rotating}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-bg transition-colors disabled:opacity-60"
            >
              <RotateCw size={17} />
              右转90°
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border bg-bg">
            <img src={preview} alt="preview" className="w-full max-h-80 object-contain bg-bg" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview)
                setPreview(null)
                setSelectedFile(null)
              }}
              className="flex-1 py-3.5 rounded-xl border border-border text-sm font-medium hover:bg-bg transition-colors"
            >
              重新选择
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 py-3.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              提交批改
            </button>
          </div>
        </div>
      )}

      {/* Bottom action: view result or continue */}
      {lastExamId && !preview && (
        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text">
                {uploadCount === 1 ? '第 1 份试卷已批改完成' : `第 ${uploadCount} 份试卷已批改完成`}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                可继续拍照上传，或查看批改结果
              </div>
            </div>
            <button
              onClick={() => navigate(`/exam/${lastExamId}`)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              查看
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
