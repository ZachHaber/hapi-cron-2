/*********************************************************************************
 1. Dependencies
 *********************************************************************************/
import { Server } from "@hapi/hapi";
import { describe, expect, it, jest } from "@jest/globals";
import HapiCron from "../lib/index.js";

/*********************************************************************************
 2. Exports
 *********************************************************************************/

describe("registration assertions", () => {
	it("should register plugin without errors", async () => {
		const server = new Server();

		await server.register({
			plugin: HapiCron,
		});
	});

	it("should throw error when a job is defined with an existing name", async () => {
		const server = new Server();

		try {
			await server.register({
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testname",
							crontab: "*/10 * * * * *",
							timezone: "Europe/London",
							request: {
								url: "/test-url",
							},
						},
						{
							name: "testname",
							crontab: "*/10 * * * * *",
							timezone: "Europe/London",
							request: {
								url: "/test-url",
							},
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toEqual("Job name has already been defined");
		}
	});

	it("should throw error when a job is defined without a name", async () => {
		const server = new Server();

		try {
			await server.register({
				// @ts-ignore
				plugin: HapiCron,
				options: {
					jobs: [
						{
							crontab: "*/10 * * * * *",
							timezone: "Europe/London",
							request: {
								url: "/test-url",
							},
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toEqual("Missing job name");
		}
	});

	it("should throw error when a job is defined without a time", async () => {
		const server = new Server();

		try {
			await server.register({
				// @ts-ignore
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							timezone: "Europe/London",
							request: {
								url: "/test-url",
							},
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toEqual("Missing job time");
		}
	});

	it("should throw error when a job is defined with an invalid time", async () => {
		const server = new Server();

		try {
			await server.register({
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							crontab: "invalid cron",
							timezone: "Europe/London",
							request: {
								url: "/test-url",
							},
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toMatch(/^Time is not a cron expression:/);
		}
	});

	it("should throw error when a job is defined with an invalid timezone", async () => {
		const server = new Server();

		try {
			await server.register({
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							crontab: "*/10 * * * * *",
							timezone: "invalid",
							request: {
								url: "/test-url",
							},
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toMatch(/^Invalid timezone. See/);
		}
	});

	it("should throw error when a job is defined without a timezone", async () => {
		const server = new Server();

		try {
			await server.register({
				// @ts-ignore
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							crontab: "*/10 * * * * *",
							request: {
								url: "/test-url",
							},
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toEqual("Missing job time zone");
		}
	});

	it("should throw error when a job is defined without a request object", async () => {
		const server = new Server();

		try {
			await server.register({
				// @ts-ignore
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							crontab: "*/10 * * * * *",
							timezone: "Europe/London",
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toEqual("Missing job request options");
		}
	});

	it("should throw error when a job is defined without a url in the request object", async () => {
		const server = new Server();

		try {
			await server.register({
				// @ts-ignore
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							crontab: "*/10 * * * * *",
							timezone: "Europe/London",
							request: {
								method: "GET",
							},
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toEqual("Missing job request url");
		}
	});

	it("should throw error when a job is defined with an invalid onComplete value", async () => {
		const server = new Server();

		try {
			await server.register({
				// @ts-ignore
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							crontab: "*/10 * * * * *",
							timezone: "Europe/London",
							request: {
								method: "GET",
								url: "/test-url",
							},
							onComplete: "invalid",
						},
					],
				},
			});
		} catch (/** @type {any} */ err) {
			expect(err.message).toEqual("onComplete value must be a function");
		}
	});
});

describe("plugin functionality", () => {
	it("should expose access to the registered jobs", async () => {
		const server = new Server();

		await server.register({
			plugin: HapiCron,
			options: {
				jobs: [
					{
						name: "testcron",
						crontab: "*/10 * * * * *",
						timezone: "Europe/London",
						request: {
							method: "GET",
							url: "/test-url",
						},
					},
				],
			},
		});

		expect(server.plugins.hapiCron).toBeDefined();
		expect(server.plugins.hapiCron.jobs.has("testcron")).toBe(true);
	});

	it("should ensure the request and callback from the plugin options are triggered", (done) => {
		const server = new Server();

		server
			.register({
				plugin: HapiCron,
				options: {
					jobs: [
						{
							name: "testcron",
							crontab: "*/10 * * * * *",
							timezone: "Europe/London",
							request: {
								method: "GET",
								url: "/test-url",
							},
							onComplete: (result) => {
								expect(result.result).toBe("hello world");
								done();
							},
						},
					],
				},
			})
			.then(() => {
				server.route({
					method: "GET",
					path: "/test-url",
					handler: () => "hello world",
				});

				server.events.on("response", (request) => {
					expect(request.method).toBe("get");
					expect(request.path).toBe("/test-url");
					// done();
				});

				// expect(onComplete).not.toHaveBeenCalled();

				const job = server.plugins.hapiCron.jobs.get("testcron");
				expect(job).toBeDefined();
				job?.cron?.fireOnTick();
			});

		// job?.addCallback
		// await server.plugins.hapiCron.jobs
		// 	.get("testcron")
		// 	// @ts-ignore
		// 	?._callbacks[0]();
		// expect(onComplete).toHaveBeenCalledTimes(1);
		// expect(onComplete).toHaveBeenCalledWith("hello world");
	}, 500);

	it("should not start the jobs until the server starts", async () => {
		const server = new Server();

		await server.register({
			plugin: HapiCron,
			options: {
				jobs: [
					{
						name: "testcron",
						crontab: "*/10 * * * * *",
						timezone: "Europe/London",
						request: {
							method: "GET",
							url: "/test-url",
						},
					},
				],
			},
		});

		expect(server.plugins.hapiCron.jobs.get("testcron")?.cron.running).toBe(
			false,
		);

		await server.start();

		expect(server.plugins.hapiCron.jobs.get("testcron")?.cron.running).toBe(
			true,
		);

		await server.stop();
	});

	it("should stop cron jobs when the server stops", async () => {
		const server = new Server();

		await server.register({
			plugin: HapiCron,
			options: {
				jobs: [
					{
						name: "testcron",
						crontab: "*/10 * * * * *",
						timezone: "Europe/London",
						request: {
							method: "GET",
							url: "/test-url",
						},
					},
				],
			},
		});

		await server.start();

		expect(server.plugins.hapiCron.jobs.get("testcron")?.cron.running).toBe(
			true,
		);

		await server.stop();

		expect(server.plugins.hapiCron.jobs.get("testcron")?.cron.running).toBe(
			false,
		);
	});
});
