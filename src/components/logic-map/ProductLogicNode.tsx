import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { EvidenceBadge } from '../badges'
import type { ProductFlowNode } from './graphTypes'

function ProductLogicNodeInner({ data, selected }: NodeProps<ProductFlowNode>) {
  const { logic, docCount, role, dimmed, index, reducedMotion, onActivate } = data
  const Icon = logic.icon
  const roleHint = role !== 'overview' ? logic.roleExplanations[role]?.summary : null

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
      animate={{
        opacity: dimmed ? 0.35 : 1,
        y: 0,
        scale: selected ? 1.03 : 1,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 320, damping: 26, delay: index * 0.055 }
      }
      whileHover={reducedMotion || dimmed ? undefined : { y: -3, scale: selected ? 1.03 : 1.02 }}
      role="button"
      tabIndex={0}
      aria-label={`${logic.step}단계 ${logic.title}: ${logic.plain}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate(logic.id)
        }
      }}
      className={`group relative w-[248px] cursor-pointer overflow-hidden rounded-2xl border bg-white text-left shadow-card outline-none transition-shadow duration-200 focus-visible:ring-4 focus-visible:ring-blue-100 ${
        selected
          ? 'border-blue-300 shadow-[0_0_0_5px_rgba(49,130,246,0.14),0_14px_36px_rgba(49,130,246,0.16)]'
          : 'border-toss-line hover:border-blue-200 hover:shadow-soft'
      }`}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: logic.color }} />
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-none !bg-transparent" aria-hidden />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-none !bg-transparent" aria-hidden />

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span
            style={{ color: logic.color, background: `${logic.color}16` }}
            className="grid h-9 w-9 place-items-center rounded-xl transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105"
          >
            <Icon size={17} />
          </span>
          <div className="flex items-center gap-1.5">
            <EvidenceBadge value={logic.evidence} />
            <span className="text-[10px] font-extrabold text-toss-muted">{logic.step}</span>
          </div>
        </div>
        <h3 className="mt-2.5 text-[14px] font-extrabold leading-5">{logic.title}</h3>
        <p className="mt-1 line-clamp-2 text-[11.5px] font-medium leading-4 text-toss-muted">{logic.plain}</p>

        {roleHint && (
          <p className="mt-2 line-clamp-2 rounded-lg bg-blue-50/70 px-2 py-1.5 text-[10.5px] font-semibold leading-4 text-blue-800">
            {roleHint}
          </p>
        )}

        <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-toss-blue">
          <FileText size={11} /> {docCount} docs
        </p>
      </div>
    </motion.div>
  )
}

export const ProductLogicNode = memo(ProductLogicNodeInner)
