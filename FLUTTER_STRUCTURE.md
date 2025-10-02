# AI_APP_BUILDER - Flutter 전용 모바일 앱 개발 플랫폼

## 🎯 **전체 구조 (Flutter 최적화)**

```
AI_APP_BUILDER/
├── apps/                           # 생성된 Flutter 앱들
│   ├── starter_app/               # 기본 예제 앱
│   ├── jiji_clean/                # AR 손씻기 앱
│   ├── todo_app/                  # 할일 관리 앱
│   └── ecommerce_app/             # 쇼핑 앱
├── builder/                       # 🎯 Flutter 개발 엔진
│   ├── agents/
│   │   ├── flutter_agent.ts       # Flutter 프로젝트 생성/관리
│   │   ├── pubspec_agent.ts       # 의존성 관리
│   │   ├── platform_agent.ts      # Android/iOS 설정
│   │   └── ar_ml_agent.ts         # AR/ML 특화 기능
│   ├── templates/
│   │   ├── flutter@basic/         # 기본 Flutter 앱
│   │   ├── flutter@ar/            # AR 전용 템플릿
│   │   ├── flutter@ml/            # ML/AI 전용 템플릿
│   │   ├── flutter@ecommerce/     # 쇼핑 앱 템플릿
│   │   └── flutter@social/        # 소셜 앱 템플릿
│   ├── flutter-shared/            # Flutter 공통 기능
│   │   ├── state-management/      # Riverpod, Bloc 패턴
│   │   ├── navigation/            # GoRouter, Navigator 2.0
│   │   ├── networking/            # Dio, HTTP 클라이언트
│   │   ├── database/              # SQLite, Hive, Isar
│   │   ├── firebase/              # Firebase 통합
│   │   ├── testing/               # 테스트 프레임워크
│   │   ├── ar-ml-plugins/         # AR/ML 플러그인 모음
│   │   └── ui-components/         # 재사용 위젯
│   ├── scripts/
│   │   ├── flutter-new-app.ts     # 새 Flutter 앱 생성
│   │   ├── flutter-build.ts       # 빌드 자동화
│   │   ├── flutter-deploy.ts      # 앱스토어 배포
│   │   └── flutter-doctor.ts      # 환경 체크
│   └── tools/
│       ├── emulator-manager/      # 에뮬레이터 관리
│       ├── device-manager/        # 실제 기기 관리
│       └── performance-monitor/   # 성능 모니터링
├── .vscode/                       # Flutter 전용 VS Code 설정
│   ├── tasks.json                 # Flutter 태스크들
│   ├── launch.json                # 디버깅 설정
│   └── settings.json              # Flutter 확장 설정
├── .flutter-shared/               # Flutter 공통 설정
│   ├── analysis_options.yaml     # 린트 규칙
│   ├── pubspec-common.yaml       # 공통 의존성
│   └── test_config.yaml          # 테스트 설정
└── docs/
    ├── flutter-guide.md           # Flutter 개발 가이드
    ├── ar-development.md          # AR 개발 가이드
    └── deployment-guide.md        # 배포 가이드
```

## 🏗️ **Flutter 앱 구조 표준화**

```
apps/앱이름/
├── pubspec.yaml                   # 의존성 관리
├── analysis_options.yaml         # 린트 설정
├── lib/
│   ├── main.dart                  # 앱 진입점
│   ├── app.dart                   # 앱 설정
│   ├── core/                      # 핵심 기능
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── utils/
│   │   └── extensions/
│   ├── features/                  # 기능별 모듈
│   │   ├── auth/
│   │   ├── home/
│   │   ├── profile/
│   │   └── ar_camera/             # AR 기능 (jiji_clean용)
│   ├── shared/                    # 공유 컴포넌트
│   │   ├── widgets/
│   │   ├── providers/             # Riverpod 프로바이더
│   │   ├── services/
│   │   └── models/
│   └── l10n/                      # 다국어 지원
├── test/                          # 테스트
│   ├── unit/
│   ├── widget/
│   └── integration/
├── android/                       # Android 설정
│   ├── app/
│   │   └── build.gradle
│   └── gradle.properties
├── ios/                           # iOS 설정
│   ├── Runner/
│   └── Runner.xcodeproj/
└── assets/                        # 리소스
    ├── images/
    ├── fonts/
    └── models/                    # 3D 모델 (AR용)
```

## 🎯 **핵심 기능들**

### **1. 상태 관리 (Riverpod 기반)**

- 앱 전역 상태 관리
- 비동기 데이터 처리
- 상태 지속성

### **2. 네비게이션 (GoRouter)**

- 선언적 라우팅
- 딥링크 지원
- 네비게이션 가드

### **3. AR/ML 통합**

- ARCore/ARKit 지원
- 카메라/센서 접근
- ML Kit 통합
- TensorFlow Lite

### **4. Firebase 통합**

- 인증
- Firestore 데이터베이스
- Cloud Storage
- Analytics
- Crashlytics

### **5. 개발 도구**

- Hot Reload
- 디버깅 도구
- 성능 프로파일링
- 테스트 자동화

### **6. 배포 자동화**

- Android APK/AAB 빌드
- iOS IPA 빌드
- 앱스토어 업로드
- 베타 배포
