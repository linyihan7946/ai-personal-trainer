import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { knowledgeApi } from '../api/client'
import { useKnowledgeStore } from '../stores/knowledgeStore'
import KnowledgeGraph from '../components/KnowledgeGraph'
import { ArrowLeft, Brain, Search, List } from 'lucide-react'

export default function KnowledgeBase() {
  const navigate = useNavigate()
  const { graph, setGraph } = useKnowledgeStore()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await knowledgeApi.graph()
        setGraph(res.data)
      } catch {
        setGraph({
          nodes: [
            { id: '1', name: '一般现在时', category: '英语', mastery_level: 3 },
            { id: '2', name: '第三人称单数', category: '英语', mastery_level: 2 },
            { id: '3', name: '一元一次方程', category: '数学', mastery_level: 4 },
            { id: '4', name: '现在进行时', category: '英语', mastery_level: 1 },
            { id: '5', name: '因式分解', category: '数学', mastery_level: 2 },
          ],
          edges: [
            { source_id: '1', target_id: '2', relation_type: 'extends', weight: 1.5 },
            { source_id: '1', target_id: '4', relation_type: 'related', weight: 1.0 },
            { source_id: '3', target_id: '5', relation_type: 'prerequisite', weight: 1.0 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchGraph()
  }, [setGraph])

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} className="text-text" />
          </button>
          <h1 className="text-lg font-semibold">个人知识库</h1>
        </div>
        <div className="flex gap-1 bg-bg rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('graph')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'graph' ? 'bg-white shadow-sm' : ''}`}
          >
            <Brain size={18} className={viewMode === 'graph' ? 'text-primary' : 'text-text-secondary'} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <List size={18} className={viewMode === 'list' ? 'text-primary' : 'text-text-secondary'} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <button
        onClick={() => navigate('/search')}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg text-text-secondary text-sm mb-4 hover:border-primary/30 transition-colors"
      >
        <Search size={16} />
        <span>搜索知识点...</span>
      </button>

      {loading ? (
        <div className="text-center py-20 text-text-secondary text-sm">加载中...</div>
      ) : viewMode === 'graph' ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <KnowledgeGraph nodes={graph?.nodes || []} edges={graph?.edges || []} />
        </div>
      ) : (
        <div className="space-y-2">
          {(graph?.nodes || []).map((node) => (
            <button
              key={node.id}
              onClick={() => navigate(`/knowledge/${node.id}`)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getCategoryColor(node.category),
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{node.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-secondary bg-bg px-1.5 py-0.5 rounded">
                    {node.category}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`w-2 h-1.5 rounded-full ${
                          lvl <= node.mastery_level ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    math: '#6366f1', 数学: '#6366f1',
    english: '#22c55e', 英语: '#22c55e',
    physics: '#f59e0b', 物理: '#f59e0b',
    chemistry: '#ef4444', 化学: '#ef4444',
  }
  return map[cat] || '#8b5cf6'
}
