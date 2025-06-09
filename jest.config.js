module.exports = {
    testEnvironment: 'jest-environment-jsdom', // Use explicit package name
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Load jest-dom extensions
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1', // Map @/ to src/ for imports
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS/SCSS imports
      '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js', // Mock static files
    },
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }], // Transform JS/TSX with next/babel
    },
    testPathIgnorePatterns: ['/node_modules/', '/.next/'], // Ignore build and node_modules
  };