import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm', 
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  // Scan across your entire testing root
  roots: ['<rootDir>/src/tests'], 
  testMatch: [
    '**/*.spec.ts', // Unit files
    '**/*.test.ts'  // Integration files
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: {
          ignoreCodes: [1343]
        },
      },
    ],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
};

export default jestConfig;