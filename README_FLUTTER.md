# 🚀 AI_APP_BUILDER - Flutter Template Edition

> **🎯 Flutter 모바일 앱 자동 생성 템플릿**  
> **1인 개발자를 위한 AI 기반 Flutter 개발 플랫폼**

이 템플릿을 사용하여 복잡한 모바일 앱 개발 과정을 자동화하고, 아이디어에만 집중할 수 있습니다.

## ⭐ **Template 특징**

### 🎯 **즉시 사용 가능**

- Flutter Agent 시스템 완성
- VS Code 완전 통합
- 5가지 앱 템플릿 제공
- 원클릭 앱 생성

### 🔄 **재사용 가능**

- 깨끗한 템플릿 상태 유지
- 무제한 앱 생성 가능
- 독립적인 앱 관리
- 템플릿 순수성 보장

## ✨ 주요 기능

### 🎯 **지원 앱 유형**

- **📱 기본 앱**: Material Design 3, 상태관리, 네비게이션
- **🥽 AR 앱**: ARCore/ARKit 통합, 3D 객체 배치, 평면 감지
- **🤖 ML 앱**: TensorFlow Lite, Google ML Kit, 얼굴/포즈 인식
- **🛒 이커머스 앱**: 결제 연동, 상품 관리, 주문 시스템
- **👥 소셜 앱**: 실시간 채팅, 피드, 팔로우 시스템

### 🏗️ **아키텍처 특징**

- **🔧 자동 코드 생성**: 템플릿 기반 Flutter 앱 스캐폴딩
- **📦 의존성 관리**: pubspec.yaml 자동 설정
- **🎨 UI/UX**: Material Design 3 적용
- **🔄 상태 관리**: Riverpod, BLoC, Provider 선택 가능
- **🧭 네비게이션**: GoRouter 또는 Navigator 2.0
- **💾 데이터**: SQLite, Hive, Isar, Firestore 지원

## 🚀 빠른 시작

### 1️⃣ **환경 설정**

```bash
# Flutter 설치 확인
flutter doctor

# 프로젝트 클론
git clone <repository-url>
cd AI_APP_BUILDER

# 의존성 설치
npm install
```

### 2️⃣ **기본 앱 생성**

```bash
# VS Code에서 Ctrl+Shift+P → "Tasks: Run Task"
# "🚀 Flutter: Create New App" 선택

# 또는 터미널에서
npm run flutter:new my_awesome_app
```

### 3️⃣ **AR 앱 생성**

```bash
# VS Code 태스크: "🎯 Flutter: Create AR App"
# 또는 터미널에서
npm run flutter:new -- --ar my_ar_app
```

## 📁 프로젝트 구조

```
AI_APP_BUILDER/
├── 📱 apps/                    # 생성된 Flutter 앱들
│   ├── jiji_clean/            # JIJI Clean AR 앱
│   └── my_app1/               # 샘플 앱
├── 🏗️ builder/                # 빌드 시스템
│   ├── agents/                # Flutter 전용 에이전트
│   │   ├── flutter_agent.ts   # 메인 Flutter 생성 에이전트
│   │   ├── pubspec_agent.ts   # pubspec.yaml 관리
│   │   ├── platform_agent.ts  # 플랫폼별 설정
│   │   └── ar_ml_agent.ts     # AR/ML 전용 기능
│   ├── scripts/               # 자동화 스크립트
│   │   └── new-flutter-app.ts # 새 앱 생성 스크립트
│   └── templates/             # Flutter 템플릿
│       ├── flutter@basic/     # 기본 앱 템플릿
│       ├── flutter@ar/        # AR 앱 템플릿
│       ├── flutter@ml/        # ML 앱 템플릿
│       ├── flutter@ecommerce/ # 이커머스 템플릿
│       └── flutter@social/    # 소셜 앱 템플릿
├── 🔧 .vscode/                # VS Code 통합
│   ├── tasks.json            # Flutter 태스크 정의
│   └── launch.json           # 디버깅 설정
└── 📚 docs/                   # 문서화
```

## 🎯 VS Code 통합

### **🔥 주요 태스크**

- `🚀 Flutter: Create New App` - 새 Flutter 앱 생성
- `🎯 Flutter: Create AR App` - AR 기능이 포함된 앱 생성
- `📱 Flutter: Run Debug` - 디버그 모드로 앱 실행
- `🏗️ Flutter: Build APK` - APK 빌드
- `🍎 Flutter: Build iOS` - iOS 빌드
- `🧪 Flutter: Run Tests` - 테스트 실행
- `🩺 Flutter: Doctor` - 환경 진단

### **⚡ 핫키**

- `Ctrl+Shift+P` → "Tasks: Run Task" → Flutter 태스크 선택
- `F5` → Flutter 디버그 실행
- `Ctrl+F5` → Flutter 릴리즈 실행

## 🛠️ 고급 기능

### **🎨 커스텀 템플릿 생성**

```typescript
// builder/templates/flutter@custom/template.json
{
  "name": "Custom Flutter Template",
  "features": {
    "stateManagement": "riverpod",
    "navigation": "goRouter",
    "ui": "material3"
  }
}
```

### **🔧 에이전트 확장**

```typescript
// builder/agents/custom_agent.ts
import { FlutterAgent } from "./flutter_agent.js";

export class CustomFlutterAgent extends FlutterAgent {
  async generateCustomFeature(spec: FlutterAppSpec) {
    // 커스텀 기능 구현
  }
}
```

## 📱 지원 플랫폼

### **🤖 Android**

- **최소 SDK**: 21 (Android 5.0)
- **타겟 SDK**: 34 (Android 14)
- **AR 최소 SDK**: 24 (ARCore 요구사항)

### **🍎 iOS**

- **최소 버전**: iOS 12.0
- **타겟 버전**: iOS 17.0
- **AR 최소 버전**: iOS 12.0 (ARKit 요구사항)

## 🧩 의존성 패키지

### **🔧 핵심 패키지**

- `flutter_riverpod`: 상태 관리
- `go_router`: 선언적 라우팅
- `shared_preferences`: 로컬 저장소
- `http`: HTTP 클라이언트

### **🥽 AR 패키지**

- `ar_flutter_plugin`: AR 기능
- `vector_math`: 3D 수학 연산
- `camera`: 카메라 접근

### **🤖 ML 패키지**

- `google_mlkit_*`: Google ML Kit
- `tflite_flutter`: TensorFlow Lite

### **🔐 권한 관리**

- `permission_handler`: 권한 요청
- 자동 권한 설정 (카메라, 위치, 저장소)

## 🚀 개발 워크플로

### **1️⃣ 아이디어 → 앱 생성**

```bash
# 1. 앱 유형 결정 (기본/AR/ML/이커머스/소셜)
# 2. VS Code 태스크 실행 또는 CLI 명령
npm run flutter:new my_new_app

# 3. 생성된 앱 디렉토리로 이동
cd apps/my_new_app

# 4. 의존성 설치
flutter pub get

# 5. 앱 실행
flutter run
```

### **2️⃣ 개발 → 테스트 → 배포**

```bash
# 개발 중 핫 리로드
flutter run --hot-reload

# 테스트 실행
flutter test

# APK 빌드
flutter build apk --release

# iOS 빌드 (macOS에서만)
flutter build ios --release
```

## 📊 성능 최적화

### **🔋 배터리 효율성**

- 불필요한 애니메이션 최소화
- 백그라운드 작업 최적화
- AR/ML 기능 사용 시 적응형 품질 조절

### **📱 메모리 관리**

- 이미지 캐싱 및 압축
- 불필요한 위젯 dispose
- 스트림 및 컨트롤러 정리

### **⚡ 시작 시간 단축**

- 지연 로딩 구현
- 핵심 기능 우선 로드
- 스플래시 화면 최적화

## 🔧 트러블슈팅

### **🚨 일반적인 문제**

#### **Flutter Doctor 문제**

```bash
flutter doctor -v
# Android Studio, VS Code, 디바이스 연결 확인
```

#### **빌드 에러**

```bash
flutter clean
flutter pub get
flutter pub upgrade
```

#### **AR 기능 문제**

- ARCore/ARKit 지원 디바이스 확인
- 카메라 권한 허용 확인
- 최소 SDK 버전 확인 (Android 24+, iOS 12+)

### **📞 지원**

- 이슈 리포트: GitHub Issues
- 문서: `/docs` 디렉토리
- 예제: `/apps` 디렉토리의 샘플 앱들

## 🎯 다음 단계

1. **📱 JIJI Clean AR 앱 개발**

   ```bash
   npm run flutter:new -- --ar jiji_clean
   ```

2. **🔄 기존 코드와 통합**
   - Flutter 구조로 마이그레이션
   - AR 기능 재구현
   - 상태 관리 적용

3. **🚀 배포 준비**
   - Play Store / App Store 준비
   - 코드 사이닝 설정
   - 릴리즈 빌드 테스트

---

**🎉 AI_APP_BUILDER Flutter Edition으로 여러분의 모바일 앱 개발 여정을 시작하세요!**
