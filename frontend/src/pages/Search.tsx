import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeApi } from '../api/client'
import type { KnowledgeNode } from '../stores/knowledgeStore'
import { ArrowLeft, Search as SearchIcon, ChevronRight, X } from 'lucide-react'

export default function Search() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<KnowledgeNode[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(async () => {
    if (!keyword.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await knowledgeApi.search(keyword.trim())
      setResults(res.data.points || [])
    } catch {
      // Demo search
      const demoPoints = [
        { id: '1', name: '一般现在时', category: '英语', mastery_level: 3 },
        { id: '2', name: '第三人称单数', category: '英语', mastery_level: 2 },
      ].filter((p) => p.name.includes(keyword.trim()))
      setResults(demoPoints)
    } finally {
      setLoading(false)
    }
  }, [keyword])

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-text" />
        </button>
        <h1 className="text-lg font-semibold">搜索知识点</h1>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="输入关键词搜索知识点..."
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-primary transition-all"
          autoFocus
        />
        {keyword && (
          <button
            onClick={() => {
              setKeyword('')
              setResults([])
              setSearched(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
          >
            <X size={16} className="text-text-secondary" />
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-10 text-text-secondary text-sm">搜索中...</div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon size={40} className="mx-auto mb-3 text-text-secondary opacity-30" />
          <p className="text-text-secondary text-sm">未找到相关知识点</p>
          <p className="text-xs text-text-secondary mt-1">试试其他关键词</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((point) => (
            <button
              key={point.id}
              onClick={() => navigate(`/knowledge/${point.id}`)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: point.category === '英语' ? '#22c55e' : '#6366f1',
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{point.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-secondary bg-bg px-1.5 py-0.5 rounded">
                    {point.category}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`w-2 h-1.5 rounded-full ${
                          lvl <= point.mastery_level ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-text-secondary" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
