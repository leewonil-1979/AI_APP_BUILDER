import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const i = args.indexOf("--spec");
const specPath = i >= 0 ? args[i + 1] : "specs/app.spec.json";

if (!fs.existsSync(specPath)) { 
    console.error(`❌ 스펙 파일을 찾을 수 없습니다: ${specPath}`);
    console.error("💡 힌트: 먼저 'npm run spec:strip' 명령을 실행해보세요.");
    process.exit(1); 
}

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const missing: string[] = [];
const todos: string[] = [];

if (!spec.version) {
    missing.push("version");
    todos.push("- [ ] spec 파일에 version 필드 추가 (예: \"1.0\")");
}
if (!spec.idea?.title) {
    missing.push("idea.title");
    todos.push("- [ ] spec 파일의 idea 섹션에 title 필드 추가 (예: \"My App Name\")");
}
if (!spec.scope) {
    missing.push("scope");
    todos.push("- [ ] spec 파일에 scope 섹션 추가 (예: {\"must_features\": [\"기능1\"]})");
}

if (missing.length) {
    console.error("❌ 스펙 검증 실패!");
    console.error(`📋 누락된 필수 필드: ${missing.join(", ")}`);
    console.error("📝 상세한 할일 목록이 out/todo.md에 저장되었습니다.");
    
    const outDir = path.join(process.cwd(), "out");
    fs.mkdirSync(outDir, { recursive: true });
    
    const todoContent = `# 🚨 스펙 수정 필요 사항

## 누락된 필수 필드
${missing.map(field => `- \`${field}\``).join("\n")}

## 할일 체크리스트
${todos.join("\n")}

## 참고 예시
\`\`\`jsonc
{
  "version": "1.0",
  "idea": {
    "title": "My App Name",
    "one_liner": "앱 한줄 설명",
    "problem": "해결하려는 문제"
  },
  "scope": {
    "must_features": ["필수 기능1", "필수 기능2"]
  }
}
\`\`\`
`;
    
    fs.writeFileSync(path.join(outDir, "todo.md"), todoContent);
    process.exit(2);
}

const outDir = path.join(process.cwd(), "out");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "prompt.final.json"), JSON.stringify({ 
    ok: true, 
    specPath,
    title: spec.idea.title,
    timestamp: new Date().toISOString()
}, null, 2));

console.log("✅ A(orchestrate) 성공!");
console.log(`📱 앱: ${spec.idea.title}`);
console.log("📄 결과 -> out/prompt.final.json");
