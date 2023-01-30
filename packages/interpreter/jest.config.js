// module.exports = {
//     roots: [
//         "<rootDir>/src"
//     ],
//     testMatch: [
//         "**/__tests__/**/*.+(ts|tsx|js)",
//         "**/?(*.)+(spec|test).+(ts|tsx|js)"
//     ],
//     transform: {
//         "^.+\\.(ts|tsx)$": "ts-jest"
//     },
//     collectCoverageFrom: [
//         "**/*.{js,jsx,ts,tsx}",
//         "!**/*.d.ts",
//         "!**/node_modules/**",
//     ],
//     globals: {
//         "ts-jest": {
//             tsconfig: "tsconfig.json",
//         },
//     },
// }

// jest.config.js
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
}