# 🧼 JIJI Clean

간단하고 재미있는 손 씻기 습관 형성 앱

## 📱 앱 개요

**JIJI Clean**은 아이들이 손 씻기를 재미있게 할 수 있도록 돕는 앱입니다.

### 핵심 기능

1. **세균 모드** 🦠
   - 4가지 세균 아이콘 중 선택
   - 손 위에 세균 표시
   - 사진 촬영으로 아이에게 보여주기

2. **반짝 모드** ✨
   - 4가지 반짝이 아이콘 중 선택
   - 깨끗한 손에 반짝이 표시
   - 사진 촬영으로 보상 효과

## 🚀 빠른 시작

```bash
# 패키지 설치
flutter pub get

# 디바이스 연결 확인
flutter devices

# 앱 실행
flutter run
```

## 📂 프로젝트 구조

```
jiji_clean/
├── lib/main.dart                 # 메인 앱 (카메라 화면)
├── assets/                       # 아이콘 및 이미지
├── specs/app.spec.jsonc         # 앱 스펙 문서
└── README.md                    # 이 파일
```

## 📋 개발 상태

### ✅ 완료

- 기본 프로젝트 구조
- 카메라 화면 UI
- 아이콘 선택 (세균 4개, 반짝 4개)
- 줌 컨트롤 (0.5x ~ 2.0x)
- 카메라 전환 버튼
- 셔터 버튼

### 🔄 진행 중

- ML Kit 손목 감지 통합
- 아이콘 오버레이 (손 위에 표시)
- 갤러리 저장 기능

## 🛠️ 기술 스택

- Flutter 3.8+
- camera 패키지
- google_mlkit_pose_detection
- image, image_picker
- permission_handler

---

Made with ❤️ for kids' healthy habits
