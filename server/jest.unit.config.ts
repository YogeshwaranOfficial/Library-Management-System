import type { JestConfigWithTsJest } from 'ts-jest';

const unitConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm', 
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  // 1. Widen the scope to scan the entire src directory
  roots: ['<rootDir>/src'], 
  // 2. Match any .spec.ts file anywhere inside the src directory
  testMatch: [
    '<rootDir>/src/**/*.spec.ts' 
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
  collectCoverage: false, 
};

export default unitConfig;