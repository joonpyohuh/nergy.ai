import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, CircleHelp,
  Code2, ExternalLink, FileCheck2, FilePlus2, Globe2, Layers3, Link2,
  LoaderCircle, Menu, PanelRightClose, Plus, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { allSuggestions, logicNodes, sources, type Audience, type DocSuggestion, type Evidence } from './data'

const evidenceStyle: Record<Evidence, string> = {
  DOCS: 'bg-blue-50 text-blue-700 border-blue-100',
  SPEC: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CONFIRM: 'bg-amber-50 text-amber-700 border-amber-100',
}

const evidenceCopy: Record<Evidence, string> = {
  DOCS: '공개 문서로 확인', SPEC: '제공 명세로 확인', CONFIRM: '담당자 확인 필요',
}

function EvidenceBadge({ value }: { value: Evidence }) {
  return <span title={evidenceCopy[value]} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${evidenceStyle[value]}`}>{value}</span>
}

function App() {
  const [url, setUrl] = useState('https://delight.ai')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeNode, setActiveNode] = useState(logicNodes[0].id)
  const [audience, setAudience] = useState<Audience>('모두')
  const [selected, setSelected] = useState<string[]>([])
  const [showPlan, setShowPlan] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [outlineReady, setOutlineReady] = useState(false)
  const workspaceRef = useRef<HTMLDivElement>(null)

  const filteredSuggestions = useMemo(() => allSuggestions.filter((item) => audience === '모두' || item.audience === audience || item.audience === '모두'), [audience])
  const selectedDocs = allSuggestions.filter((item) => selected.includes(item.id))
  const currentNode = logicNodes.find((node) => node.id === activeNode) ?? logicNodes[0]

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const runAnalysis = () => {
    if (!url.trim()) return
    setAnalyzing(true)
    setAnalyzed(false)
    setProgress(8)
    const marks = [
      window.setTimeout(() => setProgress(31), 450),
      window.setTimeout(() => setProgress(58), 950),
      window.setTimeout(() => setProgress(82), 1500),
      window.setTimeout(() => setProgress(100), 2050),
      window.setTimeout(() => {
        setAnalyzing(false)
        setAnalyzed(true)
        setToast('분석 완료했어요! 👏')
        window.setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }, 2350),
    ]
    return () => marks.forEach(window.clearTimeout)
  }

  const toggleDoc = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
    setOutlineReady(false)
  }

  const generateOutline = () => {
    if (!selected.length) return
    setOutlineReady(false)
    window.setTimeout(() => {
      setOutlineReady(true)
      setToast('초안 구조를 만들었어요! 👏')
    }, 650)
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-toss-dark">
      <header className="glass fixed inset-x-0 top-0 z-40 border-b border-black/[0.04]">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2" aria-label="nergy.ai 홈">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-toss-blue text-white shadow-sm"><Sparkles size={17} strokeWidth={2.5}/></span>
            <span className="text-[20px] font-extrabold tracking-[-0.04em]">nergy<span className="text-toss-blue">.ai</span></span>
            <span className="ml-1 hidden rounded-md bg-toss-surface px-2 py-1 text-[10px] font-bold text-toss-muted sm:inline">PUBLIC BETA</span>
          </button>
          <nav className="hidden items-center gap-7 text-[14px] font-semibold text-toss-muted md:flex">
            <button onClick={() => analyzed && workspaceRef.current?.scrollIntoView({ behavior:'smooth' })} className="transition hover:text-toss-dark">워크스페이스</button>
            <button onClick={() => setShowSources(true)} className="transition hover:text-toss-dark">분석 근거</button>
            <a href="https://github.com/joonpyohuh/nergy.ai" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-toss-dark"><Code2 size={16}/> GitHub</a>
          </nav>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="rounded-xl p-2 text-toss-text md:hidden" aria-label="메뉴"><Menu size={22}/></button>
        </div>
        {showMobileMenu && <div className="border-t border-toss-line bg-white px-5 py-4 md:hidden"><button onClick={() => setShowSources(true)} className="w-full py-2 text-left font-semibold">분석 근거 보기</button><a href="https://github.com/joonpyohuh/nergy.ai" className="block py-2 font-semibold">GitHub</a></div>}
      </header>

      <section className="relative overflow-hidden bg-white px-5 pb-20 pt-32 lg:pb-28 lg:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[780px] -translate-x-1/2 rounded-full bg-blue-50/70 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-[13px] font-bold text-blue-700">
            <Layers3 size={15}/> AI Agent × Developer Experience × Technical Writing
          </div>
          <h1 className="text-balance text-[40px] font-extrabold leading-[1.14] tracking-[-0.055em] sm:text-5xl lg:text-[64px]">
            복잡한 제품을 이해하면,<br/><span className="text-toss-blue">써야 할 문서가 보여요.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] font-medium leading-7 text-toss-muted sm:text-[19px]">
            nergy.ai는 공개 자료를 읽고 제품 로직을 쉬운 지도로 바꿔요.<br className="hidden sm:block"/> 그리고 Technical Writer가 시작할 문서 지점을 근거와 함께 제안해요.
          </p>

          <div className="mx-auto mt-10 max-w-2xl rounded-[24px] border border-toss-line bg-white p-2.5 shadow-soft sm:flex">
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
              <Globe2 className="shrink-0 text-toss-muted" size={20}/>
              <span className="sr-only">분석할 제품 URL</span>
              <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runAnalysis()} className="min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:text-[#B0B8C1]" placeholder="분석할 제품 URL을 붙여 넣으세요" />
            </label>
            <button onClick={runAnalysis} disabled={analyzing || !url.trim()} className="flex w-full items-center justify-center gap-2 rounded-[17px] bg-toss-blue px-6 py-4 text-[15px] font-bold text-white transition hover:bg-[#1B64DA] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              {analyzing ? <><LoaderCircle size={18} className="animate-spin"/> 분석 중</> : <>제품 분석하기 <ArrowRight size={18}/></>}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-medium text-toss-muted">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/>공개 웹 자료 기반</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500"/>사실과 추론 분리</span>
            <span className="flex items-center gap-1.5"><FileCheck2 size={14} className="text-emerald-500"/>사람이 최종 판단</span>
          </div>
        </div>
      </section>

      {analyzing && (
        <section className="mx-auto -mt-8 max-w-2xl px-5 pb-24 animate-fade-up">
          <div className="rounded-[24px] border border-toss-line bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-center justify-between"><div><p className="text-[13px] font-bold text-toss-blue">PRODUCT SCAN</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em]">제품의 연결 관계를 찾고 있어요</h2></div><span className="text-lg font-extrabold text-toss-blue">{progress}%</span></div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-toss-surface"><div style={{width:`${progress}%`}} className="h-full rounded-full bg-toss-blue transition-all duration-500"/></div>
            <div className="mt-6 grid gap-3 text-[13px] font-semibold text-toss-muted sm:grid-cols-2">
              {['공식 제품 페이지 읽기','기능과 데이터 흐름 연결','확인 필요한 가정 분리','문서화 기회 찾기'].map((label, i) => <div key={label} className="flex items-center gap-2"><span className={`grid h-5 w-5 place-items-center rounded-full ${progress > (i+1)*22 ? 'bg-blue-50 text-toss-blue' : 'bg-toss-surface'}`}>{progress > (i+1)*22 ? <Check size={12}/> : i+1}</span>{label}</div>)}
            </div>
          </div>
        </section>
      )}

      {!analyzed && !analyzing && (
        <section className="border-t border-toss-line bg-[#F7F8FA] px-5 py-16">
          <div className="mx-auto max-w-5xl"><div className="mb-8 text-center"><p className="text-[13px] font-bold text-toss-blue">HOW IT WORKS</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">분석에서 writing start까지</h2></div>
            <div className="grid gap-4 md:grid-cols-3">
              {[['01','자료를 읽어요','제품 페이지와 공개 문서에서 기능·용어·관계를 찾습니다.'],['02','쉬운 지도로 바꿔요','개발자가 아니어도 이해할 수 있는 흐름으로 재구성합니다.'],['03','문서 후보를 제안해요','근거와 확인할 질문까지 묶어 첫 문서 작업을 시작합니다.']].map(([n,t,d]) => <div key={n} className="rounded-[24px] border border-toss-line bg-white p-6"><span className="text-[13px] font-extrabold text-toss-blue">{n}</span><h3 className="mt-4 text-xl font-extrabold tracking-[-0.03em]">{t}</h3><p className="mt-2 text-[14px] font-medium leading-6 text-toss-muted">{d}</p></div>)}
            </div>
          </div>
        </section>
      )}

      {analyzed && (
        <div ref={workspaceRef} className="scroll-mt-16">
          <section className="border-y border-toss-line bg-white px-5 py-5">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#141414] text-xl font-black text-white">d</div><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-[18px] font-extrabold">Delight.ai 분석</h2><span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">2026.07.14</span></div><p className="mt-0.5 truncate text-[13px] font-medium text-toss-muted">Enterprise AI customer experience · 공개 자료 6개</p></div></div>
              <div className="flex flex-wrap gap-2"><button onClick={() => setShowSources(true)} className="flex items-center gap-2 rounded-xl border border-toss-line bg-white px-4 py-2.5 text-[13px] font-bold hover:bg-toss-surface"><Link2 size={15}/>분석 근거 6개</button><button onClick={() => setShowPlan(true)} className="flex items-center gap-2 rounded-xl bg-toss-dark px-4 py-2.5 text-[13px] font-bold text-white hover:bg-black"><FilePlus2 size={15}/>Writing plan <span className="rounded-md bg-white/15 px-1.5">{selected.length}</span></button></div>
            </div>
          </section>

          <section className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-8">
            <div className="min-w-0 space-y-5">
              <div className="overflow-hidden rounded-[24px] border border-toss-line bg-white shadow-card">
                <div className="flex flex-col gap-4 border-b border-toss-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">
                  <div><div className="flex items-center gap-2"><h2 className="text-xl font-extrabold tracking-[-0.03em]">제품 로직 맵</h2><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">쉬운 설명</span></div><p className="mt-1 text-[13px] font-medium text-toss-muted">노드를 선택하면 역할과 문서화 지점을 볼 수 있어요.</p></div>
                  <div className="flex items-center gap-2 rounded-xl bg-toss-surface p-1 text-[12px] font-bold"><button className="rounded-lg bg-white px-3 py-2 text-toss-dark shadow-sm">Flow</button><button className="px-3 py-2 text-toss-muted">System</button></div>
                </div>
                <div className="mindmap-grid overflow-x-auto p-5 lg:p-7">
                  <div className="grid min-w-[760px] grid-cols-4 gap-x-7 gap-y-5">
                    {logicNodes.slice(0,4).map((node) => <LogicCard key={node.id} node={node} active={activeNode===node.id} onClick={() => setActiveNode(node.id)}/>)}
                    <div className="col-span-4 flex items-center justify-center py-1"><div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[12px] font-bold text-blue-700"><Sparkles size={14}/> 같은 사건 상태를 유지하며 다음 단계로</div></div>
                    {logicNodes.slice(4).map((node) => <LogicCard key={node.id} node={node} active={activeNode===node.id} onClick={() => setActiveNode(node.id)}/>)}
                    <div className="flex min-h-[116px] items-center justify-center rounded-2xl border border-dashed border-toss-line bg-white/70 p-4 text-center text-[12px] font-semibold leading-5 text-toss-muted"><div><Plus size={18} className="mx-auto mb-1"/>내부 명세를 연결하면<br/>더 정확해져요</div></div>
                  </div>
                </div>
                <div className="border-t border-toss-line bg-[#FBFCFD] p-5 lg:p-7">
                  <div className="flex flex-col gap-5 md:flex-row"><div className="flex flex-1 gap-4"><div style={{background:currentNode.color}} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white"><currentNode.icon size={23}/></div><div><p className="text-[12px] font-extrabold text-toss-muted">{currentNode.step} · {currentNode.title}</p><h3 className="mt-1 text-lg font-extrabold tracking-[-0.02em]">{currentNode.plain}</h3><p className="mt-2 text-[14px] font-medium leading-6 text-toss-text">{currentNode.detail}</p></div></div><div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:w-[300px]"><p className="text-[11px] font-extrabold text-blue-700">쉽게 예를 들면</p><p className="mt-2 text-[13px] font-semibold leading-5 text-toss-text">{currentNode.example}</p></div></div>
                </div>
              </div>

              <div className="rounded-[20px] border border-amber-200 bg-amber-50/70 p-5"><div className="flex gap-3"><CircleHelp size={20} className="mt-0.5 shrink-0 text-amber-600"/><div><p className="text-[14px] font-extrabold text-amber-900">정확성 메모</p><p className="mt-1 text-[13px] font-medium leading-5 text-amber-800/80">이 맵은 Delight.ai의 공개 제품 자료를 연결해 만든 <strong>이해 모델</strong>이에요. 실제 내부 서비스 경계, 데이터 스키마, 호출 순서는 엔지니어와 제품 담당자에게 확인해야 해요.</p></div></div></div>
            </div>

            <aside className="min-w-0 rounded-[24px] border border-toss-line bg-white shadow-card lg:sticky lg:top-24 lg:h-[calc(100vh-120px)]">
              <div className="border-b border-toss-line p-5"><div className="flex items-center justify-between"><div><p className="text-[11px] font-extrabold text-toss-blue">AI WRITING SUGGESTIONS</p><h2 className="mt-1 text-lg font-extrabold tracking-[-0.03em]">이 내용을 writing 하면<br/>어떨까요?</h2></div><div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-toss-blue"><Sparkles size={19}/></div></div>
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">{(['모두','개발자','운영팀','마케터·디자이너'] as Audience[]).map((item) => <button key={item} onClick={() => setAudience(item)} className={`whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-bold transition ${audience===item?'bg-toss-dark text-white':'bg-toss-surface text-toss-muted hover:text-toss-dark'}`}>{item}</button>)}</div>
              </div>
              <div className="max-h-[calc(100vh-305px)] space-y-3 overflow-y-auto p-4 lg:max-h-[calc(100vh-285px)]">
                {filteredSuggestions.map((doc) => <SuggestionCard key={doc.id} doc={doc} selected={selected.includes(doc.id)} onToggle={() => toggleDoc(doc.id)}/>) }
              </div>
              <div className="border-t border-toss-line p-4"><button onClick={() => setShowPlan(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-toss-blue py-3.5 text-[13px] font-bold text-white transition hover:bg-[#1B64DA]">선택한 문서 {selected.length}개 보기 <ChevronRight size={16}/></button></div>
            </aside>
          </section>
        </div>
      )}

      <footer className="border-t border-toss-line bg-white px-5 py-8"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 text-[12px] font-medium text-toss-muted sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-extrabold text-toss-dark"><span className="grid h-6 w-6 place-items-center rounded-lg bg-toss-blue text-white"><Sparkles size={12}/></span>nergy.ai</div><p>AI assists the start. Writers own the judgment.</p><p>Early product concept by Junpyo Heo · 2026</p></div></footer>

      {showSources && <Drawer title="분석 근거" subtitle="공식 공개 자료만 사용했어요" onClose={() => setShowSources(false)}><div className="mb-5 rounded-2xl bg-blue-50 p-4 text-[13px] font-medium leading-5 text-blue-900">최종 확인일은 2026년 7월 14일이에요. 외부 설명은 확인했지만, 내부 구현 상세는 <strong>CONFIRM</strong>으로 남겨 두었습니다.</div><div className="space-y-3">{sources.map((source,i) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="group block rounded-2xl border border-toss-line p-4 transition hover:border-blue-200 hover:bg-blue-50/40"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-toss-surface text-[11px] font-extrabold text-toss-muted">{i+1}</span><div><h3 className="text-[14px] font-extrabold group-hover:text-blue-700">{source.title}</h3><p className="mt-1 text-[11px] font-bold text-toss-muted">{source.date}</p><p className="mt-2 text-[12px] font-medium leading-5 text-toss-text">{source.note}</p></div></div><ExternalLink size={15} className="shrink-0 text-toss-muted"/></div></a>)}</div></Drawer>}

      {showPlan && <Drawer title="Writing plan" subtitle={`${selected.length}개의 문서 후보를 선택했어요`} onClose={() => setShowPlan(false)} wide><div className="space-y-4">{selectedDocs.length===0 ? <div className="rounded-2xl border border-dashed border-toss-line py-16 text-center"><FilePlus2 size={28} className="mx-auto text-toss-muted"/><h3 className="mt-3 font-extrabold">아직 선택한 문서가 없어요</h3><p className="mt-1 text-[13px] font-medium text-toss-muted">제안 카드의 + 버튼을 눌러 시작해 보세요.</p></div> : selectedDocs.map((doc,i) => <div key={doc.id} className="rounded-2xl border border-toss-line p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="text-[11px] font-extrabold text-toss-blue">DOC {String(i+1).padStart(2,'0')}</span><EvidenceBadge value={doc.evidence}/></div><h3 className="mt-2 text-[16px] font-extrabold">{doc.title}</h3><p className="mt-1 text-[12px] font-semibold text-toss-muted">{doc.kind} · {doc.audience}</p></div><button onClick={() => toggleDoc(doc.id)} className="rounded-lg p-2 text-toss-muted hover:bg-toss-surface"><X size={16}/></button></div>{outlineReady && <ol className="mt-4 space-y-2 border-t border-toss-line pt-4">{doc.outline.map((line,n) => <li key={line} className="flex gap-3 text-[13px] font-medium text-toss-text"><span className="font-bold text-toss-muted">{n+1}.</span>{line}</li>)}</ol>}</div>)}</div>{selected.length>0 && <div className="sticky bottom-0 mt-5 border-t border-toss-line bg-white pt-4"><button onClick={generateOutline} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-toss-blue py-4 text-[14px] font-bold text-white hover:bg-[#1B64DA]"><Sparkles size={17}/>{outlineReady?'구성 다시 만들기':'문서 초안 구조 만들기'}</button><p className="mt-2 text-center text-[11px] font-medium text-toss-muted">초안은 시작점이에요. 담당자 확인 후 최종화하세요.</p></div>}</Drawer>}

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl bg-toss-dark px-5 py-3.5 text-[14px] font-bold text-white shadow-2xl animate-fade-up"><CheckCircle2 size={18} className="text-[#58D19B]"/>{toast}</div>}
    </main>
  )
}

function LogicCard({ node, active, onClick }: { node: (typeof logicNodes)[number], active: boolean, onClick: () => void }) {
  const Icon = node.icon
  return <button onClick={onClick} className={`relative min-h-[116px] rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card ${active?'border-blue-300 ring-4 ring-blue-50 shadow-card':'border-toss-line'}`}><div className="flex items-center justify-between"><span style={{color:node.color, background:`${node.color}14`}} className="grid h-8 w-8 place-items-center rounded-xl"><Icon size={17}/></span><span className="text-[10px] font-extrabold text-toss-muted">{node.step}</span></div><h3 className="mt-3 text-[13px] font-extrabold tracking-[-0.02em]">{node.title}</h3><p className="mt-1 line-clamp-2 text-[11px] font-medium leading-4 text-toss-muted">{node.plain}</p></button>
}

function SuggestionCard({ doc, selected, onToggle }: { doc: DocSuggestion, selected: boolean, onToggle: () => void }) {
  return <article className={`rounded-2xl border p-4 transition ${selected?'border-blue-300 bg-blue-50/50':'border-toss-line hover:border-blue-200'}`}><div className="flex items-start justify-between gap-2"><div className="flex flex-wrap items-center gap-2"><EvidenceBadge value={doc.evidence}/><span className="text-[10px] font-bold text-toss-muted">{doc.kind}</span></div><button onClick={onToggle} aria-label={selected?'Writing plan에서 제거':'Writing plan에 추가'} className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${selected?'bg-toss-blue text-white':'bg-toss-surface text-toss-muted hover:bg-blue-50 hover:text-toss-blue'}`}>{selected?<Check size={15}/>:<Plus size={15}/>}</button></div><h3 className="mt-3 text-[14px] font-extrabold tracking-[-0.02em]">{doc.title}</h3><p className="mt-2 text-[12px] font-medium leading-5 text-toss-text">{doc.reason}</p><div className="mt-3 flex items-center justify-between border-t border-toss-line/80 pt-3"><span className="flex items-center gap-1 text-[10px] font-bold text-toss-muted"><BookOpen size={12}/>{doc.audience}</span><button onClick={onToggle} className="text-[11px] font-extrabold text-toss-blue">{selected?'선택됨':'plan에 담기'}</button></div></article>
}

function Drawer({ title, subtitle, onClose, children, wide=false }: { title:string, subtitle:string, onClose:()=>void, children:React.ReactNode, wide?:boolean }) {
  return <div className="fixed inset-0 z-[60]"><button className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-label="닫기"/><aside className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl animate-fade-up ${wide?'max-w-[560px]':'max-w-[460px]'}`}><div className="flex items-center justify-between border-b border-toss-line px-6 py-5"><div><h2 className="text-xl font-extrabold tracking-[-0.03em]">{title}</h2><p className="mt-1 text-[12px] font-medium text-toss-muted">{subtitle}</p></div><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-toss-surface text-toss-text hover:bg-toss-line"><PanelRightClose size={19}/></button></div><div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div></aside></div>
}

export default App
