/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/builder'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'CommonJS',
        moduleResolution: 'Node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        skipLibCheck: true,
        isolatedModules: true,
        types: ['node', 'jest']
      }
    }],
  },
  collectCoverageFrom: [
    'builder/**/*.ts',
    '!builder/**/*.d.ts',
    '!builder/**/__tests__/**',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};
