# 📱 Generated Flutter Apps

이 폴더는 AI_APP_BUILDER로 생성된 Flutter 앱들이 저장되는 곳입니다.

## 🚀 **새 앱 생성하기**

### **기본 Flutter 앱**

```bash
npm run flutter:new my_awesome_app
```

### **AR 앱 생성**

```bash
npm run flutter:new -- --ar my_ar_app
```

### **VS Code에서 생성**

```
Ctrl+Shift+P → "Tasks: Run Task" → "🚀 Flutter: Create New App"
```

## 📂 **생성된 앱 구조**

```
apps/
├── my_awesome_app/          ← 생성된 Flutter 앱
│   ├── lib/
│   │   ├── main.dart
│   │   ├── app.dart
│   │   ├── features/
│   │   └── shared/
│   ├── pubspec.yaml
│   ├── android/
│   ├── ios/
│   └── test/
└── my_ar_app/               ← AR 앱
    ├── lib/
    │   ├── features/ar/
    │   └── ...
    └── assets/models/       ← 3D 모델 파일들
```

## 🎯 **개발 워크플로우**

1. **템플릿에서 시작**: 이 폴더는 항상 비어있는 상태
2. **앱 생성**: Flutter Agent가 자동으로 앱 생성
3. **개발 진행**: 생성된 앱에서 기능 개발
4. **독립 관리**: 각 앱은 별도 Git 저장소로 관리 권장

## 📝 **주의사항**

- 이 폴더의 내용은 Git에 커밋하지 마세요
- 실제 앱 개발은 별도 저장소에서 진행하세요
- 템플릿 순수성을 위해 항상 깨끗한 상태 유지

---

**🎉 AI_APP_BUILDER Flutter Edition으로 빠른 앱 개발을 시작하세요!**
