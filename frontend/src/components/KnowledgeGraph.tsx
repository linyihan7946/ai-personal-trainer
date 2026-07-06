import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { useNavigate } from 'react-router-dom'
import type { KnowledgeNode, KnowledgeEdge } from '../stores/knowledgeStore'

interface SimNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  category: string
  mastery_level: number
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source_id: string
  target_id: string
  weight: number
}

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

const CATEGORY_COLORS: Record<string, string> = {
  math: '#6366f1',
  数学: '#6366f1',
  english: '#22c55e',
  英语: '#22c55e',
  physics: '#f59e0b',
  物理: '#f59e0b',
  chemistry: '#ef4444',
  化学: '#ef4444',
  default: '#8b5cf6',
}

export default function KnowledgeGraph({ nodes, edges }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const navigate = useNavigate()

  const renderGraph = useCallback(() => {
    const svg = d3.select(svgRef.current)
    const width = svgRef.current?.clientWidth || 400
    const height = svgRef.current?.clientHeight || 500

    svg.selectAll('*').remove()

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }))
    const simLinks: SimLink[] = edges.map((e) => ({
      source: e.source_id,
      target: e.target_id,
      source_id: e.source_id,
      target_id: e.target_id,
      weight: e.weight,
    }))

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(80)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(30))

    const g = svg.append('g')

    const link = g
      .selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', (d) => d.weight * 2)
      .attr('stroke-opacity', 0.6)

    const nodeGroup = g
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_e: any, d: SimNode) => {
        navigate(`/knowledge/${d.id}`)
      })

    nodeGroup
      .append('circle')
      .attr('r', (d) => 12 + d.mastery_level * 3)
      .attr('fill', (d) => CATEGORY_COLORS[d.category] || CATEGORY_COLORS.default)
      .attr('fill-opacity', 0.8)
      .attr('stroke', (d) => CATEGORY_COLORS[d.category] || CATEGORY_COLORS.default)
      .attr('stroke-width', 1.5)

    nodeGroup
      .append('text')
      .text((d) => d.name.length > 6 ? d.name.slice(0, 6) + '..' : d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('font-size', 10)
      .attr('fill', '#64748b')

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      nodeGroup.attr('transform', (d: SimNode) => `translate(${d.x},${d.y})`)
    })

    // Drag
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeGroup.call(drag)

    // Zoom
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        }) as any
    )
  }, [nodes, edges, navigate])

  useEffect(() => {
    if (svgRef.current && nodes.length > 0) {
      renderGraph()
    }
  }, [nodes, edges, renderGraph])

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
        <BrainIcon />
        <p className="mt-3 text-sm">知识图谱还是空的</p>
        <p className="text-xs mt-1">上传试卷后，AI 会自动构建你的知识库</p>
      </div>
    )
  }

  return <svg ref={svgRef} className="w-full h-[500px] rounded-xl bg-bg" />
}

function BrainIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
      <path d="M12 4a3 3 0 0 0-3-3 3 3 0 0 0-3 3c0 1 .5 1.8 1.2 2.3C5.7 7.3 4 9.5 4 12c0 2.5 1.7 4.7 3.2 5.7C6.5 18.2 6 19 6 20a3 3 0 0 0 3 3 3 3 0 0 0 3-3M12 4a3 3 0 0 1 3-3 3 3 0 0 1 3 3c0 1-.5 1.8-1.2 2.3C18.3 7.3 20 9.5 20 12c0 2.5-1.7 4.7-3.2 5.7.7.5 1.2 1.3 1.2 2.3a3 3 0 0 1-3 3 3 3 0 0 1-3-3" />
    </svg>
  )
}
