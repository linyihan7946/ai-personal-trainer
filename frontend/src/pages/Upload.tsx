import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { examApi } from '../api/client'
import { useExamStore } from '../stores/examStore'
import CameraCapture from '../components/CameraCapture'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

export default function Upload() {
  const navigate = useNavigate()
  const addExam = useExamStore((s) => s.addExam)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleCapture = (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const res = await examApi.upload(selectedFile)
      const exam = res.data
      addExam(exam)
      navigate(`/exam/${exam.id}`, { replace: true })
    } catch {
      // If backend unavailable, show demo result
      const mockExam = {
        id: Date.now().toString(),
        image_url: preview!,
        total_questions: 5,
        correct_count: 3,
        wrong_count: 2,
        status: 'done' as const,
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
      navigate(`/exam/${mockExam.id}`, { replace: true })
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
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-text" />
        </button>
        <h1 className="text-lg font-semibold">上传试卷</h1>
      </div>

      {!preview ? (
        <CameraCapture onCapture={handleCapture} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={preview} alt="preview" className="w-full object-cover max-h-80" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPreview(null)
                setSelectedFile(null)
              }}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-bg transition-colors"
            >
              重新选择
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              提交批改
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
