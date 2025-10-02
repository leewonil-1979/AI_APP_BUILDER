//목표: generated/web에서 npm i -> build -> 간단 리포트
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

// 번들 사이즈 체크 함수
function formatBytes(bytes: number): string {
  return (bytes / 1024).toFixed(1) + "KB";
}

function checkBundleSize(distDir: string): number {
  const assetsDir = path.join(distDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    console.warn("⚠️ assets 폴더가 없습니다");
    return 0;
  }

  const files = fs.readdirSync(assetsDir).filter((f) => /\.(js|css)$/.test(f));
  let totalSize = 0;
  let maxSize = 0;
  let worstFile = "";

  console.log("📊 번들 분석:");
  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    const size = fs.statSync(filePath).size;
    totalSize += size;

    console.log(`  ${file}: ${formatBytes(size)}`);

    if (size > maxSize) {
      maxSize = size;
      worstFile = file;
    }
  }

  // 임계치 설정
  const TOTAL_LIMIT = 500 * 1024; // 500KB
  const CHUNK_LIMIT = 300 * 1024; // 300KB

  console.log(`📈 총 크기: ${formatBytes(totalSize)}`);
  console.log(`📈 최대 청크: ${formatBytes(maxSize)} (${worstFile})`);

  let status = 0;
  if (totalSize > TOTAL_LIMIT) {
    console.log(`⚠️ 총 번들 크기가 권장치(${formatBytes(TOTAL_LIMIT)})를 초과했습니다`);
    status = 1;
  }
  if (maxSize > CHUNK_LIMIT) {
    console.log(`⚠️ 단일 청크 크기가 권장치(${formatBytes(CHUNK_LIMIT)})를 초과했습니다`);
    status = 1;
  }
  if (status === 0) {
    console.log("✅ 번들 크기가 권장 범위 내입니다");
  }

  return status;
}

// 명령행 인수에서 appPath 가져오기
const args = process.argv.slice(2);
const appPathIndex = args.indexOf("--appPath");
const appPath = appPathIndex >= 0 ? args[appPathIndex + 1] : ".";

const APP_DIR = path.resolve(process.cwd(), appPath);
const OUT_DIR = path.resolve(APP_DIR, "generated", "web");

function run(cmd: string, args: string[], cwd: string) {
  console.log(`🔧 실행 중: ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  return r.status ?? 1;
}

function ensurePkgJson() {
  const pj = path.join(OUT_DIR, "package.json");
  if (!fs.existsSync(pj)) {
    console.error("❌ package.json을 찾을 수 없습니다:", OUT_DIR);
    console.error("💡 힌트: 먼저 b:codegen을 실행해주세요.");
    return false;
  }
  return true;
}

function checkGeneratedFiles() {
  const requiredFiles = [
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "index.html",
    "src/main.tsx",
    "src/App.tsx",
  ];

  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(OUT_DIR, file)));

  if (missing.length > 0) {
    console.error("❌ 필수 파일이 누락되었습니다:", missing);
    return false;
  }

  console.log("✅ 모든 필수 파일이 존재합니다.");
  return true;
}

async function main() {
  console.log("🔍 C(verify) 시작...");

  if (!ensurePkgJson() || !checkGeneratedFiles()) {
    process.exit(1);
  }

  let status = 0;
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    status: "unknown",
    errors: [],
  };

  try {
    // Step 1: npm install
    console.log("📦 의존성 설치 중...");
    status = run("npm", ["install"], OUT_DIR);
    results.steps.push({
      name: "npm install",
      status: status === 0 ? "success" : "failed",
      exitCode: status,
    });

    if (status !== 0) {
      results.errors.push("npm install failed");
      throw new Error("npm install 실패");
    }

    // Step 2: TypeScript 컴파일 체크 (strict)
    console.log("🔧 TypeScript 컴파일 체크...");
    status = run("npx", ["tsc", "--noEmit", "--strict"], OUT_DIR);
    results.steps.push({
      name: "typescript check",
      status: status === 0 ? "success" : "warning",
      exitCode: status,
    });

    if (status !== 0) {
      console.log("⚠️ TypeScript 컴파일 경고가 있지만 계속 진행합니다.");
      results.errors.push("TypeScript compilation warnings");
    }

    // Step 2.5: Lint 검사 (있는 경우)
    console.log("🧹 ESLint 검사...");
    status = run("npm", ["run", "lint", "--", "--max-warnings", "0"], OUT_DIR);
    results.steps.push({
      name: "lint check",
      status: status === 0 ? "success" : "warning",
      exitCode: status,
    });

    if (status !== 0) {
      console.log("⚠️ Lint 경고가 있지만 계속 진행합니다.");
      results.errors.push("ESLint warnings found");
    }

    // Step 3: Build
    console.log("🏗️ 빌드 실행 중...");
    status = run("npm", ["run", "build"], OUT_DIR);
    results.steps.push({
      name: "build",
      status: status === 0 ? "success" : "failed",
      exitCode: status,
    });

    if (status !== 0) {
      results.errors.push("Build failed");
      throw new Error("빌드 실패");
    }

    // Step 4: 빌드 결과 확인 + 성능 체크
    const distDir = path.join(OUT_DIR, "dist");
    if (fs.existsSync(distDir)) {
      const distFiles = fs.readdirSync(distDir);
      console.log("📁 빌드 결과물:", distFiles);
      results.buildOutput = {
        distDir: distDir,
        files: distFiles,
      };

      // Step 4.5: 번들 사이즈 체크
      console.log("📊 번들 사이즈 분석...");
      const bundleStatus = checkBundleSize(distDir);
      results.steps.push({
        name: "bundle size check",
        status: bundleStatus === 0 ? "success" : "warning",
        exitCode: bundleStatus,
      });

      if (bundleStatus !== 0) {
        console.log("⚠️ 번들 사이즈가 권장 크기를 초과했지만 계속 진행합니다.");
        results.errors.push("Bundle size exceeded recommended limits");
      }
    }

    results.status = "success";
    console.log("✅ 모든 검증 단계 완료!");
  } catch (error) {
    results.status = "failed";
    results.error = error instanceof Error ? error.message : String(error);
    console.error("❌ 검증 실패:", error);
  }

  // 리포트 생성
  const outDir = path.join(process.cwd(), "out");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "qa.report.json"), JSON.stringify(results, null, 2));

  // 성공/실패에 따른 상세 리포트
  const reportContent = `# 검증 및 최적화 리포트

## 실행 시간
${results.timestamp}

## 검증 단계
${results.steps
  .map((step: any) => `- **${step.name}**: ${step.status} (exit code: ${step.exitCode})`)
  .join("\n")}

## 최종 상태
**${results.status.toUpperCase()}**

${results.errors.length > 0 ? `## 발견된 문제\n${results.errors.map((e: string) => `- ${e}`).join("\n")}` : ""}

${results.buildOutput ? `## 빌드 결과물\n- 위치: \`${results.buildOutput.distDir}\`\n- 파일: ${results.buildOutput.files.join(", ")}` : ""}

## 실행 방법
\`\`\`bash
cd ${OUT_DIR}
npm run dev
\`\`\`

## 미리보기
\`\`\`bash
cd ${OUT_DIR}
npm run preview
\`\`\`
`;

  fs.writeFileSync(path.join(outDir, "verify.report.md"), reportContent);

  console.log("📄 C(verify) 완료 -> out/qa.report.json, out/verify.report.md");

  if (results.status === "failed") {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌ Verify 에러:", e);
  process.exit(1);
});
