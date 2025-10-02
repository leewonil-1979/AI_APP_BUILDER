// 패키지 선택 및 버전 해결 유틸리티
import https from "https";
import { promisify } from "util";

type PackageInfo = {
  name: string;
  version: string;
  description?: string;
  weeklyDownloads?: number;
  lastModified?: string;
};

type PackageChoice = {
  name: string;
  alternatives?: string[];
  category: "stateManagement" | "routing" | "ui" | "forms" | "dataFetching" | "styling";
};

// NPM API를 통해 패키지 정보 조회
async function fetchPackageInfo(packageName: string): Promise<PackageInfo | null> {
  return new Promise((resolve) => {
    const url = `https://registry.npmjs.org/${packageName}/latest`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const packageData = JSON.parse(data);
            resolve({
              name: packageData.name,
              version: packageData.version,
              description: packageData.description,
            });
          } catch (error) {
            console.warn(`패키지 정보 조회 실패: ${packageName}`);
            resolve(null);
          }
        });
      })
      .on("error", () => {
        console.warn(`패키지 정보 조회 실패: ${packageName}`);
        resolve(null);
      });
  });
}

// 복잡도와 타입에 따른 최적 패키지 선택 규칙
const PACKAGE_RECOMMENDATIONS = {
  stateManagement: {
    simple: { primary: null, fallback: null }, // Context API 사용
    standard: { primary: "zustand", fallback: "valtio" },
    advanced: { primary: "@reduxjs/toolkit", fallback: "zustand" },
    pro: { primary: "@reduxjs/toolkit", fallback: "recoil" },
  },
  routing: {
    simple: { primary: null, fallback: null }, // Hash 기반 사용
    standard: { primary: "react-router-dom", fallback: "wouter" },
    advanced: { primary: "react-router-dom", fallback: "@reach/router" },
    pro: { primary: "react-router-dom", fallback: "next/router" },
  },
  ui: {
    simple: { primary: null, fallback: null }, // 기본 CSS 사용
    standard: { primary: "@chakra-ui/react", fallback: "@mantine/core" },
    advanced: { primary: "@mui/material", fallback: "antd" },
    pro: { primary: "@mui/material", fallback: "react-spectrum" },
  },
  forms: {
    simple: { primary: null, fallback: null }, // 기본 form 사용
    standard: { primary: "react-hook-form", fallback: "formik" },
    advanced: { primary: "react-hook-form", fallback: "@hookform/resolvers" },
    pro: { primary: "react-hook-form", fallback: "final-form" },
  },
  dataFetching: {
    simple: { primary: null, fallback: null }, // fetch 사용
    standard: { primary: "@tanstack/react-query", fallback: "swr" },
    advanced: { primary: "@tanstack/react-query", fallback: "apollo-client" },
    pro: { primary: "@apollo/client", fallback: "@tanstack/react-query" },
  },
  styling: {
    simple: { primary: null, fallback: null }, // 기본 CSS
    standard: { primary: "tailwindcss", fallback: "styled-components" },
    advanced: { primary: "@emotion/react", fallback: "styled-components" },
    pro: { primary: "styled-system", fallback: "@emotion/react" },
  },
};

// 패키지 선택 및 버전 해결
export async function resolvePackages(
  complexity: "simple" | "standard" | "advanced" | "pro",
  features: Record<string, any>,
): Promise<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }> {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  // 상태관리 패키지 해결
  if (features.stateManagement !== "basic") {
    const stateChoice = PACKAGE_RECOMMENDATIONS.stateManagement[complexity];
    if (stateChoice.primary) {
      const packageInfo = await fetchPackageInfo(stateChoice.primary);
      if (packageInfo) {
        dependencies[packageInfo.name] = `^${packageInfo.version}`;
        console.log(`📦 상태관리: ${packageInfo.name}@${packageInfo.version}`);
      } else if (stateChoice.fallback) {
        const fallbackInfo = await fetchPackageInfo(stateChoice.fallback);
        if (fallbackInfo) {
          dependencies[fallbackInfo.name] = `^${fallbackInfo.version}`;
          console.log(`📦 상태관리 (대체): ${fallbackInfo.name}@${fallbackInfo.version}`);
        }
      }
    }
  }

  // 라우팅 패키지 해결
  if (features.routing !== "simple") {
    const routingChoice = PACKAGE_RECOMMENDATIONS.routing[complexity];
    if (routingChoice.primary) {
      const packageInfo = await fetchPackageInfo(routingChoice.primary);
      if (packageInfo) {
        dependencies[packageInfo.name] = `^${packageInfo.version}`;
        console.log(`📦 라우팅: ${packageInfo.name}@${packageInfo.version}`);

        // react-router-dom의 경우 타입도 필요
        if (packageInfo.name === "react-router-dom") {
          const typesInfo = await fetchPackageInfo("@types/react-router-dom");
          if (typesInfo) {
            devDependencies["@types/react-router-dom"] = `^${typesInfo.version}`;
          }
        }
      }
    }
  }

  // UI 라이브러리 해결
  if (features.ui !== "minimal") {
    const uiChoice = PACKAGE_RECOMMENDATIONS.ui[complexity];
    if (uiChoice.primary) {
      const packageInfo = await fetchPackageInfo(uiChoice.primary);
      if (packageInfo) {
        dependencies[packageInfo.name] = `^${packageInfo.version}`;
        console.log(`📦 UI: ${packageInfo.name}@${packageInfo.version}`);

        // Chakra UI의 경우 추가 패키지 필요
        if (packageInfo.name === "@chakra-ui/react") {
          const emotionReact = await fetchPackageInfo("@emotion/react");
          const emotionStyled = await fetchPackageInfo("@emotion/styled");
          const framerMotion = await fetchPackageInfo("framer-motion");

          if (emotionReact) dependencies["@emotion/react"] = `^${emotionReact.version}`;
          if (emotionStyled) dependencies["@emotion/styled"] = `^${emotionStyled.version}`;
          if (framerMotion) dependencies["framer-motion"] = `^${framerMotion.version}`;
        }

        // Material-UI의 경우 추가 패키지 필요
        if (packageInfo.name === "@mui/material") {
          const muiIcons = await fetchPackageInfo("@mui/icons-material");
          const emotionReact = await fetchPackageInfo("@emotion/react");
          const emotionStyled = await fetchPackageInfo("@emotion/styled");

          if (muiIcons) dependencies["@mui/icons-material"] = `^${muiIcons.version}`;
          if (emotionReact) dependencies["@emotion/react"] = `^${emotionReact.version}`;
          if (emotionStyled) dependencies["@emotion/styled"] = `^${emotionStyled.version}`;
        }
      }
    }
  }

  // Forms 패키지 해결
  if (features.forms !== "basic") {
    const formsChoice = PACKAGE_RECOMMENDATIONS.forms[complexity];
    if (formsChoice.primary) {
      const packageInfo = await fetchPackageInfo(formsChoice.primary);
      if (packageInfo) {
        dependencies[packageInfo.name] = `^${packageInfo.version}`;
        console.log(`📦 Forms: ${packageInfo.name}@${packageInfo.version}`);

        // react-hook-form의 경우 zod도 추가
        if (packageInfo.name === "react-hook-form" && complexity !== "simple") {
          const zodInfo = await fetchPackageInfo("zod");
          const resolverInfo = await fetchPackageInfo("@hookform/resolvers");

          if (zodInfo) dependencies["zod"] = `^${zodInfo.version}`;
          if (resolverInfo) dependencies["@hookform/resolvers"] = `^${resolverInfo.version}`;
        }
      }
    }
  }

  // 데이터 페칭 패키지 해결
  if (features.dataFetching !== "fetch") {
    const dataChoice = PACKAGE_RECOMMENDATIONS.dataFetching[complexity];
    if (dataChoice.primary) {
      const packageInfo = await fetchPackageInfo(dataChoice.primary);
      if (packageInfo) {
        dependencies[packageInfo.name] = `^${packageInfo.version}`;
        console.log(`📦 데이터 페칭: ${packageInfo.name}@${packageInfo.version}`);
      }
    }
  }

  // 스타일링 패키지 해결
  if (features.styling && features.styling !== "css") {
    const stylingChoice = PACKAGE_RECOMMENDATIONS.styling[complexity];
    if (stylingChoice.primary) {
      const packageInfo = await fetchPackageInfo(stylingChoice.primary);
      if (packageInfo) {
        if (packageInfo.name === "tailwindcss") {
          devDependencies[packageInfo.name] = `^${packageInfo.version}`;
          const autoprefixer = await fetchPackageInfo("autoprefixer");
          const postcss = await fetchPackageInfo("postcss");
          if (autoprefixer) devDependencies["autoprefixer"] = `^${autoprefixer.version}`;
          if (postcss) devDependencies["postcss"] = `^${postcss.version}`;
        } else {
          dependencies[packageInfo.name] = `^${packageInfo.version}`;
        }
        console.log(`📦 스타일링: ${packageInfo.name}@${packageInfo.version}`);
      }
    }
  }

  return { dependencies, devDependencies };
}

// 기본 React 패키지들 (항상 포함)
export const BASE_DEPENDENCIES = {
  react: "^18.2.0",
  "react-dom": "^18.2.0",
};

export const BASE_DEV_DEPENDENCIES = {
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
};
