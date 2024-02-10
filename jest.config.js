/** @type {import('jest').Config} */
export default {
	collectCoverage: true,
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	collectCoverageFrom: ["lib/**/*.js"],
	testEnvironment: "node",
};
