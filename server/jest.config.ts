import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  // 1. ESM Compatibility Settings (The Lifesavers)
  preset: 'ts-jest/presets/default-esm', 
  extensionsToTreatAsEsm: ['.ts'],
  
  // 2. Environment & Structure Settings
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'], // Keeps Jest focused on your tests folder
  moduleFileExtensions: ['ts', 'js', 'json'],

  // 3. The Path Mapper (Fixes the explicit '.js' import extensions)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // 4. TS-Jest Compiler Configuration
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true, // Forces ts-jest to compile with ESM compliance
      },
    ],
  },

  // 5. Code Coverage Settings (From your original config)
  collectCoverage: true,
  coverageDirectory: 'coverage',
};

export default jestConfig;