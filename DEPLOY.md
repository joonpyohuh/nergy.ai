# nergy.ai 팀 공용 배포 가이드

## 1. Supabase

1. [Supabase](https://supabase.com)에서 프로젝트를 생성합니다.
2. SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 실행합니다.
3. Project Settings → API에서 다음을 복사합니다.
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (anon 키가 아님)

## 2. Vercel 환경변수

Vercel 프로젝트 `nergy-ai` → Settings → Environment Variables (Production)에 추가:

| Name | Notes |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI 키 |
| `OPENAI_MODEL` | 기본 `gpt-5.5` |
| `TEAM_PASSWORD` | 팀 공용 비밀번호 |
| `SESSION_SECRET` | 긴 랜덤 문자열 (예: `openssl rand -hex 32`) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role |

`VITE_` 접두사는 사용하지 마세요. 브라우저로 노출됩니다.

## 3. 배포

GitHub `main`에 푸시하거나:

```bash
vercel --prod --yes
```

## 4. 확인

1. Production URL 접속 → 비밀번호 로그인
2. Delight.ai 시드 프로젝트가 보이면 OK
3. 문서 상태를 바꾼 뒤 다른 브라우저/시크릿 창에서 같은 비밀번호로 로그인 → 변경이 보이면 공유 저장 OK
4. 새 제품 분석이 JSON 오류 없이 끝나는지 확인

## 로컬 개발

`.env`에 위 변수를 채운 뒤:

```bash
npm run dev
```

Vite 미들웨어가 `/api/auth`, `/api/projects`, `/api/workspace`, `/api/analyze`를 제공합니다.
