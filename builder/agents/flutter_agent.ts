import { promises as fs } from "fs";
import { join } from "path";
import { execSync } from "child_process";

export interface FlutterAppSpec {
  name: string;
  packageName: string;
  description: string;
  template: "basic" | "ar" | "ml" | "ecommerce" | "social";
  features: {
    stateManagement: "riverpod" | "bloc" | "provider";
    navigation: "goRouter" | "navigator";
    database: "sqlite" | "hive" | "isar" | "firestore";
    auth: boolean;
    ml: boolean;
    ar: boolean;
    camera: boolean;
    location: boolean;
  };
  platforms: {
    android: {
      minSdk: number;
      targetSdk: number;
      compileSdk: number;
    };
    ios: {
      minVersion: string;
      targetVersion: string;
    };
  };
}

export class FlutterAgent {
  private builderRoot: string;

  constructor(builderRoot: string) {
    this.builderRoot = builderRoot;
  }

  /**
   * 새로운 Flutter 앱 생성
   */
  async createApp(spec: FlutterAppSpec, outputPath: string): Promise<void> {
    console.log(`🚀 Creating Flutter app: ${spec.name}`);

    // 1. Flutter 프로젝트 생성
    await this.createFlutterProject(spec, outputPath);

    // 2. 템플릿 적용
    await this.applyTemplate(spec, outputPath);

    // 3. 의존성 설정
    await this.setupDependencies(spec, outputPath);

    // 4. 플랫폼 설정
    await this.configurePlatforms(spec, outputPath);

    // 5. 코드 생성
    await this.generateCode(spec, outputPath);

    // 6. 최종 검증
    await this.validateProject(outputPath);

    console.log(`✅ Flutter app '${spec.name}' created successfully!`);
  }

  /**
   * Flutter 프로젝트 생성
   */
  private async createFlutterProject(spec: FlutterAppSpec, outputPath: string): Promise<void> {
    try {
      // Flutter가 설치되어 있는지 확인
      execSync("flutter --version", { stdio: "pipe" });

      // Flutter 프로젝트 생성
      execSync(
        `flutter create ${spec.name} --org ${this.getOrgFromPackageName(spec.packageName)}`,
        {
          cwd: outputPath,
          stdio: "inherit",
        },
      );
    } catch (error) {
      throw new Error(`Flutter project creation failed: ${error}`);
    }
  }

  /**
   * 템플릿 적용
   */
  private async applyTemplate(spec: FlutterAppSpec, outputPath: string): Promise<void> {
    const templatePath = join(this.builderRoot, "templates", `flutter@${spec.template}`);
    const appPath = join(outputPath, spec.name);

    try {
      // 템플릿 파일들 복사
      await this.copyTemplate(templatePath, appPath);

      // 템플릿 변수 치환
      await this.replaceTemplateVariables(appPath, spec);
    } catch (error) {
      throw new Error(`Template application failed: ${error}`);
    }
  }

  /**
   * 의존성 설정
   */
  private async setupDependencies(spec: FlutterAppSpec, outputPath: string): Promise<void> {
    const appPath = join(outputPath, spec.name);
    const pubspecPath = join(appPath, "pubspec.yaml");

    // 기본 의존성
    const dependencies = this.generateDependencies(spec);

    // pubspec.yaml 업데이트
    await this.updatePubspec(pubspecPath, dependencies);

    // flutter pub get 실행
    execSync("flutter pub get", {
      cwd: appPath,
      stdio: "inherit",
    });
  }

  /**
   * 플랫폼별 설정
   */
  private async configurePlatforms(spec: FlutterAppSpec, outputPath: string): Promise<void> {
    const appPath = join(outputPath, spec.name);

    // Android 설정
    await this.configureAndroid(appPath, spec);

    // iOS 설정
    await this.configureIOS(appPath, spec);
  }

  /**
   * Android 설정
   */
  private async configureAndroid(appPath: string, spec: FlutterAppSpec): Promise<void> {
    const buildGradlePath = join(appPath, "android", "app", "build.gradle");

    let buildGradleContent = await fs.readFile(buildGradlePath, "utf-8");

    // minSdkVersion 설정
    buildGradleContent = buildGradleContent.replace(
      /minSdkVersion\s+\d+/,
      `minSdkVersion ${spec.platforms.android.minSdk}`,
    );

    // targetSdkVersion 설정
    buildGradleContent = buildGradleContent.replace(
      /targetSdkVersion\s+\d+/,
      `targetSdkVersion ${spec.platforms.android.targetSdk}`,
    );

    // compileSdkVersion 설정
    buildGradleContent = buildGradleContent.replace(
      /compileSdkVersion\s+\d+/,
      `compileSdkVersion ${spec.platforms.android.compileSdk}`,
    );

    // 권한 추가
    const permissions = this.generateAndroidPermissions(spec);
    if (permissions.length > 0) {
      const manifestPath = join(appPath, "android", "app", "src", "main", "AndroidManifest.xml");
      await this.addAndroidPermissions(manifestPath, permissions);
    }

    await fs.writeFile(buildGradlePath, buildGradleContent);
  }

  /**
   * iOS 설정
   */
  private async configureIOS(appPath: string, spec: FlutterAppSpec): Promise<void> {
    const infoPlistPath = join(appPath, "ios", "Runner", "Info.plist");

    // iOS 권한 추가
    const permissions = this.generateIOSPermissions(spec);
    if (permissions.length > 0) {
      await this.addIOSPermissions(infoPlistPath, permissions);
    }
  }

  /**
   * 코드 생성
   */
  private async generateCode(spec: FlutterAppSpec, outputPath: string): Promise<void> {
    const appPath = join(outputPath, spec.name);

    // main.dart 생성
    await this.generateMainDart(appPath, spec);

    // app.dart 생성
    await this.generateAppDart(appPath, spec);

    // 상태 관리 코드 생성
    await this.generateStateManagement(appPath, spec);

    // 네비게이션 코드 생성
    await this.generateNavigation(appPath, spec);

    // 기능별 코드 생성
    if (spec.features.ar) {
      await this.generateARCode(appPath, spec);
    }

    if (spec.features.ml) {
      await this.generateMLCode(appPath, spec);
    }
  }

  /**
   * 의존성 생성
   */
  private generateDependencies(spec: FlutterAppSpec): Record<string, any> {
    const dependencies: Record<string, any> = {
      flutter: { sdk: "flutter" },
      cupertino_icons: "^1.0.2",
    };

    // 상태 관리
    switch (spec.features.stateManagement) {
      case "riverpod":
        dependencies["flutter_riverpod"] = "^2.4.9";
        dependencies["riverpod_annotation"] = "^2.3.3";
        break;
      case "bloc":
        dependencies["flutter_bloc"] = "^8.1.3";
        dependencies["bloc"] = "^8.1.2";
        break;
      case "provider":
        dependencies["provider"] = "^6.1.1";
        break;
    }

    // 네비게이션
    if (spec.features.navigation === "goRouter") {
      dependencies["go_router"] = "^12.1.3";
    }

    // 데이터베이스
    switch (spec.features.database) {
      case "sqlite":
        dependencies["sqflite"] = "^2.3.0";
        break;
      case "hive":
        dependencies["hive"] = "^2.2.3";
        dependencies["hive_flutter"] = "^1.1.0";
        break;
      case "isar":
        dependencies["isar"] = "^3.1.0+1";
        dependencies["isar_flutter_libs"] = "^3.1.0+1";
        break;
      case "firestore":
        dependencies["cloud_firestore"] = "^4.13.6";
        break;
    }

    // AR 기능
    if (spec.features.ar) {
      dependencies["ar_flutter_plugin"] = "^0.7.3";
      dependencies["vector_math"] = "^2.1.4";
    }

    // ML 기능
    if (spec.features.ml) {
      dependencies["google_mlkit_pose_detection"] = "^0.12.0";
      dependencies["google_mlkit_face_detection"] = "^0.10.1";
      dependencies["tflite_flutter"] = "^0.10.4";
    }

    // 카메라
    if (spec.features.camera) {
      dependencies["camera"] = "^0.11.0+2";
      dependencies["image_picker"] = "^1.0.4";
    }

    // 위치
    if (spec.features.location) {
      dependencies["geolocator"] = "^10.1.0";
      dependencies["geocoding"] = "^2.1.1";
    }

    // 인증
    if (spec.features.auth) {
      dependencies["firebase_auth"] = "^4.15.3";
      dependencies["google_sign_in"] = "^6.1.6";
    }

    // 기타 유용한 패키지들
    dependencies["http"] = "^1.1.2";
    dependencies["shared_preferences"] = "^2.2.2";
    dependencies["path_provider"] = "^2.1.1";
    dependencies["permission_handler"] = "^11.1.0";

    return dependencies;
  }

  /**
   * Android 권한 생성
   */
  private generateAndroidPermissions(spec: FlutterAppSpec): string[] {
    const permissions: string[] = [];

    if (spec.features.camera) {
      permissions.push("android.permission.CAMERA");
      permissions.push("android.permission.WRITE_EXTERNAL_STORAGE");
    }

    if (spec.features.location) {
      permissions.push("android.permission.ACCESS_FINE_LOCATION");
      permissions.push("android.permission.ACCESS_COARSE_LOCATION");
    }

    if (spec.features.ar) {
      permissions.push("android.permission.CAMERA");
      permissions.push("android.permission.WRITE_EXTERNAL_STORAGE");
    }

    return permissions;
  }

  /**
   * iOS 권한 생성
   */
  private generateIOSPermissions(spec: FlutterAppSpec): Array<{ key: string; value: string }> {
    const permissions: Array<{ key: string; value: string }> = [];

    if (spec.features.camera) {
      permissions.push({
        key: "NSCameraUsageDescription",
        value: "This app needs camera access to take photos and videos.",
      });
      permissions.push({
        key: "NSPhotoLibraryUsageDescription",
        value: "This app needs photo library access to save images.",
      });
    }

    if (spec.features.location) {
      permissions.push({
        key: "NSLocationWhenInUseUsageDescription",
        value: "This app needs location access to provide location-based services.",
      });
    }

    if (spec.features.ar) {
      permissions.push({
        key: "NSCameraUsageDescription",
        value: "This app uses camera for AR functionality.",
      });
    }

    return permissions;
  }

  // 유틸리티 메서드들
  private getOrgFromPackageName(packageName: string): string {
    const parts = packageName.split(".");
    return parts.slice(0, -1).join(".");
  }

  private async copyTemplate(templatePath: string, destPath: string): Promise<void> {
    // 템플릿 복사 로직 구현
  }

  private async replaceTemplateVariables(appPath: string, spec: FlutterAppSpec): Promise<void> {
    // 템플릿 변수 치환 로직 구현
  }

  private async updatePubspec(
    pubspecPath: string,
    dependencies: Record<string, any>,
  ): Promise<void> {
    // pubspec.yaml 업데이트 로직 구현
  }

  private async addAndroidPermissions(manifestPath: string, permissions: string[]): Promise<void> {
    // Android 권한 추가 로직 구현
  }

  private async addIOSPermissions(
    infoPlistPath: string,
    permissions: Array<{ key: string; value: string }>,
  ): Promise<void> {
    // iOS 권한 추가 로직 구현
  }

  private async generateMainDart(appPath: string, spec: FlutterAppSpec): Promise<void> {
    // main.dart 생성 로직 구현
  }

  private async generateAppDart(appPath: string, spec: FlutterAppSpec): Promise<void> {
    // app.dart 생성 로직 구현
  }

  private async generateStateManagement(appPath: string, spec: FlutterAppSpec): Promise<void> {
    // 상태 관리 코드 생성 로직 구현
  }

  private async generateNavigation(appPath: string, spec: FlutterAppSpec): Promise<void> {
    // 네비게이션 코드 생성 로직 구현
  }

  private async generateARCode(appPath: string, spec: FlutterAppSpec): Promise<void> {
    // AR 코드 생성 로직 구현
  }

  private async generateMLCode(appPath: string, spec: FlutterAppSpec): Promise<void> {
    // ML 코드 생성 로직 구현
  }

  private async validateProject(outputPath: string): Promise<void> {
    // 프로젝트 검증 로직 구현
  }
}
