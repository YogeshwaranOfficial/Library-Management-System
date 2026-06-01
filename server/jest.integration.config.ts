import type { JestConfigWithTsJest } from 'ts-jest';

const integrationConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm', 
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Widened to src
  testMatch: [
    '<rootDir>/src/**/*.test.ts' // Matches integration files anywhere in src
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

export default integrationConfig;