# 🧹 Apps 폴더 정리 안내

## ⚠️ **삭제 권한**

**apps 폴더 안의 모든 앱들은 안전하게 삭제 가능합니다:**

- ✅ `jiji_clean/` - 이전 버전 (새로 만들 예정)
- ✅ `my_app1/` - 테스트용 샘플 앱
- ✅ `my_app_sandbox/` - 실험용 앱
- ✅ `test_app/` - 테스트 앱

## 🎯 **삭제 후 깨끗한 상태**

### **남겨둘 핵심 구조:**

```
AI_APP_BUILDER/
├── apps/                    ← 빈 폴더 (새 앱들이 여기 생성됨)
├── builder/                 ← 🎯 Flutter 템플릿 엔진
├── .vscode/                 ← VS Code 설정
├── docs/
├── install-requirements.txt
├── improvements.txt
├── README_FLUTTER.md
└── package.json
```

## 🚀 **Git 브랜치 전략**

### **Master Branch (Template)**

- 깨끗한 Flutter 빌더 템플릿
- `apps/` 폴더는 비어있음
- 언제든 새 앱 생성 가능

### **App-specific Branches**

```bash
master (template)
├── app/jiji-clean      # JIJI Clean AR 앱
├── app/todo-app        # Todo 관리 앱
├── app/ecommerce       # 쇼핑 앱
└── app/social-media    # 소셜 앱
```

## 🔄 **개발 워크플로우**

### **새 앱 시작할 때:**

```bash
# 1. Master에서 새 브랜치 생성
git checkout master
git checkout -b app/my-new-app

# 2. Flutter 앱 생성
npm run flutter:new my_new_app

# 3. 개발 진행
# 4. 브랜치에 커밋
```

### **템플릿 업데이트할 때:**

```bash
# 1. Master에서 빌더 수정
git checkout master
# builder/ 폴더 수정

# 2. 각 앱 브랜치에 머지
git checkout app/jiji-clean
git merge master
```

## 💾 **백업 전략**

### **브랜치별 완전 백업**

- 각 앱이 독립된 브랜치로 관리
- 앱 간 상호 영향 없음
- 개별 롤백 가능

### **템플릿 보호**

- Master 브랜치는 빌더만 포함
- 앱 코드로 오염되지 않음
- 언제든 깨끗한 시작 가능

---

**결론: apps 폴더의 모든 내용을 삭제하고 깨끗한 템플릿 상태로 Git에 올리는 것이 최적입니다! 🎯**
