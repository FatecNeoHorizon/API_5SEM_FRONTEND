// frontend/tests/jest.config.js
module.exports = {
  rootDir: "..",
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.js"],

  moduleNameMapper: {
    "^axios$": "<rootDir>/tests/axios.mock.js",  
    "^.+\\.(css|scss)$": "identity-obj-proxy",
  },

  roots: ["<rootDir>/tests"],

  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};
