# 📖 AI_APP_BUILDER Template 사용 가이드

## 🚀 **템플릿에서 새 프로젝트 시작하기**

### **1단계: 템플릿 복사**

```bash
# GitHub에서 템플릿 사용
# "Use this template" 버튼 클릭 → 새 저장소 생성

# 또는 직접 클론
git clone https://github.com/leewonil-1979/AI_APP_BUILDER_template.git my_new_project
cd my_new_project
```

### **2단계: 의존성 설치**

```bash
# Node.js 의존성 설치
npm install

# Flutter 환경 확인
flutter doctor -v
```

### **3단계: 첫 번째 앱 생성**

```bash
# 기본 Flutter 앱 생성
npm run flutter:new my_first_app

# AR 앱 생성
npm run flutter:new -- --ar my_ar_app
```

## 🏗️ **프로젝트 구조 관리**

### **권장 Git 전략**

#### **템플릿 저장소** (`AI_APP_BUILDER_template`)

```
# 용도: 깨끗한 템플릿 유지
# 포함: builder/, .vscode/, docs/
# 제외: apps/ 안의 실제 앱들
```

#### **개별 앱 저장소**

```bash
# 각 앱마다 독립된 저장소 생성
AI_APP_BUILDER_MyApp1/
AI_APP_BUILDER_MyApp2/
AI_APP_BUILDER_JIJI_CLEAN/
```

### **워크플로우 예시**

#### **새 앱 프로젝트 시작**

```bash
# 1. 템플릿에서 새 저장소 생성
git clone AI_APP_BUILDER_template AI_APP_BUILDER_MyNewApp
cd AI_APP_BUILDER_MyNewApp

# 2. 원격 저장소 변경
git remote set-url origin https://github.com/username/AI_APP_BUILDER_MyNewApp.git

# 3. 앱 생성
npm run flutter:new my_new_app

# 4. 개발 시작
cd apps/my_new_app
flutter run
```

#### **템플릿 업데이트 받기**

```bash
# 기존 앱 프로젝트에서 템플릿 업데이트
git remote add template https://github.com/leewonil-1979/AI_APP_BUILDER_template.git
git fetch template
git merge template/master --allow-unrelated-histories

# 충돌 해결 후
git push origin master
```

## 📂 **폴더 구조 설명**

### **템플릿 폴더** (Git에 포함)

```
AI_APP_BUILDER_template/
├── builder/                 ✅ Flutter 생성 엔진
├── .vscode/                 ✅ VS Code 설정
├── docs/                    ✅ 문서
├── apps/README.md           ✅ 앱 폴더 가이드
├── install-requirements.txt ✅ 설치 가이드
├── improvements.txt         ✅ 개선 계획
├── README_FLUTTER.md        ✅ 메인 가이드
└── package.json             ✅ 빌드 설정
```

### **개발 폴더** (Git에서 제외)

```
apps/
├── my_app1/                 ❌ 실제 앱 (제외)
├── my_app2/                 ❌ 실제 앱 (제외)
└── README.md                ✅ 가이드만 포함
```

## 🔄 **버전 관리 전략**

### **템플릿 버전 관리**

```bash
# 템플릿 개선 사항
v1.0.0  # 기본 Flutter 생성
v1.1.0  # AR 템플릿 추가
v1.2.0  # ML 템플릿 추가
v2.0.0  # UI 개선 및 자동화 강화
```

### **앱별 독립 관리**

```bash
# 각 앱은 자체 버전 관리
my_app1/
├── v0.1.0  # MVP
├── v0.2.0  # 기능 추가
└── v1.0.0  # 출시 버전
```

## 🚀 **배포 및 공유**

### **템플릿 공유**

```bash
# GitHub Template 기능 활용
1. Repository Settings
2. Template repository 체크
3. "Use this template" 버튼 활성화
```

### **앱 배포**

```bash
# 각 앱 개별 배포
cd apps/my_app
flutter build apk --release
flutter build ios --release
```

## 📝 **주의사항**

### **Do's ✅**

- 템플릿은 항상 깨끗한 상태 유지
- 각 앱은 별도 저장소로 관리
- 템플릿 업데이트 정기 확인
- 문서화 지속 업데이트

### **Don'ts ❌**

- 템플릿에 실제 앱 코드 커밋 금지
- apps/ 폴더에 중요 파일 저장 금지
- 템플릿과 앱 개발 동시 진행 금지
- builder/ 폴더 임의 수정 금지

---

**🎯 이 가이드를 따라하면 효율적이고 체계적인 Flutter 앱 개발이 가능합니다!**
