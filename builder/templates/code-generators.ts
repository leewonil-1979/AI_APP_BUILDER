// Tier 2: 기술 스택별 코드 템플릿 생성기
import { AppSpec } from "../agents/b_codegen";

export type TechStack = {
  stateManagement: string;
  routing: string;
  ui: string;
  forms: string;
  dataFetching: string;
  styling: string;
};

// =====================================
// 1. 상태관리 코드 생성
// =====================================

export function generateStateManagement(
  spec: AppSpec,
  techStack: TechStack,
): { files: Record<string, string>; imports: string[] } {
  const features = spec.scope?.must_features || [];

  if (techStack.stateManagement === "zustand") {
    return generateZustandStore(spec, features);
  } else if (techStack.stateManagement === "redux") {
    return generateReduxStore(spec, features);
  } else {
    return generateContextAPI(spec, features);
  }
}

function generateZustandStore(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  const appName = spec.idea?.title || "App";
  const stateFields = features
    .map((feature) => `${feature.toLowerCase()}Data: any[]`)
    .join(",\n  ");
  const stateActions = features
    .map(
      (feature) =>
        `add${feature}: (item: any) => set(state => ({ ${feature.toLowerCase()}Data: [...state.${feature.toLowerCase()}Data, item] }))`,
    )
    .join(",\n  ");

  const storeCode = `// Zustand 상태관리 스토어
import { create } from 'zustand';

interface ${appName}Store {
  // 데이터 상태
  ${stateFields},
  
  // 액션 함수들
  ${stateActions},
  reset: () => set({ ${features.map((f) => `${f.toLowerCase()}Data: []`).join(", ")} })
}

export const use${appName}Store = create<${appName}Store>((set) => ({
  // 초기 상태
  ${features.map((f) => `${f.toLowerCase()}Data: []`).join(",\n  ")},
  
  // 액션들
  ${stateActions},
  reset: () => set({ ${features.map((f) => `${f.toLowerCase()}Data: []`).join(", ")} })
}));

// 커스텀 훅들
${features
  .map(
    (feature) => `
export const use${feature} = () => {
  const ${feature.toLowerCase()}Data = use${appName}Store(state => state.${feature.toLowerCase()}Data);
  const add${feature} = use${appName}Store(state => state.add${feature});
  return { ${feature.toLowerCase()}Data, add${feature} };
};`,
  )
  .join("")}`;

  return {
    files: { "src/store/store.ts": storeCode },
    imports: ["import { use${appName}Store } from './store/store'"],
  };
}

function generateReduxStore(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  const appName = spec.idea?.title?.replace(/\s+/g, "") || "App";

  const sliceCode = `// Redux Toolkit 슬라이스
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ${appName}State {
  ${features.map((f) => `${f.toLowerCase()}Data: any[]`).join(";\n  ")};
}

const initialState: ${appName}State = {
  ${features.map((f) => `${f.toLowerCase()}Data: []`).join(",\n  ")}
};

const ${appName.toLowerCase()}Slice = createSlice({
  name: '${appName.toLowerCase()}',
  initialState,
  reducers: {
    ${features
      .map(
        (feature) => `
    add${feature}: (state, action: PayloadAction<any>) => {
      state.${feature.toLowerCase()}Data.push(action.payload);
    }`,
      )
      .join(",")},
    reset: () => initialState
  }
});

export const { ${features.map((f) => `add${f}`).join(", ")}, reset } = ${appName.toLowerCase()}Slice.actions;
export default ${appName.toLowerCase()}Slice.reducer;`;

  const storeCode = `// Redux 스토어 설정
import { configureStore } from '@reduxjs/toolkit';
import ${appName.toLowerCase()}Reducer from './${appName.toLowerCase()}Slice';

export const store = configureStore({
  reducer: {
    ${appName.toLowerCase()}: ${appName.toLowerCase()}Reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;`;

  return {
    files: {
      [`src/store/${appName.toLowerCase()}Slice.ts`]: sliceCode,
      "src/store/store.ts": storeCode,
    },
    imports: [`import { useSelector, useDispatch } from 'react-redux'`],
  };
}

function generateContextAPI(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  const appName = spec.idea?.title?.replace(/\s+/g, "") || "App";

  const contextCode = `// Context API 상태관리
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface ${appName}State {
  ${features.map((f) => `${f.toLowerCase()}Data: any[]`).join(";\n  ")};
}

type ${appName}Action = 
  ${features.map((f) => `| { type: 'ADD_${f.toUpperCase()}'; payload: any }`).join("\n  ")}
  | { type: 'RESET' };

const initialState: ${appName}State = {
  ${features.map((f) => `${f.toLowerCase()}Data: []`).join(",\n  ")}
};

function ${appName.toLowerCase()}Reducer(state: ${appName}State, action: ${appName}Action): ${appName}State {
  switch (action.type) {
    ${features
      .map(
        (feature) => `
    case 'ADD_${feature.toUpperCase()}':
      return {
        ...state,
        ${feature.toLowerCase()}Data: [...state.${feature.toLowerCase()}Data, action.payload]
      };`,
      )
      .join("")}
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const ${appName}Context = createContext<{
  state: ${appName}State;
  dispatch: React.Dispatch<${appName}Action>;
} | null>(null);

export const ${appName}Provider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(${appName.toLowerCase()}Reducer, initialState);
  
  return (
    <${appName}Context.Provider value={{ state, dispatch }}>
      {children}
    </${appName}Context.Provider>
  );
};

export const use${appName}Context = () => {
  const context = useContext(${appName}Context);
  if (!context) {
    throw new Error('use${appName}Context must be used within ${appName}Provider');
  }
  return context;
};`;

  return {
    files: { [`src/context/${appName}Context.tsx`]: contextCode },
    imports: [
      `import { use${appName}Context, ${appName}Provider } from './context/${appName}Context'`,
    ],
  };
}

// =====================================
// 2. UI 컴포넌트 생성
// =====================================

export function generateUIComponents(
  spec: AppSpec,
  techStack: TechStack,
): { files: Record<string, string>; imports: string[] } {
  const features = spec.scope?.must_features || [];

  if (techStack.ui === "chakra") {
    return generateChakraComponents(spec, features);
  } else if (techStack.ui === "material") {
    return generateMaterialComponents(spec, features);
  } else {
    return generateBasicComponents(spec, features);
  }
}

function generateChakraComponents(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  const appName = spec.idea?.title || "App";

  const providerCode = `// Chakra UI 테마 및 프로바이더 설정
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    primary: {
      50: '#E3F2F9',
      100: '#C5E4F3',
      500: '#0078D4',
      600: '#106EBE',
      700: '#005A9E',
    }
  }
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};`;

  const componentFiles: Record<string, string> = { "src/theme/ChakraTheme.tsx": providerCode };

  features.forEach((feature) => {
    const componentCode = `// ${feature} Chakra UI 컴포넌트
import {
  Box, VStack, HStack, Text, Button, Input, Card, CardBody,
  useToast, Modal, ModalOverlay, ModalContent, ModalBody,
  ModalHeader, ModalCloseButton, useDisclosure
} from '@chakra-ui/react';
import { useState } from 'react';

export const ${feature}Component = () => {
  const [data, setData] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const handleAdd = () => {
    if (data.trim()) {
      // 상태관리와 연동할 부분
      console.log('Adding:', data);
      toast({
        title: '${feature} 추가됨',
        description: \`\${data}이(가) 추가되었습니다.\`,
        status: 'success',
        duration: 2000,
      });
      setData('');
      onClose();
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          📱 ${feature}
        </Text>
        
        <Button colorScheme="primary" onClick={onOpen}>
          새 ${feature} 추가
        </Button>
        
        <Card>
          <CardBody>
            <Text>여기에 ${feature} 목록이 표시됩니다.</Text>
          </CardBody>
        </Card>
      </VStack>
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>${feature} 추가</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Input
                placeholder="${feature} 내용을 입력하세요"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
              <HStack>
                <Button colorScheme="primary" onClick={handleAdd}>
                  추가
                </Button>
                <Button onClick={onClose}>취소</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};`;

    componentFiles[`src/components/${feature}Component.tsx`] = componentCode;
  });

  return {
    files: componentFiles,
    imports: [
      "import { ChakraProvider } from '@chakra-ui/react'",
      "import { AppThemeProvider } from './theme/ChakraTheme'",
    ],
  };
}

function generateMaterialComponents(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  const themeCode = `// Material-UI 테마 설정
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};`;

  const componentFiles: Record<string, string> = { "src/theme/MaterialTheme.tsx": themeCode };

  features.forEach((feature) => {
    const componentCode = `// ${feature} Material-UI 컴포넌트
import {
  Box, Paper, Typography, Button, TextField, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import { useState } from 'react';

export const ${feature}Component = () => {
  const [data, setData] = useState('');
  const [open, setOpen] = useState(false);
  
  const handleAdd = () => {
    if (data.trim()) {
      console.log('Adding:', data);
      setData('');
      setOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          📱 ${feature}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpen(true)}
        >
          새 ${feature} 추가
        </Button>
        
        <Card>
          <CardContent>
            <Typography>
              여기에 ${feature} 목록이 표시됩니다.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>${feature} 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="${feature} 내용"
            fullWidth
            variant="outlined"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleAdd} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};`;

    componentFiles[`src/components/${feature}Component.tsx`] = componentCode;
  });

  return {
    files: componentFiles,
    imports: [
      "import { ThemeProvider } from '@mui/material/styles'",
      "import { AppThemeProvider } from './theme/MaterialTheme'",
    ],
  };
}

function generateBasicComponents(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  const componentFiles: Record<string, string> = {};

  features.forEach((feature) => {
    const componentCode = `// ${feature} 기본 React 컴포넌트
import { useState } from 'react';
import './components.css';

export const ${feature}Component = () => {
  const [data, setData] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleAdd = () => {
    if (data.trim()) {
      console.log('Adding:', data);
      setData('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="component-container">
      <h2>📱 ${feature}</h2>
      
      <button 
        className="primary-button"
        onClick={() => setIsModalOpen(true)}
      >
        새 ${feature} 추가
      </button>
      
      <div className="content-card">
        <p>여기에 ${feature} 목록이 표시됩니다.</p>
      </div>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>${feature} 추가</h3>
            <input
              type="text"
              placeholder="${feature} 내용을 입력하세요"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleAdd} className="primary-button">
                추가
              </button>
              <button onClick={() => setIsModalOpen(false)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;

    componentFiles[`src/components/${feature}Component.tsx`] = componentCode;
  });

  // 기본 CSS 스타일도 추가
  const cssCode = `/* 기본 컴포넌트 스타일 */
.component-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.primary-button {
  background: #0078d4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.primary-button:hover {
  background: #106ebe;
}

.content-card {
  background: white;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}`;

  componentFiles["src/components/components.css"] = cssCode;

  return {
    files: componentFiles,
    imports: [],
  };
}

// =====================================
// 3. 라우팅 설정
// =====================================

export function generateRouting(
  spec: AppSpec,
  techStack: TechStack,
): { files: Record<string, string>; imports: string[] } {
  const features = spec.scope?.must_features || [];

  if (techStack.routing === "react-router") {
    return generateReactRouterConfig(spec, features);
  } else {
    return generateSimpleRouting(spec, features);
  }
}

function generateReactRouterConfig(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  const routerCode = `// React Router 설정
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
${features.map((feature) => `import { ${feature}Component } from '../components/${feature}Component';`).join("\n")}

const navigation = [
  ${features.map((feature) => `{ name: '${feature}', path: '/${feature.toLowerCase()}', component: ${feature}Component }`).join(",\n  ")}
];

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="app-navigation">
          <div className="nav-links">
            {navigation.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  \`nav-link \${isActive ? 'active' : ''}\`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/${features[0]?.toLowerCase() || "home"}" replace />} />
            ${features
              .map(
                (feature) =>
                  `<Route path="/${feature.toLowerCase()}" element={<${feature}Component />} />`,
              )
              .join("\n            ")}
            <Route path="*" element={<div>페이지를 찾을 수 없습니다</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};`;

  const routerCss = `/* React Router 네비게이션 스타일 */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-navigation {
  background: #f8f9fa;
  border-bottom: 1px solid #e1e1e1;
  padding: 16px 24px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #e9ecef;
  color: #333;
}

.nav-link.active {
  background: #0078d4;
  color: white;
}

.app-main {
  flex: 1;
  padding: 24px;
}`;

  return {
    files: {
      "src/router/AppRouter.tsx": routerCode,
      "src/router/router.css": routerCss,
    },
    imports: [
      "import { BrowserRouter, Routes, Route } from 'react-router-dom'",
      "import { AppRouter } from './router/AppRouter'",
    ],
  };
}

function generateSimpleRouting(
  spec: AppSpec,
  features: string[],
): { files: Record<string, string>; imports: string[] } {
  // 기본 hash 기반 라우팅은 기존 App.tsx에서 처리
  return { files: {}, imports: [] };
}

// =====================================
// 4. 메인 코드 생성 함수
// =====================================

export function generateTechStackCode(
  spec: AppSpec,
  techStack: TechStack,
): { files: Record<string, string>; mainAppCode: string } {
  const stateCode = generateStateManagement(spec, techStack);
  const uiCode = generateUIComponents(spec, techStack);
  const routingCode = generateRouting(spec, techStack);

  // 모든 파일 병합
  const allFiles = {
    ...stateCode.files,
    ...uiCode.files,
    ...routingCode.files,
  };

  // 메인 App.tsx 코드 생성
  const features = spec.scope?.must_features || [];
  const appName = spec.idea?.title || "App";
  const allImports = [...stateCode.imports, ...uiCode.imports, ...routingCode.imports];

  const mainAppCode = generateMainApp(spec, techStack, features, allImports);

  return {
    files: allFiles,
    mainAppCode,
  };
}

function generateMainApp(
  spec: AppSpec,
  techStack: TechStack,
  features: string[],
  imports: string[],
): string {
  const appTitle = spec.idea?.title || "My App";
  const appDescription = spec.idea?.one_liner || "Generated by AI_APP_BUILDER";

  // 기술 스택에 따른 imports
  const techImports = [];
  const wrapperComponents = [];

  if (techStack.ui === "chakra") {
    techImports.push("import { AppThemeProvider } from './theme/ChakraTheme';");
    wrapperComponents.push("AppThemeProvider");
  } else if (techStack.ui === "material") {
    techImports.push("import { AppThemeProvider } from './theme/MaterialTheme';");
    wrapperComponents.push("AppThemeProvider");
  }

  if (techStack.routing === "react-router") {
    techImports.push("import { AppRouter } from './router/AppRouter';");
  }

  if (techStack.stateManagement === "context") {
    const contextName = spec.idea?.title?.replace(/\s+/g, "") || "App";
    techImports.push(`import { ${contextName}Provider } from './context/${contextName}Context';`);
    wrapperComponents.push(`${contextName}Provider`);
  } else if (techStack.stateManagement === "redux") {
    techImports.push(`import { Provider } from 'react-redux';`);
    techImports.push(`import { store } from './store/store';`);
    wrapperComponents.push("Provider");
  }

  const componentImports = features
    .map((feature) => `import { ${feature}Component } from './components/${feature}Component';`)
    .join("\n");

  // Wrapper 컴포넌트들을 중첩으로 구성
  let appContent;
  if (techStack.routing === "react-router") {
    appContent = `<AppRouter />`;
  } else {
    // 기존 simple routing 방식
    appContent = `
    <div className="App">
      <header className="App-header">
        <h1>${appTitle}</h1>
        <p>${appDescription}</p>
      </header>
      
      <nav className="App-nav">
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
    </div>`;
  }

  // Provider들로 감싸기
  let wrappedContent = appContent;
  wrapperComponents.reverse().forEach((wrapper) => {
    if (wrapper === "Provider") {
      wrappedContent = `<Provider store={store}>${wrappedContent}</Provider>`;
    } else {
      wrappedContent = `<${wrapper}>${wrappedContent}</${wrapper}>`;
    }
  });

  const stateHook =
    techStack.routing !== "react-router"
      ? `
  const [currentPage, setCurrentPage] = useState('${features[0] || "home"}');

  const renderPage = () => {
    switch(currentPage) {
      ${features
        .map(
          (feature) => `
      case '${feature}':
        return <${feature}Component />;`,
        )
        .join("")}
      default:
        return <div>페이지를 찾을 수 없습니다</div>;
    }
  };`
      : "";

  return `// <gen:begin main-app>
import { useState } from 'react';
import './App.css';
${techImports.join("\n")}
${componentImports}

function App() {${stateHook}

  return (
    ${wrappedContent}
  );
}

export default App;
// <gen:end main-app>`;
}
