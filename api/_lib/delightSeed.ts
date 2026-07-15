import type { StoredProject } from './projectTypes.js'

export const DELIGHT_SEED = {
  "id": "proj-delight",
  "name": "Delight.ai",
  "url": "https://delight.ai",
  "description": "Enterprise AI customer experience · 공개 자료 기반 분석",
  "status": "ready",
  "analyzedAt": "2026-07-14T09:00:00.000Z",
  "sourceCount": 6,
  "nodes": [
    {
      "id": "signal",
      "step": "01",
      "title": "고객 신호 받기",
      "plain": "고객이 무엇을 말했고, 어디에서 말했는지 받아요.",
      "detail": "웹 채팅·앱·이메일·SMS·음성 등에서 들어온 메시지와 이벤트를 하나의 문제 시작점으로 해석합니다.",
      "example": "“배송이 또 늦었어요”라는 웹 채팅과 주문 상태 이벤트가 들어옵니다.",
      "color": "#3182F6",
      "stage": "입력",
      "inputs": [
        "채널별 고객 메시지",
        "주문·계정 이벤트",
        "채널 메타데이터(채널, 시각, 기기)"
      ],
      "outputs": [
        "정규화된 고객 신호",
        "고객·세션 식별자",
        "문제 시작점 이벤트"
      ],
      "evidence": "DOCS",
      "roleExplanations": {
        "marketer": {
          "summary": "모든 채널의 고객 목소리가 한 지점으로 모이는 입구예요.",
          "whyItMatters": "캠페인·채널별 반응을 같은 기준으로 비교할 수 있어 유입 품질과 문의 유형을 분석할 수 있어요.",
          "keyQuestions": [
            "채널별 문의 유형 리포트는 어디서 보나요?",
            "캠페인 태그나 UTM이 신호에 함께 붙나요?"
          ],
          "expectedOutputs": [
            "채널별 문의량 지표",
            "캠페인 연계 문의 태그"
          ]
        },
        "designer": {
          "summary": "고객이 어떤 채널에서 말을 걸어도 같은 대화로 인식돼요.",
          "whyItMatters": "첫 응답 대기, 수신 확인 같은 초기 상태를 채널별로 다르게 설계해야 해요.",
          "keyQuestions": [
            "수신 확인·입력 중 상태를 어떻게 표현하나요?",
            "채널별 입력 제약(길이·첨부)은 무엇인가요?"
          ]
        },
        "developer": {
          "summary": "채널별 이벤트를 하나의 신호 스키마로 정규화하는 단계예요.",
          "whyItMatters": "payload 필드 정의, 중복 이벤트, 재시도 규칙이 전체 연동의 안정성을 좌우해요.",
          "keyQuestions": [
            "이벤트 스키마와 필수 필드는 무엇인가요?",
            "중복 수신과 순서 뒤바뀜은 어떻게 처리하나요?"
          ],
          "expectedOutputs": [
            "채널 이벤트 계약",
            "신호 정규화 스키마"
          ]
        },
        "operator": {
          "summary": "문의가 유실 없이 접수되는 첫 관문이에요.",
          "whyItMatters": "누락된 신호는 곧바로 CS 사고로 이어지므로 수신 모니터링 기준이 필요해요.",
          "keyQuestions": [
            "수신 실패 알림은 누구에게 전달되나요?",
            "피크 시간대 처리 한도와 대기 정책은요?"
          ]
        }
      }
    },
    {
      "id": "memory",
      "step": "02",
      "title": "기억과 맥락 불러오기",
      "plain": "이 고객을 처음 보는 사람처럼 대하지 않아요.",
      "detail": "AMP는 CRM의 구조화 데이터와 대화 속 선호·감정·의도 같은 신호를 함께 사용해 살아 있는 고객 맥락을 구성합니다.",
      "example": "지난달에도 배송 지연을 겪었고, 빠른 해결을 선호한다는 맥락을 불러옵니다.",
      "color": "#8B5CF6",
      "stage": "이해",
      "inputs": [
        "고객·세션 식별자",
        "현재 메시지",
        "CRM 구조화 데이터"
      ],
      "outputs": [
        "고객 맥락 요약",
        "선호·감정·과거 이력 신호"
      ],
      "evidence": "DOCS",
      "roleExplanations": {
        "marketer": {
          "summary": "고객 개인화의 원천이 되는 기억 계층이에요.",
          "whyItMatters": "반복 문제·선호를 알면 세그먼트 정의와 개인화 캠페인의 근거가 생겨요.",
          "keyQuestions": [
            "어떤 고객 속성이 세그먼트로 활용 가능한가요?",
            "기억 데이터가 마케팅 도구와 동기화되나요?"
          ]
        },
        "designer": {
          "summary": "“저번에 말씀하신 그 문제죠?”가 가능해지는 단계예요.",
          "whyItMatters": "맥락 조회 중 로딩 상태와 조회 실패 시의 대화 흐름을 설계해야 해요.",
          "keyQuestions": [
            "맥락 로딩 중 어떤 상태를 보여주나요?",
            "기억이 없는 신규 고객의 첫 경험은 어떻게 다른가요?"
          ]
        },
        "developer": {
          "summary": "고객 식별 매칭과 메모리 조회 API가 동작하는 단계예요.",
          "whyItMatters": "식별 실패, 조회 timeout, fallback 동작이 응답 품질과 지연 시간을 결정해요.",
          "keyQuestions": [
            "고객 식별 매칭 규칙은 무엇인가요?",
            "조회 실패 시 fallback 동작은 어떻게 정의돼 있나요?"
          ],
          "expectedOutputs": [
            "메모리 데이터 모델 문서",
            "조회 API 명세"
          ]
        },
        "operator": {
          "summary": "무엇을 기억하고 얼마나 보존하는지 정책이 걸리는 지점이에요.",
          "whyItMatters": "개인정보 보존·삭제 정책과 감사 대응이 이 단계 데이터에 달려 있어요.",
          "keyQuestions": [
            "PII 보존 기간과 삭제 절차는요?",
            "고객 요청 시 기억 삭제는 누가 수행하나요?"
          ]
        }
      }
    },
    {
      "id": "rules",
      "step": "03",
      "title": "목표와 규칙 확인하기",
      "plain": "회사 목표와 “이럴 땐 이렇게” 규칙을 함께 봐요.",
      "detail": "Business Intent가 결과의 방향을 잡고, Actionbook이 응답·행동·승인·에스컬레이션 규칙을 자연어 플레이북으로 제공합니다.",
      "example": "이탈 방지 목표를 우선하되, 보상은 정해진 한도 안에서만 제안합니다.",
      "color": "#F59E0B",
      "stage": "판단",
      "inputs": [
        "고객 맥락 요약",
        "Business Intent 목표",
        "Actionbook 규칙"
      ],
      "outputs": [
        "적용할 정책·보상 한도",
        "행동 방향 결정"
      ],
      "evidence": "DOCS",
      "roleExplanations": {
        "marketer": {
          "summary": "비즈니스 목표가 실제 고객 응대에 반영되는 지점이에요.",
          "whyItMatters": "이탈 방지·업셀 같은 목표가 어떤 우선순위로 적용되는지에 따라 전환 지표가 달라져요.",
          "keyQuestions": [
            "현재 설정된 비즈니스 목표의 우선순위는요?",
            "보상 한도가 캠페인 예산과 연동되나요?"
          ]
        },
        "designer": {
          "summary": "고객에게 어떤 제안이 “가능한지”가 결정되는 단계예요.",
          "whyItMatters": "규칙 때문에 거절해야 하는 상황의 문구와 대안 제시 방식을 설계해야 해요.",
          "keyQuestions": [
            "정책상 불가능한 요청은 어떤 톤으로 안내하나요?",
            "한도 초과 시 대안 제시 패턴이 있나요?"
          ]
        },
        "developer": {
          "summary": "자연어 규칙이 우선순위·충돌 해석을 거쳐 적용되는 단계예요.",
          "whyItMatters": "규칙 버전 관리와 충돌 해석 순서를 모르면 동작을 재현·디버깅할 수 없어요.",
          "keyQuestions": [
            "규칙 충돌 시 우선순위 해석 순서는요?",
            "규칙 버전과 응답 로그가 연결되나요?"
          ]
        },
        "operator": {
          "summary": "Actionbook 규칙을 작성·배포·롤백하는 운영의 중심이에요.",
          "whyItMatters": "잘못 쓴 규칙 하나가 전체 응대 품질을 바꾸므로 작성 가이드와 승인 절차가 필요해요.",
          "keyQuestions": [
            "규칙 변경은 누가 승인하고 언제 배포되나요?",
            "문제 발생 시 롤백 절차는요?"
          ],
          "expectedOutputs": [
            "Actionbook 작성 가이드",
            "규칙 배포·롤백 절차"
          ]
        }
      }
    },
    {
      "id": "orchestrate",
      "step": "04",
      "title": "계획하고 도구 쓰기",
      "plain": "답만 하는 게 아니라 해결에 필요한 일을 나눠 실행해요.",
      "detail": "Agent Steward는 API·이메일·음성·Desk 등에서 일하는 하위 에이전트와 사람의 승인을 조율하며 사건을 끝까지 추적합니다.",
      "example": "주문 API를 확인하고, 물류사에 문의하고, 환불 승인을 동시에 준비합니다.",
      "color": "#14B8A6",
      "stage": "실행",
      "inputs": [
        "행동 방향 결정",
        "사용 가능한 도구·API 목록",
        "승인 정책"
      ],
      "outputs": [
        "실행 계획",
        "도구 호출 결과",
        "승인 요청"
      ],
      "evidence": "DOCS",
      "roleExplanations": {
        "marketer": {
          "summary": "단순 응답이 아니라 실제 문제 해결이 일어나는 단계예요.",
          "whyItMatters": "해결까지 걸리는 시간과 완결률이 고객 만족과 재구매에 직접 영향을 줘요.",
          "keyQuestions": [
            "자동 해결률과 평균 해결 시간은 어디서 보나요?",
            "해결 완료가 NPS·재구매와 연결돼 측정되나요?"
          ]
        },
        "designer": {
          "summary": "고객이 “처리 중” 상태를 기다리는 구간이에요.",
          "whyItMatters": "여러 작업이 병렬로 진행될 때 진행 상황을 어떻게 보여줄지 설계해야 해요.",
          "keyQuestions": [
            "긴 작업의 진행 상태를 어떻게 표현하나요?",
            "부분 실패 시 고객에게 어떤 화면을 보여주나요?"
          ]
        },
        "developer": {
          "summary": "도구 권한, 입출력 스키마, 실패 처리가 집중되는 단계예요.",
          "whyItMatters": "timeout·retry·멱등성·부분 실패 보상이 가장 큰 구현 리스크예요.",
          "keyQuestions": [
            "도구 호출의 timeout과 재시도 정책은요?",
            "부분 실패 시 보상 트랜잭션은 어떻게 정의되나요?"
          ],
          "expectedOutputs": [
            "도구 통합 가이드",
            "실패 처리 명세"
          ]
        },
        "operator": {
          "summary": "AI가 실제 시스템을 조작하는 권한이 걸린 단계예요.",
          "whyItMatters": "어떤 도구를 어떤 한도로 쓸 수 있는지 권한 정책과 승인 게이트를 관리해야 해요.",
          "keyQuestions": [
            "도구별 권한 범위와 한도는 누가 관리하나요?",
            "승인이 필요한 작업의 기준은요?"
          ]
        }
      }
    },
    {
      "id": "channel",
      "step": "05",
      "title": "맞는 채널로 행동하기",
      "plain": "고객이 이동해도 같은 대화를 이어가요.",
      "detail": "Omnipresent 계층은 채팅에서 시작한 문제를 SMS·이메일·음성으로 이어가면서 같은 기억과 사건 상태를 유지합니다.",
      "example": "채팅 후 배송 확정은 SMS로, 상세 영수증은 이메일로 보냅니다.",
      "color": "#EC4899",
      "stage": "전달",
      "inputs": [
        "실행 계획",
        "고객 채널 선호·상태"
      ],
      "outputs": [
        "채널별 응답·알림",
        "사건 상태 업데이트"
      ],
      "evidence": "DOCS",
      "roleExplanations": {
        "marketer": {
          "summary": "고객 접점별 메시지 톤과 빈도가 결정되는 단계예요.",
          "whyItMatters": "채널 전환이 자연스러우면 이탈 없이 전환 여정을 이어갈 수 있어요.",
          "keyQuestions": [
            "채널별 메시지 톤 가이드가 있나요?",
            "알림 빈도 제한과 수신 동의는 어떻게 관리되나요?"
          ]
        },
        "designer": {
          "summary": "같은 대화가 여러 채널에서 이어지는 경험을 설계하는 단계예요.",
          "whyItMatters": "채널 전환 시 상태 문구, 동의 요청, 이어지는 맥락 표시가 경험 품질을 좌우해요.",
          "keyQuestions": [
            "채널 전환 시 어떤 안내 문구를 보여주나요?",
            "채널별 메시지 포맷 제약은 무엇인가요?"
          ],
          "expectedOutputs": [
            "채널 전환 UX 명세"
          ]
        },
        "developer": {
          "summary": "채널별 발송 API와 사건 상태 동기화가 동작하는 단계예요.",
          "whyItMatters": "채널 간 상태 불일치가 생기면 고객이 같은 말을 반복하게 돼요.",
          "keyQuestions": [
            "채널 간 사건 상태는 어떻게 동기화되나요?",
            "발송 실패 시 재시도와 대체 채널 규칙은요?"
          ]
        },
        "operator": {
          "summary": "채널 정책(발송 시간·빈도·수신 동의)이 적용되는 단계예요.",
          "whyItMatters": "규제(수신 동의, 야간 발송 제한)를 위반하면 법적 리스크가 생겨요.",
          "keyQuestions": [
            "채널별 발송 제한 정책은 무엇인가요?",
            "수신 거부 처리 SLA는요?"
          ]
        }
      }
    },
    {
      "id": "trust",
      "step": "06",
      "title": "검사하고 기록하기",
      "plain": "AI가 왜 그렇게 행동했는지 보고, 위험하면 멈춰요.",
      "detail": "Trust OS는 테스트·추적·버전 관리·가드레일·사람의 평가를 통해 배포 전후의 행동을 관찰하고 통제합니다.",
      "example": "보상 한도를 넘는 제안은 차단하고, 어떤 규칙과 데이터를 썼는지 기록합니다.",
      "color": "#64748B",
      "stage": "통제",
      "inputs": [
        "실행 계획·행동 로그",
        "가드레일 규칙",
        "평가 기준"
      ],
      "outputs": [
        "검사 결과(통과/차단)",
        "행동 근거 기록",
        "이관 신호"
      ],
      "evidence": "DOCS",
      "roleExplanations": {
        "marketer": {
          "summary": "브랜드를 지키는 안전장치가 동작하는 단계예요.",
          "whyItMatters": "잘못된 보상 제안이나 부적절한 응답이 밖으로 나가기 전에 차단돼요.",
          "keyQuestions": [
            "브랜드 톤 위반은 어떤 기준으로 감지하나요?",
            "차단된 응답 사례를 마케팅이 볼 수 있나요?"
          ]
        },
        "designer": {
          "summary": "차단·보류가 고객에게 어떻게 보일지 설계해야 하는 단계예요.",
          "whyItMatters": "검사로 응답이 지연되거나 바뀔 때 고객이 느끼는 어색함을 줄여야 해요.",
          "keyQuestions": [
            "검사로 인한 지연 시 어떤 상태를 보여주나요?",
            "차단 시 고객에게는 어떤 문구가 나가나요?"
          ]
        },
        "developer": {
          "summary": "가드레일 평가와 행동 추적 로그가 쌓이는 단계예요.",
          "whyItMatters": "디버깅과 사고 분석은 이 단계의 추적 데이터 품질에 달려 있어요.",
          "keyQuestions": [
            "행동 로그에는 어떤 필드가 기록되나요?",
            "가드레일 평가가 응답 지연에 주는 영향은요?"
          ]
        },
        "operator": {
          "summary": "평가 기준·가드레일·릴리스 승인을 운영하는 단계예요.",
          "whyItMatters": "무엇이 좋은 응답인지 기준을 정하고, 실패 시 멈추고 되돌리는 주체가 운영팀이에요.",
          "keyQuestions": [
            "배포 전 평가 세트는 누가 관리하나요?",
            "가드레일 위반 알림의 대응 절차는요?"
          ],
          "expectedOutputs": [
            "평가·릴리스 플레이북",
            "가드레일 정책 문서"
          ]
        }
      }
    },
    {
      "id": "handoff",
      "step": "07",
      "title": "필요하면 사람에게 넘기기",
      "plain": "AI가 멈춘 이유와 지금까지 한 일을 사람에게 함께 줘요.",
      "detail": "신뢰도 기준이나 승인 게이트에 도달하면 Desk 또는 연결된 지원 도구로 전체 대화·조회 시스템·중단 이유를 전달합니다.",
      "example": "담당자는 대화를 다시 읽지 않고 준비된 환불 근거를 검토해 승인합니다.",
      "color": "#EF4444",
      "stage": "이관",
      "inputs": [
        "중단 이유·신뢰도 점수",
        "전체 대화·행동 맥락"
      ],
      "outputs": [
        "담당자 티켓",
        "사람의 결정 결과"
      ],
      "evidence": "DOCS",
      "roleExplanations": {
        "marketer": {
          "summary": "민감한 고객이 사람의 손길을 받는 순간이에요.",
          "whyItMatters": "VIP·이탈 위험 고객의 이관 경험이 브랜드 신뢰에 큰 영향을 줘요.",
          "keyQuestions": [
            "VIP 고객은 이관 우선순위가 다른가요?",
            "이관 후 고객 만족도는 따로 측정되나요?"
          ]
        },
        "designer": {
          "summary": "AI에서 사람으로 넘어가는 전환 경험을 설계하는 단계예요.",
          "whyItMatters": "“상담원에게 연결합니다” 순간의 대기·기대 설정이 경험을 좌우해요.",
          "keyQuestions": [
            "이관 대기 중 고객에게 어떤 상태를 보여주나요?",
            "사람이 이어받았음을 어떻게 표시하나요?"
          ]
        },
        "developer": {
          "summary": "티켓 생성과 맥락 전달 페이로드가 정의되는 단계예요.",
          "whyItMatters": "전달 필드가 부족하면 담당자가 대화를 처음부터 다시 읽어야 해요.",
          "keyQuestions": [
            "이관 페이로드의 필수 필드는요?",
            "외부 지원 도구 연동 시 상태 동기화는요?"
          ],
          "expectedOutputs": [
            "이관 계약서(payload 명세)"
          ]
        },
        "operator": {
          "summary": "이관 조건과 담당자 배정 규칙을 운영하는 단계예요.",
          "whyItMatters": "이관 기준이 느슨하면 상담 폭주, 엄격하면 미해결 누적이 생겨요.",
          "keyQuestions": [
            "이관 조건(신뢰도·금액·감정)은 무엇인가요?",
            "이관 티켓의 처리 SLA는요?"
          ]
        }
      }
    }
  ],
  "edges": [
    {
      "id": "signal-memory",
      "source": "signal",
      "target": "memory",
      "label": "고객 메시지 전달",
      "type": "data",
      "summary": "새 메시지만 보면 고객의 반복 문제와 선호를 알 수 없어서, 정규화된 신호를 기억 계층으로 넘겨 이전 기록을 조회합니다.",
      "trigger": "새 고객 메시지 또는 이벤트가 정규화를 통과했을 때",
      "transferredData": [
        "고객 ID",
        "채널",
        "현재 메시지",
        "세션 ID",
        "이벤트 시각"
      ],
      "successCondition": "고객 식별이 완료되고 맥락 조회 요청이 접수된다.",
      "risks": [
        "고객 식별 실패로 신규 고객으로 오인",
        "식별자 매칭 지연으로 첫 응답 지연"
      ],
      "evidence": "DOCS",
      "documentationOpportunities": [
        "Customer context retrieval",
        "Identity matching",
        "Memory fallback behavior"
      ]
    },
    {
      "id": "memory-rules",
      "source": "memory",
      "target": "rules",
      "label": "고객 맥락 전달",
      "type": "data",
      "summary": "어떤 규칙과 목표를 적용할지 판단하려면 이 고객의 이력·선호·감정 상태가 먼저 필요합니다.",
      "trigger": "고객 맥락 요약 구성이 완료됐을 때",
      "transferredData": [
        "고객 맥락 요약",
        "과거 이슈 이력",
        "선호·감정 신호",
        "VIP·등급 정보"
      ],
      "successCondition": "맥락이 반영된 정책 판단이 시작된다.",
      "risks": [
        "오래된 맥락으로 잘못된 정책 적용",
        "맥락 조회 실패 시 기본 정책만 적용"
      ],
      "evidence": "DOCS",
      "documentationOpportunities": [
        "Context-to-policy mapping",
        "Stale memory handling"
      ]
    },
    {
      "id": "rules-orchestrate",
      "source": "rules",
      "target": "orchestrate",
      "label": "정책과 목표 적용",
      "type": "decision",
      "summary": "판단된 행동 방향과 허용 한도가 실행 계획의 제약 조건으로 전달됩니다.",
      "trigger": "Business Intent와 Actionbook 규칙 평가가 끝났을 때",
      "transferredData": [
        "행동 방향 결정",
        "보상·권한 한도",
        "적용된 규칙 버전",
        "승인 필요 여부"
      ],
      "successCondition": "한도와 규칙을 준수하는 실행 계획이 생성된다.",
      "risks": [
        "규칙 충돌 시 의도와 다른 계획 생성",
        "규칙 버전 불일치로 재현 불가"
      ],
      "evidence": "DOCS",
      "documentationOpportunities": [
        "Actionbook 작성 가이드",
        "Rule precedence reference"
      ]
    },
    {
      "id": "orchestrate-channel",
      "source": "orchestrate",
      "target": "channel",
      "label": "실행 계획 전달",
      "type": "control",
      "summary": "계획된 응답과 행동을 고객이 있는 채널에 맞는 형태로 실행하도록 지시합니다.",
      "trigger": "실행 계획의 채널 발송 단계에 도달했을 때",
      "transferredData": [
        "응답 콘텐츠",
        "대상 채널",
        "발송 우선순위",
        "사건 상태"
      ],
      "successCondition": "고객 채널로 응답이 발송되고 사건 상태가 갱신된다.",
      "risks": [
        "채널 포맷 제약으로 콘텐츠 누락",
        "발송 실패 시 사건 상태 불일치"
      ],
      "evidence": "DOCS",
      "documentationOpportunities": [
        "채널 전환 행동 명세",
        "Delivery failure handling"
      ]
    },
    {
      "id": "orchestrate-trust",
      "source": "orchestrate",
      "target": "trust",
      "label": "위험 행동 검사 요청",
      "type": "decision",
      "summary": "보상 제안이나 시스템 조작 같은 민감한 행동은 실행 전에 가드레일 검사를 거칩니다. 검사가 동기인지 비동기인지는 내부 확인이 필요합니다.",
      "trigger": "민감 행동(보상, 환불, 계정 변경)이 계획에 포함됐을 때",
      "transferredData": [
        "계획된 행동 내역",
        "금액·한도 정보",
        "사용한 규칙·데이터 근거"
      ],
      "successCondition": "검사 결과(통과/차단/보류)가 실행 전에 반환된다.",
      "risks": [
        "검사 지연으로 응답 시간 증가",
        "검사 우회 경로 존재 가능성"
      ],
      "evidence": "CONFIRM",
      "documentationOpportunities": [
        "Guardrail evaluation spec",
        "Sensitive action catalog"
      ]
    },
    {
      "id": "trust-channel",
      "source": "trust",
      "target": "channel",
      "label": "검사 통과 후 실행 승인",
      "type": "control",
      "summary": "가드레일을 통과한 행동만 실제 채널 실행으로 넘어갑니다. 차단 시 대체 응답이 전달됩니다.",
      "trigger": "가드레일 검사가 통과 판정을 반환했을 때",
      "transferredData": [
        "승인된 행동",
        "검사 통과 기록",
        "대체 응답(차단 시)"
      ],
      "successCondition": "승인된 행동만 고객에게 실행된다.",
      "risks": [
        "차단 시 고객 응답 지연",
        "대체 응답 품질 저하"
      ],
      "evidence": "CONFIRM",
      "documentationOpportunities": [
        "Blocked action UX copy",
        "Approval latency SLA"
      ]
    },
    {
      "id": "trust-handoff",
      "source": "trust",
      "target": "handoff",
      "label": "사람에게 전체 맥락 전달",
      "type": "handoff",
      "summary": "신뢰도 기준 미달이나 승인 게이트에 걸리면 지금까지의 대화·행동·중단 이유를 사람에게 넘깁니다.",
      "trigger": "신뢰도 점수가 기준 미달이거나 승인 게이트에 도달했을 때",
      "transferredData": [
        "전체 대화 기록",
        "실행된 행동과 결과",
        "중단 이유",
        "준비된 결정 근거"
      ],
      "successCondition": "담당자가 대화를 다시 읽지 않고 결정할 수 있는 티켓이 생성된다.",
      "risks": [
        "맥락 필드 누락으로 담당자 재조사 필요",
        "이관 폭주 시 대기 시간 증가"
      ],
      "evidence": "DOCS",
      "documentationOpportunities": [
        "AI → Human 이관 계약서",
        "Escalation criteria reference"
      ]
    },
    {
      "id": "channel-signal",
      "source": "channel",
      "target": "signal",
      "label": "고객 반응 재수집",
      "type": "feedback",
      "summary": "발송된 응답에 대한 고객의 답장이나 후속 행동이 다시 신호로 들어와 대화가 이어집니다. 제품이 일방향 파이프라인이 아니라 순환 구조임을 보여줍니다.",
      "trigger": "고객이 응답에 답하거나 다른 채널에서 대화를 이어갈 때",
      "transferredData": [
        "고객 후속 메시지",
        "기존 사건 ID",
        "채널 전환 정보"
      ],
      "successCondition": "후속 메시지가 새 문의가 아니라 같은 사건으로 연결된다.",
      "risks": [
        "사건 연결 실패로 대화 맥락 초기화",
        "채널 전환 시 중복 사건 생성"
      ],
      "evidence": "DOCS",
      "documentationOpportunities": [
        "Session continuity rules",
        "Cross-channel case linking"
      ]
    },
    {
      "id": "handoff-trust",
      "source": "handoff",
      "target": "trust",
      "label": "사람 결정 결과 기록",
      "type": "feedback",
      "summary": "사람이 내린 승인·거절 결정이 다시 기록·평가 계층으로 들어가 AI의 다음 판단 기준을 개선합니다. 구체적인 학습 반영 방식은 내부 확인이 필요합니다.",
      "trigger": "담당자가 이관된 티켓을 처리 완료했을 때",
      "transferredData": [
        "사람의 결정(승인/거절/수정)",
        "결정 사유",
        "처리 시간"
      ],
      "successCondition": "사람의 결정이 행동 기록과 평가 데이터에 반영된다.",
      "risks": [
        "결정 사유 미입력으로 개선 근거 부족",
        "피드백 반영 지연"
      ],
      "evidence": "CONFIRM",
      "documentationOpportunities": [
        "Human decision feedback loop",
        "Reviewer guidelines"
      ]
    }
  ],
  "docs": [
    {
      "id": "event-contract",
      "title": "채널별 이벤트 계약서",
      "kind": "API reference",
      "audience": "개발자",
      "reason": "어떤 입력이 언제 들어오고 필드가 무엇인지 알아야 연결이 깨지지 않아요.",
      "outline": [
        "지원 채널과 이벤트",
        "요청 payload",
        "재시도·중복 처리",
        "오류 응답"
      ],
      "evidence": "CONFIRM",
      "nodeId": "signal",
      "status": "planned",
      "notes": "플랫폼 팀과 필드명 합의 필요.",
      "assignee": "나",
      "updatedAt": "2026-07-14T09:00:00.000Z"
    },
    {
      "id": "memory-model",
      "title": "고객 메모리 데이터 모델",
      "kind": "Concept guide",
      "audience": "개발자",
      "reason": "무엇을 기억하고 얼마나 오래 보존하는지 모르면 개인정보·동기화 정책을 설계할 수 없어요.",
      "outline": [
        "메모리의 범위",
        "데이터 출처",
        "갱신·만료 규칙",
        "PII 처리와 삭제"
      ],
      "evidence": "CONFIRM",
      "nodeId": "memory",
      "status": "backlog",
      "notes": "",
      "assignee": "",
      "updatedAt": "2026-07-14T09:00:00.000Z"
    },
    {
      "id": "actionbook-authoring",
      "title": "Actionbook 작성 가이드",
      "kind": "How-to guide",
      "audience": "운영팀",
      "reason": "자연어 규칙은 쉬워 보여도 우선순위·충돌·예외를 명확히 써야 안정적으로 작동해요.",
      "outline": [
        "좋은 규칙의 형태",
        "우선순위와 충돌",
        "승인 게이트",
        "버전·롤백",
        "테스트 예시"
      ],
      "evidence": "DOCS",
      "nodeId": "rules",
      "status": "drafting",
      "notes": "운영팀 온보딩용으로 먼저 초안 작성 중.",
      "assignee": "나",
      "updatedAt": "2026-07-14T09:00:00.000Z"
    },
    {
      "id": "tool-contract",
      "title": "도구 호출과 실패 처리",
      "kind": "Integration guide",
      "audience": "개발자",
      "reason": "도구의 권한·입출력·타임아웃·재시도·부분 실패가 가장 큰 구현 리스크예요.",
      "outline": [
        "도구 권한 범위",
        "입출력 스키마",
        "타임아웃과 재시도",
        "멱등성",
        "부분 실패와 보상 동작"
      ],
      "evidence": "CONFIRM",
      "nodeId": "orchestrate",
      "status": "backlog",
      "notes": "",
      "assignee": "",
      "updatedAt": "2026-07-14T09:00:00.000Z"
    },
    {
      "id": "channel-behavior",
      "title": "채널 전환 행동 명세",
      "kind": "UX behavior spec",
      "audience": "마케터·디자이너",
      "reason": "채널이 바뀔 때 톤·동의·알림 빈도·이어지는 상태를 정의해야 경험이 자연스러워요.",
      "outline": [
        "채널 선택 기준",
        "사용자 동의",
        "톤과 길이",
        "전환 상태 문구",
        "접근성"
      ],
      "evidence": "CONFIRM",
      "nodeId": "channel",
      "status": "backlog",
      "notes": "",
      "assignee": "",
      "updatedAt": "2026-07-14T09:00:00.000Z"
    },
    {
      "id": "evaluation-playbook",
      "title": "AI 평가·릴리스 플레이북",
      "kind": "Operations guide",
      "audience": "운영팀",
      "reason": "무엇이 좋은 응답인지, 실패 시 누가 멈추고 되돌리는지 공통 기준이 필요해요.",
      "outline": [
        "성공 지표",
        "테스트 세트",
        "가드레일",
        "배포 승인",
        "모니터링·롤백"
      ],
      "evidence": "DOCS",
      "nodeId": "trust",
      "status": "review",
      "notes": "신뢰성 팀 리뷰 요청함.",
      "assignee": "나",
      "updatedAt": "2026-07-14T09:00:00.000Z"
    },
    {
      "id": "handoff-contract",
      "title": "AI → Human 이관 계약서",
      "kind": "Workflow reference",
      "audience": "모두",
      "reason": "언제 이관하고 어떤 맥락을 넘기며 성공을 어떻게 확인하는지가 고객 경험을 좌우해요.",
      "outline": [
        "이관 조건",
        "전달 필드",
        "티켓 상태",
        "담당자 화면",
        "실패·복구",
        "완료 이벤트"
      ],
      "evidence": "CONFIRM",
      "nodeId": "handoff",
      "status": "planned",
      "notes": "",
      "assignee": "나",
      "updatedAt": "2026-07-14T09:00:00.000Z"
    }
  ],
  "sources": [
    {
      "title": "Delight.ai AI agent platform",
      "url": "https://delight.ai/ai-agent",
      "date": "확인: 2026.07.14",
      "note": "의도 이해, 문맥 유지, 외부 도구 실행, 다중 채널, 사람 이관"
    },
    {
      "title": "Introducing AMP",
      "url": "https://delight.ai/blog/product/introducing-agent-memory-platform",
      "date": "2026.03.31",
      "note": "대화 기억과 Business Intent를 결합하는 지능 계층"
    },
    {
      "title": "Delight.ai Builder & Actionbooks",
      "url": "https://delight.ai/builder",
      "date": "확인: 2026.07.14",
      "note": "자연어 기반 규칙·행동·에스컬레이션과 버전 관리"
    },
    {
      "title": "Introducing Agent Steward",
      "url": "https://delight.ai/blog/product/introducing-agent-steward",
      "date": "2026.07.08",
      "note": "여러 시스템·채널·승인을 조율하는 복합 이슈 해결 계층"
    },
    {
      "title": "Introducing Trust OS",
      "url": "https://delight.ai/blog/product/introducing-trust-os-for-ai-agents",
      "date": "2026.03.16",
      "note": "관찰·통제·사람의 감독·규모를 위한 신뢰 기반"
    },
    {
      "title": "Desk",
      "url": "https://delight.ai/desk",
      "date": "확인: 2026.07.14",
      "note": "승인 게이트나 신뢰도 기준에서 전체 맥락과 함께 사람에게 이관"
    }
  ]
} as StoredProject
