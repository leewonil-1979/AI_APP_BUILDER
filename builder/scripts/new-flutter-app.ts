#!/usr/bin/env tsx
import { promises as fs } from "fs";
import { join } from "path";
import { FlutterAgent, FlutterAppSpec } from "../agents/flutter_agent.js";

async function createNewFlutterApp() {
  const appName = process.argv[2];

  if (!appName) {
    console.error("❌ Error: App name is required");
    console.log("Usage: npm run flutter:new <app-name>");
    console.log("Example: npm run flutter:new my_awesome_app");
    process.exit(1);
  }

  console.log(`🚀 Creating new Flutter app: ${appName}`);

  try {
    // 앱 스펙 생성 (기본값)
    const spec: FlutterAppSpec = {
      name: appName,
      packageName: `com.example.${appName}`,
      description: `A new Flutter application: ${appName}`,
      template: "basic",
      features: {
        stateManagement: "riverpod",
        navigation: "goRouter",
        database: "sqlite",
        auth: false,
        ml: false,
        ar: false,
        camera: false,
        location: false,
      },
      platforms: {
        android: {
          minSdk: 21,
          targetSdk: 34,
          compileSdk: 34,
        },
        ios: {
          minVersion: "12.0",
          targetVersion: "17.0",
        },
      },
    };

    // Flutter Agent로 앱 생성
    const builderRoot = process.cwd();
    const outputPath = join(builderRoot, "apps");
    const agent = new FlutterAgent(builderRoot);

    // 출력 디렉토리 확인
    await fs.mkdir(outputPath, { recursive: true });

    // 앱 생성
    await agent.createApp(spec, outputPath);

    console.log(`✅ Flutter app '${appName}' created successfully!`);
    console.log(`📁 Location: ${join(outputPath, appName)}`);
    console.log(`\n🚀 Next steps:`);
    console.log(`  cd apps/${appName}`);
    console.log(`  flutter pub get`);
    console.log(`  flutter run`);
  } catch (error) {
    console.error("❌ Error creating Flutter app:", error);
    process.exit(1);
  }
}

// AR 앱 생성 함수
async function createARApp(appName: string) {
  console.log(`🎯 Creating AR Flutter app: ${appName}`);

  const spec: FlutterAppSpec = {
    name: appName,
    packageName: `com.example.${appName}`,
    description: `An AR Flutter application: ${appName}`,
    template: "ar",
    features: {
      stateManagement: "riverpod",
      navigation: "goRouter",
      database: "sqlite",
      auth: false,
      ml: false,
      ar: true,
      camera: true,
      location: false,
    },
    platforms: {
      android: {
        minSdk: 24, // AR 최소 요구사항
        targetSdk: 34,
        compileSdk: 34,
      },
      ios: {
        minVersion: "12.0", // ARKit 최소 요구사항
        targetVersion: "17.0",
      },
    },
  };

  const builderRoot = process.cwd();
  const outputPath = join(builderRoot, "apps");
  const agent = new FlutterAgent(builderRoot);

  await fs.mkdir(outputPath, { recursive: true });
  await agent.createApp(spec, outputPath);

  console.log(`✅ AR Flutter app '${appName}' created successfully!`);
  console.log(`📁 Location: ${join(outputPath, appName)}`);
  console.log(`\n🚀 Next steps:`);
  console.log(`  cd apps/${appName}`);
  console.log(`  flutter pub get`);
  console.log(`  flutter run`);
  console.log(`\n📱 AR Requirements:`);
  console.log(`  - ARCore compatible Android device (API 24+)`);
  console.log(`  - ARKit compatible iOS device (iOS 12+)`);
}

// 대화형 앱 생성
async function createInteractiveApp() {
  console.log("🎨 Interactive Flutter App Creator");
  console.log("==================================");

  // 여기에 대화형 입력 로직 추가 가능
  // 지금은 기본 앱 생성으로 처리
  await createNewFlutterApp();
}

// 메인 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const appName = process.argv[3];

  switch (command) {
    case "--ar":
      if (!appName) {
        console.error("❌ Error: App name is required for AR app");
        process.exit(1);
      }
      await createARApp(appName);
      break;
    case "--interactive":
      await createInteractiveApp();
      break;
    default:
      await createNewFlutterApp();
      break;
  }
}
