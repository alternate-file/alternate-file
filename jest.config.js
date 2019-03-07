module.exports = {
  preset: "ts-jest",

  testEnvironment: "node",

  clearMocks: true,

  coverageDirectory: "coverage",

  testMatch: ["**/src/**/*.test.ts"]
};
