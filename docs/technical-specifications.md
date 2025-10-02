# AI_APP_BUILDER 기술 명세서

## 🔧 **핵심 구현 사항**

### **1. LLM 통합 아키텍처**

```typescript
// OpenAI GPT-4o-mini 연동
- API Key: 환경변수 (.env) 관리
- 토큰 효율화: input ~$0.150/1M, output ~$0.600/1M
- 에러 처리: 재시도 로직 + 백오프
- 비용 최적화: 앱당 평균 $0.05
```

### **2. 코드 생성 엔진 (b_codegen.ts)**

```typescript
interface AppSpec {
  version?: string;
  idea?: { title?: string; one_liner?: string; };
  scope?: { must_features?: string[]; };
}

// 핵심 생성 함수들
renderTypes(spec) → TypeScript 타입 정의
renderHooks(spec) → 상태 관리 훅
renderPageComponent(feature) → 페이지 컴포넌트
renderPackageJson(spec) → 프로젝트 설정

// 재생성 안전장치
upsertWithGenBlock(file, key, content)
- // <gen:begin key> ... // <gen:end key>
- 자동 백업 (.bak)
- 선택적 파일 보호
```

### **3. 검증 파이프라인 (c_verify_optimize.ts)**

```typescript
// 다단계 검증
1. 파일 존재성 확인
2. npm install (의존성 설치)
3. TypeScript 컴파일 (--strict --noEmit)
4. ESLint 검사 (--max-warnings 0)
5. 빌드 실행 (npm run build)
6. 번들 사이즈 분석

// 성능 임계치
checkBundleSize():
  - 총 번들: 500KB 이하
  - 단일 청크: 300KB 이하
  - 파일별 상세 분석 리포트
```

### **4. VS Code 통합**

```json
// .vscode/tasks.json - 11개 태스크
{
  "🤖 LLM: Full Pipeline": "npm run app:init:llm",
  "🏗️ Codegen Only": "npm run b:codegen",
  "✅ Verify Only": "npm run c:verify",
  "🚀 Start Dev Server": "npm run dev",
  "🌐 Preview Build": "npm run preview"
}

// .vscode/launch.json - 디버깅 설정
- 모든 에이전트별 디버그 구성
- F5로 즉시 디버깅 가능
```

---

## 📁 **파일 구조 & 역할**

### **루트 레벨**

```
├── .env                    # OpenAI API 키
├── package.json           # 워크스페이스 설정
├── tsconfig.base.json     # 공통 TS 설정
└── jest.config.js         # 테스트 설정
```

### **Builder 엔진**

```
builder/
├── agents/
│   ├── a_orchestrator.ts  # 파이프라인 조율
│   ├── b_codegen.ts       # 코드 생성 (핵심)
│   └── c_verify_optimize.ts # 검증 & 최적화
├── templates/
│   └── react@v1/          # React 템플릿 v1
│       └── template.json  # 메타데이터
├── scripts/
│   ├── new-app.ts         # 새 앱 생성
│   └── strip-jsonc.ts     # JSONC → JSON 변환
└── specs/
    └── schema.json        # JSON 스키마 정의
```

### **생성된 앱 구조**

```
apps/my_app1/
├── specs/
│   ├── app.spec.json      # 최종 JSON 스펙
│   └── app.spec.jsonc     # 주석 포함 스펙
├── generated/web/
│   ├── .gen-meta.json     # 생성 메타데이터
│   ├── src/
│   │   ├── App.tsx        # 메인 컴포넌트 (Gen Block 적용)
│   │   ├── types.ts       # 타입 정의 (Gen Block)
│   │   ├── hooks.ts       # 커스텀 훅 (Gen Block)
│   │   └── *.tsx.bak      # 자동 백업 파일
│   ├── package.json       # 프로젝트 의존성
│   └── vite.config.ts     # Vite 설정
└── package.json           # 앱별 스크립트
```

---

## 🔄 **워크플로우 상세**

### **1. 아이디어 → 스펙 생성**

```typescript
// LLM 프롬프트 패턴
System: "JSON 스펙 생성기 역할"
User: idea.txt 내용
LLM: app.spec.json 생성 (스키마 준수)

// 검증 단계
- JSON Schema 유효성 확인
- 필수 필드 존재 확인 (idea, scope)
- Features 배열 정규화
```

### **2. 스펙 → 코드 생성**

```typescript
// 동적 타입 생성
export type PageId = 'home' | 'settings' | ...;
export type AppState = {
  currentPage: PageId;
  counters: Record<string, number>;
  lastUpdated: string;
};

// 상태 관리 훅
export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  // setCurrentPage, incrementCounter, resetCounter
}

// 페이지 컴포넌트
function HomePage({ counter, onIncrement, onReset }) {
  // 기능별 맞춤 UI
}
```

### **3. 검증 & 최적화**

```bash
# 자동 실행 파이프라인
npm install              # 의존성 설치
tsc --noEmit --strict   # 타입 검사
npm run lint            # ESLint 검사
npm run build           # 프로덕션 빌드
bundle-size-check       # 성능 분석

# 결과 리포트
out/qa.report.json      # 기계 읽기용
out/verify.report.md    # 사람 읽기용
```

---

## 🛡️ **보안 & 품질 관리**

### **환경변수 보안**

```env
# .env (gitignore 포함)
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

### **Docker 보안 강화**

```dockerfile
# Caddy 기반 경량화
FROM node:22-bookworm-slim AS builder
FROM caddy:2-alpine AS runtime

# 보안 설정
USER caddy                    # 비루트 실행
EXPOSE 8080                   # 비특권 포트
Security headers 자동 적용      # XSS, CSRF 방지
```

### **코드 품질**

```json
// ESLint + TypeScript strict
"rules": {
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/strict-boolean-expressions": "warn",
  "react-hooks/exhaustive-deps": "error"
}
```

---

## 📊 **성능 최적화**

### **번들 크기 관리**

```typescript
// 자동 분석
dist/assets/index-[hash].js: 140.9KB
dist/assets/index-[hash].css: 2.1KB
총 크기: 143.0KB (✅ 권장 범위)

// 최적화 기법
- Tree shaking (Vite 기본)
- Code splitting (동적 import)
- 압축 (gzip)
- 캐시 최적화 (hash 기반)
```

### **빌드 성능**

```bash
# Vite 빌드 시간
평균: ~800ms (빠름)
캐시 적중 시: ~200ms
의존성 변경 시: ~1.5s
```

---

## 🔮 **확장성 설계**

### **템플릿 버저닝**

```
templates/
├── react@v1/         # 현재 안정 버전
├── react@v2/         # 미래 업그레이드
├── vue@v1/           # 다른 프레임워크
└── react-native@v1/  # 모바일 확장
```

### **복잡도 선택**

```json
// app.spec.json에서 제어 가능
{
  "complexity": "simple", // simple | standard | advanced | pro
  "features": {
    "stateManagement": "basic", // 단계별 선택
    "routing": "simple",
    "ui": "minimal",
    "testing": false
  }
}
```

---

## 🎯 **현재 한계 & 개선점**

### **알려진 제약사항**

```
❌ 현재는 React만 지원 (Vue, Svelte 미지원)
❌ 네이티브 모바일 앱 미지원
❌ 복잡한 백엔드 연동 제한
❌ 사용자 인증 시스템 기본 수준
❌ 데이터베이스 연동 수동 설정 필요
```

### **개선 우선순위**

```
1순위: Tier 1-2 구현 (상태관리, 라우팅 고도화)
2순위: UI 라이브러리 지능 선택
3순위: 데이터 페칭 자동화
4순위: 테스팅 프레임워크 통합
5순위: Mobile 확장 (React Native)
```

---

_기술 명세서 마지막 업데이트: 2025-09-28_  
_버전: v2.0 (1인 개발자 최적화 완료)_
