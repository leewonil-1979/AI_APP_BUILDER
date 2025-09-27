#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const args = process.argv.slice(2);
const appPath = args[0] || "apps/my_app1";
const deployTarget = args[1] || "docker";

const APP_DIR = path.resolve(process.cwd(), appPath);
const WEB_DIR = path.resolve(APP_DIR, "generated", "web");

function run(command: string, args: string[], options: any = {}) {
  return new Promise<number>((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    proc.on("close", (code) => {
      if (code === 0) resolve(code);
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function deployDocker() {
  console.log("🐳 Docker 배포 시작...");

  // Docker 파일 복사
  const templateDir = path.resolve(process.cwd(), "builder/templates/app");
  fs.copyFileSync(path.join(templateDir, "Dockerfile"), path.join(WEB_DIR, "Dockerfile"));
  fs.copyFileSync(path.join(templateDir, "nginx.conf"), path.join(WEB_DIR, "nginx.conf"));
  fs.copyFileSync(
    path.join(templateDir, "docker-compose.yml"),
    path.join(WEB_DIR, "docker-compose.yml"),
  );

  // 이미지 빌드
  await run("docker", ["build", "-t", "ai-generated-app", "."], { cwd: WEB_DIR });

  // 컨테이너 실행
  await run("docker", ["run", "-d", "-p", "3000:80", "--name", "ai-app", "ai-generated-app"]);

  console.log("✅ 배포 완료! http://localhost:3000 에서 확인하세요.");
}

async function deployStatic() {
  console.log("📦 정적 파일 배포 준비...");

  // 빌드
  await run("npm", ["run", "build"], { cwd: WEB_DIR });

  const distDir = path.join(WEB_DIR, "dist");
  console.log("📁 빌드 결과:", distDir);

  // 간단한 정적 서버 (개발용)
  await run("npx", ["serve", "-s", "dist", "-p", "3000"], { cwd: WEB_DIR });
}

async function main() {
  try {
    if (!fs.existsSync(WEB_DIR)) {
      console.error("❌ 생성된 웹 앱을 찾을 수 없습니다:", WEB_DIR);
      console.error("💡 먼저 코드 생성을 실행해주세요.");
      process.exit(1);
    }

    switch (deployTarget) {
      case "docker":
        await deployDocker();
        break;
      case "static":
        await deployStatic();
        break;
      default:
        console.error("❌ 지원하지 않는 배포 타겟:", deployTarget);
        console.error("💡 사용법: npm run deploy [앱경로] [docker|static]");
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ 배포 실패:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
