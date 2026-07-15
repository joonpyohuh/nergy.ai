import { useReactFlow } from '@xyflow/react'
import { Eye, EyeOff, Maximize, Minus, Plus, RotateCcw } from 'lucide-react'

interface GraphToolbarProps {
  showEdges: boolean
  onToggleEdges: () => void
  onResetLayout: () => void
}

const buttonClass =
  'grid h-8 w-8 place-items-center rounded-lg border border-toss-line bg-white text-toss-text shadow-sm transition hover:border-blue-200 hover:text-toss-blue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100'

export function GraphToolbar({ showEdges, onToggleEdges, onResetLayout }: GraphToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-white/70 p-1.5 backdrop-blur" role="toolbar" aria-label="그래프 컨트롤">
      <button type="button" className={buttonClass} title="전체 보기" aria-label="전체 보기" onClick={() => void fitView({ padding: 0.2, duration: 400 })}>
        <Maximize size={14} />
      </button>
      <button type="button" className={buttonClass} title="확대" aria-label="확대" onClick={() => void zoomIn({ duration: 200 })}>
        <Plus size={14} />
      </button>
      <button type="button" className={buttonClass} title="축소" aria-label="축소" onClick={() => void zoomOut({ duration: 200 })}>
        <Minus size={14} />
      </button>
      <button type="button" className={buttonClass} title="레이아웃 초기화" aria-label="레이아웃 초기화" onClick={onResetLayout}>
        <RotateCcw size={14} />
      </button>
      <button
        type="button"
        className={`${buttonClass} ${showEdges ? '' : 'bg-blue-50 text-toss-blue'}`}
        title={showEdges ? '연결선 숨기기' : '연결선 표시'}
        aria-label={showEdges ? '연결선 숨기기' : '연결선 표시'}
        aria-pressed={!showEdges}
        onClick={onToggleEdges}
      >
        {showEdges ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  )
}
