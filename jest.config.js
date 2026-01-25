export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/public/js', '<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  moduleFileExtensions: ['js'],
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
