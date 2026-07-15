const items: Array<{ code: string; label: string; className: string }> = [
  { code: 'DOCS', label: '공개 문서로 확인', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  { code: 'SPEC', label: '내부 스펙 기반', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { code: 'CONFIRM', label: '확인 필요', className: 'border-amber-200 bg-amber-50 text-amber-700' },
]

export function GraphLegend() {
  return (
    <dl className="flex flex-wrap items-center gap-1.5" aria-label="근거 상태 범례">
      {items.map((item) => (
        <div key={item.code} className={`flex items-center gap-1 rounded-lg border px-2 py-1 ${item.className}`}>
          <dt className="text-[9.5px] font-extrabold tracking-wide">{item.code}</dt>
          <dd className="hidden text-[9.5px] font-semibold xl:block">{item.label}</dd>
        </div>
      ))}
    </dl>
  )
}
