import { useState } from 'react'
import { LoaderCircle, Lock, Sparkles } from 'lucide-react'
import { loginWithPassword } from '../lib/api'

interface LoginGateProps {
  onSuccess: () => void
}

export function LoginGate({ onSuccess }: LoginGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!password || loading) return
    setLoading(true)
    setError('')
    try {
      await loginWithPassword(password)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8] px-4 text-toss-dark">
      <div className="w-full max-w-md rounded-2xl border border-toss-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-toss-blue text-white">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          <div>
            <h1 className="text-[18px] font-extrabold tracking-[-0.03em]">
              nergy<span className="text-toss-blue">.ai</span>
            </h1>
            <p className="text-[12px] font-medium text-toss-muted">팀 공용 워크스페이스</p>
          </div>
        </div>

        <p className="mt-5 text-[14px] font-medium leading-6 text-toss-text">
          팀원과 같은 프로젝트·문서 상태를 공유하려면 공용 비밀번호로 입장하세요.
        </p>

        <label className="mt-5 flex items-center gap-3 rounded-xl border border-toss-line bg-toss-surface px-3 py-3">
          <Lock size={16} className="text-toss-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
            placeholder="팀 공용 비밀번호"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none"
            autoFocus
            autoComplete="current-password"
          />
        </label>

        <button
          onClick={() => void submit()}
          disabled={!password.trim() || loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-toss-blue py-3.5 text-[14px] font-bold text-white hover:bg-[#1B64DA] disabled:opacity-50"
        >
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
          입장하기
        </button>

        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">{error}</p>
        )}
      </div>
    </div>
  )
}
