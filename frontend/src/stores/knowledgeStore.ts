import { create } from 'zustand'

export interface KnowledgeNode {
  id: string
  name: string
  category: string
  mastery_level: number
}

export interface KnowledgeEdge {
  source_id: string
  target_id: string
  relation_type: string
  weight: number
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export interface KnowledgePointDetail {
  id: string
  name: string
  description: string
  category: string
  mastery_level: number
  related_questions: {
    id: string
    question_text: string
    question_type: string
    is_correct: boolean
  }[]
  related_points: KnowledgeNode[]
}

interface KnowledgeState {
  graph: KnowledgeGraph | null
  currentPoint: KnowledgePointDetail | null
  searchResults: KnowledgeNode[]
  setGraph: (graph: KnowledgeGraph) => void
  setCurrentPoint: (point: KnowledgePointDetail | null) => void
  setSearchResults: (results: KnowledgeNode[]) => void
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  graph: null,
  currentPoint: null,
  searchResults: [],
  setGraph: (graph) => set({ graph }),
  setCurrentPoint: (point) => set({ currentPoint: point }),
  setSearchResults: (results) => set({ searchResults: results }),
}))
