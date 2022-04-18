/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["./tests/tests-setup.ts"],
    setupFilesAfterEnv: ["./tests/orm_integration/integration_setup.ts"],
};
