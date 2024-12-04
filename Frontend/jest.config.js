module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/index.js",
    "!src/pages/profile/Share.jsx",
    "!src/serviceWorker.js",
    "!src/setupTests.js",
    "!src/context/FilterTermContext.js",
    "!src/context/authContext.js",       
    "!src/context/darkModeContext.js",
    "!src/reducer/followedUsersReducer.js",
    "!src/reducer/postsReducer.js",
    "!src/reducer/authReducer.js",
    "!src/components/comments/Comments.jsx",
    "!src/components/leftBar/LeftBar.jsx",
    "!src/components/navbar/Navbar.jsx",
    "!src/components/rightBar/RightBar.jsx",
    "!src/components/stories/Stories.jsx",
    "!src/pages/home/Home.jsx",
    "!src/pages/register/Register.jsx",
  ],
  modulePathIgnorePatterns: [
    "<rootDir>src/pages/profile/Share.jsx",
    "<rootDir>/src/index.js",
    "<rootDir>/src/App.js",
    "<rootDir>/src/store.js",
    "<rootDir>/src/context/FilterTermContext.js",
    "<rootDir>/src/context/authContext.js",
    "<rootDir>/src/context/darkModeContext.js",
    "<rootDir>/src/reducer/followedUsersReducer.js",
    "<rootDir>/src/reducer/postsReducer.js",
    "<rootDir>/src/reducer/authReducer.js",
    "<rootDir>/src/components/comments/Comments.jsx",
    "<rootDir>/src/components/leftBar/LeftBar.jsx",
    "<rootDir>/src/components/navbar/Navbar.jsx",
    "<rootDir>/src/components/rightBar/RightBar.jsx",
    "<rootDir>/src/components/stories/Stories.jsx",
    "<rootDir>/src/pages/home/Home.jsx",
    "<rootDir>/src/pages/register/Register.jsx"
  ],
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 90
    }
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/mocks/fileMock.js',
    '\\.(css|scss)$': '<rootDir>/mocks/styleMock.js'
  },
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  testPathIgnorePatterns: [
    "<rootDir>/setup.test.js"  // Adjust the path as necessary
  ]
};
