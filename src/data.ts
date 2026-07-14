import type { LucideIcon } from 'lucide-react'
import { BrainCircuit, BookOpenCheck, Cable, CircleGauge, Headphones, MessageSquareMore, ScanSearch } from 'lucide-react'

export type Evidence = 'DOCS' | 'SPEC' | 'CONFIRM'
export type Audience = '모두' | '개발자' | '운영팀' | '마케터·디자이너'

export interface Source {
  title: string
  url: string
  date: string
  note: string
}

export interface DocSuggestion {
  id: string
  title: string
  kind: string
  audience: Audience
  reason: string
  outline: string[]
  evidence: Evidence
}

export interface LogicNode {
  id: string
  step: string
  title: string
  plain: string
  detail: string
  example: string
  icon: LucideIcon
  color: string
  suggestions: DocSuggestion[]
}

export const sources: Source[] = [
  {
    title: 'Delight.ai AI agent platform',
    url: 'https://delight.ai/ai-agent',
    date: '확인: 2026.07.14',
    note: '의도 이해, 문맥 유지, 외부 도구 실행, 다중 채널, 사람 이관',
  },
  {
    title: 'Introducing AMP',
    url: 'https://delight.ai/blog/product/introducing-agent-memory-platform',
    date: '2026.03.31',
    note: '대화 기억과 Business Intent를 결합하는 지능 계층',
  },
  {
    title: 'Delight.ai Builder & Actionbooks',
    url: 'https://delight.ai/builder',
    date: '확인: 2026.07.14',
    note: '자연어 기반 규칙·행동·에스컬레이션과 버전 관리',
  },
  {
    title: 'Introducing Agent Steward',
    url: 'https://delight.ai/blog/product/introducing-agent-steward',
    date: '2026.07.08',
    note: '여러 시스템·채널·승인을 조율하는 복합 이슈 해결 계층',
  },
  {
    title: 'Introducing Trust OS',
    url: 'https://delight.ai/blog/product/introducing-trust-os-for-ai-agents',
    date: '2026.03.16',
    note: '관찰·통제·사람의 감독·규모를 위한 신뢰 기반',
  },
  {
    title: 'Desk',
    url: 'https://delight.ai/desk',
    date: '확인: 2026.07.14',
    note: '승인 게이트나 신뢰도 기준에서 전체 맥락과 함께 사람에게 이관',
  },
]

export const logicNodes: LogicNode[] = [
  {
    id: 'signal', step: '01', title: '고객 신호 받기', plain: '고객이 무엇을 말했고, 어디에서 말했는지 받아요.',
    detail: '웹 채팅·앱·이메일·SMS·음성 등에서 들어온 메시지와 이벤트를 하나의 문제 시작점으로 해석합니다.',
    example: '“배송이 또 늦었어요”라는 웹 채팅과 주문 상태 이벤트가 들어옵니다.', icon: MessageSquareMore, color: '#3182F6',
    suggestions: [{ id:'event-contract', title:'채널별 이벤트 계약서', kind:'API reference', audience:'개발자', reason:'어떤 입력이 언제 들어오고 필드가 무엇인지 알아야 연결이 깨지지 않아요.', outline:['지원 채널과 이벤트','요청 payload','재시도·중복 처리','오류 응답'], evidence:'CONFIRM' }],
  },
  {
    id: 'memory', step: '02', title: '기억과 맥락 불러오기', plain: '이 고객을 처음 보는 사람처럼 대하지 않아요.',
    detail: 'AMP는 CRM의 구조화 데이터와 대화 속 선호·감정·의도 같은 신호를 함께 사용해 살아 있는 고객 맥락을 구성합니다.',
    example: '지난달에도 배송 지연을 겪었고, 빠른 해결을 선호한다는 맥락을 불러옵니다.', icon: BrainCircuit, color: '#8B5CF6',
    suggestions: [{ id:'memory-model', title:'고객 메모리 데이터 모델', kind:'Concept guide', audience:'개발자', reason:'무엇을 기억하고 얼마나 오래 보존하는지 모르면 개인정보·동기화 정책을 설계할 수 없어요.', outline:['메모리의 범위','데이터 출처','갱신·만료 규칙','PII 처리와 삭제'], evidence:'CONFIRM' }],
  },
  {
    id: 'rules', step: '03', title: '목표와 규칙 확인하기', plain: '회사 목표와 “이럴 땐 이렇게” 규칙을 함께 봐요.',
    detail: 'Business Intent가 결과의 방향을 잡고, Actionbook이 응답·행동·승인·에스컬레이션 규칙을 자연어 플레이북으로 제공합니다.',
    example: '이탈 방지 목표를 우선하되, 보상은 정해진 한도 안에서만 제안합니다.', icon: BookOpenCheck, color: '#F59E0B',
    suggestions: [{ id:'actionbook-authoring', title:'Actionbook 작성 가이드', kind:'How-to guide', audience:'운영팀', reason:'자연어 규칙은 쉬워 보여도 우선순위·충돌·예외를 명확히 써야 안정적으로 작동해요.', outline:['좋은 규칙의 형태','우선순위와 충돌','승인 게이트','버전·롤백','테스트 예시'], evidence:'DOCS' }],
  },
  {
    id: 'orchestrate', step: '04', title: '계획하고 도구 쓰기', plain: '답만 하는 게 아니라 해결에 필요한 일을 나눠 실행해요.',
    detail: 'Agent Steward는 API·이메일·음성·Desk 등에서 일하는 하위 에이전트와 사람의 승인을 조율하며 사건을 끝까지 추적합니다.',
    example: '주문 API를 확인하고, 물류사에 문의하고, 환불 승인을 동시에 준비합니다.', icon: Cable, color: '#14B8A6',
    suggestions: [{ id:'tool-contract', title:'도구 호출과 실패 처리', kind:'Integration guide', audience:'개발자', reason:'도구의 권한·입출력·타임아웃·재시도·부분 실패가 가장 큰 구현 리스크예요.', outline:['도구 권한 범위','입출력 스키마','타임아웃과 재시도','멱등성','부분 실패와 보상 동작'], evidence:'CONFIRM' }],
  },
  {
    id: 'channel', step: '05', title: '맞는 채널로 행동하기', plain: '고객이 이동해도 같은 대화를 이어가요.',
    detail: 'Omnipresent 계층은 채팅에서 시작한 문제를 SMS·이메일·음성으로 이어가면서 같은 기억과 사건 상태를 유지합니다.',
    example: '채팅 후 배송 확정은 SMS로, 상세 영수증은 이메일로 보냅니다.', icon: ScanSearch, color: '#EC4899',
    suggestions: [{ id:'channel-behavior', title:'채널 전환 행동 명세', kind:'UX behavior spec', audience:'마케터·디자이너', reason:'채널이 바뀔 때 톤·동의·알림 빈도·이어지는 상태를 정의해야 경험이 자연스러워요.', outline:['채널 선택 기준','사용자 동의','톤과 길이','전환 상태 문구','접근성'], evidence:'CONFIRM' }],
  },
  {
    id: 'trust', step: '06', title: '검사하고 기록하기', plain: 'AI가 왜 그렇게 행동했는지 보고, 위험하면 멈춰요.',
    detail: 'Trust OS는 테스트·추적·버전 관리·가드레일·사람의 평가를 통해 배포 전후의 행동을 관찰하고 통제합니다.',
    example: '보상 한도를 넘는 제안은 차단하고, 어떤 규칙과 데이터를 썼는지 기록합니다.', icon: CircleGauge, color: '#64748B',
    suggestions: [{ id:'evaluation-playbook', title:'AI 평가·릴리스 플레이북', kind:'Operations guide', audience:'운영팀', reason:'무엇이 좋은 응답인지, 실패 시 누가 멈추고 되돌리는지 공통 기준이 필요해요.', outline:['성공 지표','테스트 세트','가드레일','배포 승인','모니터링·롤백'], evidence:'DOCS' }],
  },
  {
    id: 'handoff', step: '07', title: '필요하면 사람에게 넘기기', plain: 'AI가 멈춘 이유와 지금까지 한 일을 사람에게 함께 줘요.',
    detail: '신뢰도 기준이나 승인 게이트에 도달하면 Desk 또는 연결된 지원 도구로 전체 대화·조회 시스템·중단 이유를 전달합니다.',
    example: '담당자는 대화를 다시 읽지 않고 준비된 환불 근거를 검토해 승인합니다.', icon: Headphones, color: '#EF4444',
    suggestions: [{ id:'handoff-contract', title:'AI → Human 이관 계약서', kind:'Workflow reference', audience:'모두', reason:'언제 이관하고 어떤 맥락을 넘기며 성공을 어떻게 확인하는지가 고객 경험을 좌우해요.', outline:['이관 조건','전달 필드','티켓 상태','담당자 화면','실패·복구','완료 이벤트'], evidence:'CONFIRM' }],
  },
]

export const allSuggestions = logicNodes.flatMap((node) => node.suggestions)
