import { memo } from 'react'
import { EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { RELATIONSHIP_TYPE_LABEL } from '../../data'
import { RELATIONSHIP_COLORS, type RelationshipFlowEdge } from './graphTypes'

function RelationshipEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<RelationshipFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.32,
  })

  if (!data) return null
  const { edge, dimmed, highlighted, isSelected, index, reducedMotion, onActivate } = data
  const typeColor = RELATIONSHIP_COLORS[edge.type]
  const active = highlighted || isSelected
  const strokeColor = active ? typeColor : '#C3CBD4'
  const baseDash = edge.type === 'feedback' ? '6 5' : undefined

  return (
    <g className={dimmed ? 'opacity-25 transition-opacity duration-300' : 'transition-opacity duration-300'}>
      <motion.path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={active ? 2.4 : 1.6}
        strokeDasharray={baseDash}
        markerEnd={markerEnd}
        className="rel-edge-visible"
        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.55, delay: 0.25 + index * 0.06, ease: 'easeOut' }}
      />
      {active && !reducedMotion && (
        <path d={edgePath} fill="none" stroke={typeColor} strokeWidth={2.4} strokeLinecap="round" className="rel-edge-dash" opacity={0.85} />
      )}
      {isSelected && !reducedMotion && (
        <circle r={3.5} fill={typeColor} aria-hidden>
          <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      <EdgeLabelRenderer>
        <button
          type="button"
          aria-label={`연결 관계: ${edge.label} (${RELATIONSHIP_TYPE_LABEL[edge.type]}, ${edge.evidence})`}
          onClick={(e) => {
            e.stopPropagation()
            onActivate(id)
          }}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`nodrag nopan absolute z-10 flex max-w-[180px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur transition-all duration-200 ${
            isSelected
              ? 'border-blue-300 bg-white text-toss-blue ring-4 ring-blue-100'
              : active
                ? 'border-blue-200 bg-white/95 text-toss-text'
                : dimmed
                  ? 'border-toss-line bg-white/70 text-toss-muted opacity-40'
                  : 'border-toss-line bg-white/90 text-toss-muted hover:border-blue-200 hover:text-toss-text'
          }`}
        >
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: typeColor }} />
          <span className="truncate">{edge.label}</span>
          <span className="shrink-0 rounded bg-toss-surface px-1 text-[9px] font-extrabold text-toss-muted">{edge.evidence.charAt(0)}</span>
        </button>
      </EdgeLabelRenderer>
    </g>
  )
}

export const RelationshipEdge = memo(RelationshipEdgeInner)
