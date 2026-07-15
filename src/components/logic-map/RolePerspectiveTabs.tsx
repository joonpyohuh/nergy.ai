import { useState } from 'react'
import { CircleHelp, ListChecks } from 'lucide-react'
import type { NodeRoleExplanations, StakeholderRole } from '../../data'
import { ROLE_LABEL } from '../../data'

const ROLE_TABS: Array<Exclude<StakeholderRole, 'overview'>> = ['marketer', 'designer', 'developer', 'operator']

interface RolePerspectiveTabsProps {
  explanations: NodeRoleExplanations
  /** 워크스페이스의 직군 관점과 초기 탭을 맞춘다 */
  initialRole?: StakeholderRole
}

export function RolePerspectiveTabs({ explanations, initialRole }: RolePerspectiveTabsProps) {
  const [role, setRole] = useState<Exclude<StakeholderRole, 'overview'>>(
    initialRole && initialRole !== 'overview' ? initialRole : 'marketer',
  )
  const current = explanations[role]

  return (
    <div>
      <div role="tablist" aria-label="직군별 관점" className="flex gap-1 rounded-xl bg-toss-surface p-1">
        {ROLE_TABS.map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={role === r}
            onClick={() => setRole(r)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
              role === r ? 'bg-white text-toss-blue shadow-sm' : 'text-toss-muted hover:text-toss-text'
            }`}
          >
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={`${ROLE_LABEL[role]} 관점`} className="mt-3 space-y-3">
        <p className="text-[12.5px] font-semibold leading-5 text-toss-text">{current.summary}</p>
        <div className="rounded-xl bg-toss-surface p-3">
          <p className="text-[10px] font-extrabold text-toss-muted">왜 중요한가</p>
          <p className="mt-1 text-[12px] font-medium leading-5 text-toss-text">{current.whyItMatters}</p>
        </div>
        {current.keyQuestions.length > 0 && (
          <div>
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-toss-muted">
              <CircleHelp size={11} /> 확인해야 하는 질문
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {current.keyQuestions.map((q) => (
                <li key={q} className="rounded-lg border border-toss-line px-2.5 py-1.5 text-[12px] font-medium leading-4 text-toss-text">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
        {current.expectedOutputs && current.expectedOutputs.length > 0 && (
          <div>
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-toss-muted">
              <ListChecks size={11} /> 기대 산출물
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {current.expectedOutputs.map((o) => (
                <span key={o} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                  {o}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
