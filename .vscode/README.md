# AI App Builder

AI 기반 앱 빌드 파이프라인을 제공하는 모노레포입니다.

## 🚀 새 앱 생성 → 스펙 편집 → 파이프라인 실행

### 1단계: 새 앱 생성

```bash
# 새 앱 생성
npm run new my_awesome_app

# 강제 덮어쓰기 (기존 앱이 있을 때)
npm run new my_awesome_app -- --force
```

### 2단계: 스펙 편집

생성된 앱의 스펙을 편집합니다:

```bash
# 스펙 파일 열기
code apps/my_awesome_app/specs/app.spec.jsonc
```

필수 필드들을 수정하세요:

```jsonc
{
  "version": "1.0",
  "meta": { 
    "spec_id": "app-my_awesome_app", 
    "author": "your_name", 
    "created_at": "2025-01-XX" 
  },
  "idea": { 
    "title": "My Awesome App",           // ✅ 필수
    "one_liner": "앱에 대한 한줄 설명", 
    "problem": "해결하려는 문제 설명" 
  },
  "scope": { 
    "must_features": ["로그인", "대시보드", "설정"]  // ✅ 권장
  }
}
```

### 3단계: 파이프라인 실행

```bash
# 해당 앱 디렉토리로 이동
cd apps/my_awesome_app

# 전체 파이프라인 실행
npm run app:init
```

또는 VSCode에서:
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Run my_app1 Pipeline" 선택

### 단계별 실행 (디버깅용)

```bash
# 1) JSONC → JSON 변환
npm run spec:strip

# 2) 스키마 검증
npm run spec:check

# 3) A: 오케스트레이션
npm run a:orchestrate

# 4) B: 코드 생성
npm run b:codegen

# 5) C: 검증 & 최적화
npm run c:verify
```

## 🔧 실패/복구 팁

### 스펙 검증 실패
```bash
❌ Spec missing: idea.title
```
**해결:** `apps/your_app/specs/app.spec.jsonc`에서 `idea.title` 필드 추가

### 파일 경로 오류
```bash
❌ Spec not found: specs/app.spec.json
```
**해결:** 
1. `npm run spec:strip` 먼저 실행
2. `specs/app.spec.jsonc` 파일 존재 확인

### Windows 권한 오류
```bash
Error: ENOENT: no such file or directory
```
**해결:**
1. 관리자 권한으로 터미널 실행
2. `npm install` 재실행
3. 바이러스 백신 실시간 보호 일시 해제

### 긴 경로명 오류 (Windows)
```bash
Error: ENAMETOOLONG
```
**해결:** 프로젝트를 더 짧은 경로 (예: `C:\dev\ai-builder`)로 이동

### Node.js/tsx 누락
```bash
'tsx' is not recognized as an internal or external command
```
**해결:**
```bash
# tsx 전역 설치
npm install -g tsx

# 또는 의존성 재설치
npm install
```

### 스키마 검증 도구 오류
```bash
'ajv' is not recognized
```
**해결:**
```bash
# 루트에서 의존성 설치
npm install

# 워크스페이스 의존성 설치
npm run validate
```

## 📁 프로젝트 구조

```
AI_APP_BUILDER/
├── apps/                    # 생성된 앱들
│   ├── my_app1/
│   └── my_app_sandbox/
├── builder/                 # 빌드 도구
│   ├── agents/             # A, B, C 에이전트
│   ├── scripts/            # 유틸리티 스크립트
│   ├── specs/              # 스키마 정의
│   └── templates/          # 앱 템플릿
└── packages/               # 공유 패키지 (향후)
```

## 🔄 CI/CD

GitHub Actions를 통해 자동으로:
- 모든 앱의 파이프라인 실행
- 린트, 타입체크, 테스트 검증
- Renovate를 통한 의존성 자동 업데이트
