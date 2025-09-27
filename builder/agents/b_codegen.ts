// 목표: specs/app.spec.json을 읽어 Vite+React 최소 앱을 apps/my_app1/generated/web 에 생성
import fs from "fs";
import path from "path";

type AppSpec = {
  version?: string;
  idea?: {
    title?: string;
    one_liner?: string;
  };
  scope?: {
    must_features?: string[];
  };
};

// 명령행 인수에서 appPath 가져오기
const args = process.argv.slice(2);
const appPathIndex = args.indexOf("--appPath");
const appPath = appPathIndex >= 0 ? args[appPathIndex + 1] : ".";

const APP_DIR = path.resolve(process.cwd(), appPath);
const SPEC_PATH = path.resolve(APP_DIR, "specs", "app.spec.json");
const OUT_DIR = path.resolve(APP_DIR, "generated", "web");

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, s: string) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, s, "utf8");
}

function renderPackageJson(spec: AppSpec) {
  const appName = spec.idea?.title?.replace(/\s+/g, "_").toLowerCase() || "my_app_web";
  return JSON.stringify(
    {
      name: appName,
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
        lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      },
      devDependencies: {
        "@types/react": "^18.2.43",
        "@types/react-dom": "^18.2.17",
        "@typescript-eslint/eslint-plugin": "^6.14.0",
        "@typescript-eslint/parser": "^6.14.0",
        "@vitejs/plugin-react": "^4.2.1",
        eslint: "^8.55.0",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-react-refresh": "^0.4.5",
        typescript: "^5.2.2",
        vite: "^5.0.8",
      },
    },
    null,
    2,
  );
}

const VITE_CONFIG_TS = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`;

const TS_CONFIG = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`;

const TS_CONFIG_NODE = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`;

function renderIndexHtml(spec: AppSpec) {
  const title = spec.idea?.title || "My App";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function renderMainTsx(spec: AppSpec) {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
}

function renderAppTsx(spec: AppSpec) {
  const title = spec.idea?.title || "My App";
  const oneLiner = spec.idea?.one_liner || "Welcome to your new app";
  const features = spec.scope?.must_features || [];

  return `import { useState } from 'react'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('${features[0] || "home"}')
  const [count, setCount] = useState(0)

  const renderPage = () => {
    switch(currentPage) {
      ${features
        .map(
          (feature) => `
      case '${feature}':
        return (
          <div className="page">
            <h2>📱 ${feature} 페이지</h2>
            <p>${feature} 기능을 구현할 수 있습니다.</p>
            ${
              feature === "기록추가"
                ? `
            <div className="counter-section">
              <p>기록 카운터: {count}</p>
              <button onClick={() => setCount(count + 1)}>
                기록 추가 (+1)
              </button>
              <button onClick={() => setCount(0)} className="reset-btn">
                리셋
              </button>
            </div>`
                : ""
            }
          </div>
        )`,
        )
        .join("")}
      default:
        return <div className="page"><h2>페이지를 찾을 수 없습니다</h2></div>
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>${title}</h1>
        <p>${oneLiner}</p>
      </header>
      
      <nav className="App-nav">
        <h3>📋 페이지 네비게이션</h3>
        <div className="nav-buttons">
          ${features
            .map(
              (feature) => `
          <button 
            key="${feature}"
            onClick={() => setCurrentPage('${feature}')}
            className={\`nav-btn \${currentPage === '${feature}' ? 'active' : ''}\`}
          >
            ${feature}
          </button>`,
            )
            .join("")}
        </div>
      </nav>

      <main className="App-main">
        {renderPage()}
      </main>

      <footer className="App-footer">
        <p>현재 페이지: <strong>{currentPage}</strong></p>
        <p>총 기능 수: {${features.length}}</p>
      </footer>
    </div>
  )
}

export default App
`;
}

const APP_CSS = `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  border-radius: 8px;
}

.App-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
}

.App-header p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
}

.App-nav {
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
}

.App-nav h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #646cff;
  background-color: white;
  color: #646cff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: #646cff;
  color: white;
}

.nav-btn.active {
  background-color: #646cff;
  color: white;
  font-weight: bold;
}

.App-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.page {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 300px;
  text-align: center;
}

.page h2 {
  color: #333;
  margin: 0 0 1rem 0;
}

.counter-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.counter-section p {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.counter-section button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.counter-section button:first-of-type {
  background-color: #4CAF50;
  color: white;
}

.counter-section button:first-of-type:hover {
  background-color: #45a049;
}

.reset-btn {
  background-color: #f44336 !important;
  color: white !important;
}

.reset-btn:hover {
  background-color: #da190b !important;
}

.App-footer {
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
  border-top: 2px solid #ddd;
}

.App-footer p {
  margin: 0.25rem 0;
  color: #666;
}

.App-footer strong {
  color: #333;
}
`;

const INDEX_CSS = `body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #213547;
  background-color: #ffffff;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

#root {
  width: 100%;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #e6e6e6;
    background-color: #242424;
  }
}
`;

async function main() {
  if (!fs.existsSync(SPEC_PATH)) {
    console.error("❌ Spec not found:", SPEC_PATH);
    process.exit(1);
  }

  const spec: AppSpec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));

  // 1) 베이스 디렉터리 생성
  ensureDir(OUT_DIR);

  // 2) 파일 생성
  writeFile(path.join(OUT_DIR, "package.json"), renderPackageJson(spec));
  writeFile(path.join(OUT_DIR, "vite.config.ts"), VITE_CONFIG_TS);
  writeFile(path.join(OUT_DIR, "tsconfig.json"), TS_CONFIG);
  writeFile(path.join(OUT_DIR, "tsconfig.node.json"), TS_CONFIG_NODE);
  writeFile(path.join(OUT_DIR, "index.html"), renderIndexHtml(spec));
  writeFile(path.join(OUT_DIR, "src", "main.tsx"), renderMainTsx(spec));
  writeFile(path.join(OUT_DIR, "src", "App.tsx"), renderAppTsx(spec));
  writeFile(path.join(OUT_DIR, "src", "App.css"), APP_CSS);
  writeFile(path.join(OUT_DIR, "src", "index.css"), INDEX_CSS);

  // 3) 리포트 생성
  const outDir = path.join(process.cwd(), "out");
  fs.mkdirSync(outDir, { recursive: true });

  const reportContent = `# Codegen 완료

## 생성된 앱 정보
- **제목**: ${spec.idea?.title || "Untitled"}
- **설명**: ${spec.idea?.one_liner || "No description"}
- **버전**: ${spec.version || "1.0"}

## 생성된 파일들
- \`generated/web/package.json\` - 프로젝트 설정
- \`generated/web/vite.config.ts\` - Vite 설정
- \`generated/web/tsconfig.json\` - TypeScript 설정
- \`generated/web/index.html\` - HTML 템플릿
- \`generated/web/src/main.tsx\` - 앱 진입점
- \`generated/web/src/App.tsx\` - 메인 컴포넌트
- \`generated/web/src/App.css\` - 앱 스타일
- \`generated/web/src/index.css\` - 글로벌 스타일

## 다음 단계
\`\`\`bash
cd generated/web
npm install
npm run dev
\`\`\`

## 주요 기능
${spec.scope?.must_features?.map((f) => `- ${f}`).join("\n") || "- 기본 기능"}
`;

  fs.writeFileSync(path.join(outDir, "codegen.report.md"), reportContent);

  console.log("✅ B(codegen) 성공!");
  console.log(`📱 앱: ${spec.idea?.title || "Untitled"}`);
  console.log("📁 생성 위치:", OUT_DIR);
  console.log("📄 결과 -> out/codegen.report.md");
}

main().catch((e) => {
  console.error("❌ Codegen 실패:", e);
  process.exit(1);
});
