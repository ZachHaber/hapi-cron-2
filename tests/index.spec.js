import { Server } from "@hapi/hapi";
import { describe, expect, it } from "@jest/globals";
import HapiCron from "../lib/index.js";
import { assert, baseJob, createServer, runServer } from "./_utils.js";

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
					jobs: [baseJob, baseJob],
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

	it("should work with a global timezone or without any", async () => {
		{
			const server = new Server();
			await server.register({
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
		}
		{
			const server = new Server();
			await server.register({
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
					timezone: "Europe/London",
				},
			});
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
		const { plugin } = await createServer();

		expect(plugin).toBeDefined();
		expect(plugin.jobs.has(baseJob.name)).toBe(true);

		expect(plugin.getJob).toBeDefined();
		expect(plugin.getJob(baseJob.name)).toBeDefined();
	});

	it("should ensure the request and callback from the plugin options are triggered", (done) => {
		const server = new Server();

		server
			.register({
				plugin: HapiCron,
				options: {
					jobs: [
						{
							...baseJob,
							onComplete: (result) => {
								expect(result.result).toBe("hello world");
								server.stop().then(() => done());
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
				});

				const job = server.plugins.hapiCron.jobs.get(baseJob.name);
				expect(job).toBeDefined();
				job?.cron?.fireOnTick();
			});
	}, 500);

	it("should ensure the request has the job context", (done) => {
		const server = new Server();

		server
			.register({
				plugin: HapiCron,
				options: {
					jobs: [
						{
							...baseJob,
							onComplete: (result) => {
								expect(result.result).toBe("hello world");
								server.stop().then(() => done());
							},
						},
					],
				},
			})
			.then(() => {
				server.route({
					method: "GET",
					path: "/test-url",
					handler: (request) => {
						expect(request.plugins.hapiCron.job).toBe(
							server.plugins.hapiCron.jobs.get(baseJob.name),
						);
						return "hello world";
					},
				});

				server.events.on("response", (request) => {
					expect(request.method).toBe("get");
					expect(request.path).toBe("/test-url");
				});

				const job = server.plugins.hapiCron.jobs.get(baseJob.name);
				expect(job).toBeDefined();
				job?.cron?.fireOnTick();
			});
	}, 500);

	it("should not start the jobs until the server starts", async () => {
		const { server, plugin } = await createServer();

		expect(plugin.jobs.get(baseJob.name)?.cron.running).toBe(false);

		await runServer(server, () => {
			expect(plugin.jobs.get(baseJob.name)?.cron.running).toBe(true);
		});
	});

	it("should stop cron jobs when the server stops", async () => {
		const { server, plugin } = await createServer();

		await runServer(server, () => {
			expect(plugin.jobs.get(baseJob.name)?.cron.running).toBe(true);
		});

		expect(plugin.jobs.get(baseJob.name)?.cron.running).toBe(false);
	});
});

describe("toggleJob", () => {
	it("should allow toggling a job", async () => {
		const { server, plugin } = await createServer();
		const job = plugin.getJob(baseJob.name);
		assert(job);
		await runServer(server, () => {
			plugin.toggleJob(job.name);

			expect(job.cron.running).toBe(false);

			plugin.toggleJob(job.name, false);
			expect(job.cron.running).toBe(false);

			plugin.toggleJob(job.name, true);
			expect(job.cron.running).toBe(true);

			plugin.toggleJob(job.name, true);
			expect(job.cron.running).toBe(true);
		});
	});
	it("should prevent toggling if the server isn't running", async () => {
		const { plugin } = await createServer();
		const job = plugin.getJob(baseJob.name);
		assert(job);
		plugin.toggleJob(baseJob.name);
		expect(job.cron.running).toBe(false);
	});
});

describe("addJob", () => {
	it("should add a new job", async () => {
		const { plugin } = await createServer();
		const name = "newName";
		plugin.addJob({ ...baseJob, name });
		assert(plugin.getJob(name));
		expect(plugin.getJob(name)?.cron.running).toBe(false);
	});
	it("should replace a job with the same name", async () => {
		const { plugin } = await createServer();
		const crontab = "5 0 * 8 *";
		plugin.addJob({ ...baseJob, crontab });
		const job = plugin.getJob(baseJob.name);
		assert(job);
		expect(job.crontab).toBe(crontab);
		expect;
	});
	it("should stop a job with the same name before starting the new one", async () => {
		const { server, plugin } = await createServer();
		const crontab = "5 0 * 8 *";
		const job = plugin.getJob(baseJob.name);
		assert(job);
		await runServer(server, () => {
			assert(job.cron.running);

			plugin.addJob({ ...baseJob, crontab });
			expect(job.cron.running).toBe(false);
			const newJob = plugin.getJob(baseJob.name);
			assert(newJob);
			expect(newJob.crontab).toBe(crontab);
			assert(newJob.cron.running);
		});
	});
});

describe("removeJob", () => {
	it("should remove a job", async () => {
		const { server, plugin } = await createServer();
		const job = plugin.getJob(baseJob.name);
		assert(job);
		assert(plugin.removeJob(job.name));
		assert(!plugin.getJob(baseJob.name));
	});

	it("should stop a job before removing it", async () => {
		const { server, plugin } = await createServer();
		const job = plugin.getJob(baseJob.name);
		assert(job);
		await runServer(server, () => {
			assert(job.cron.running);
			assert(plugin.removeJob(job.name));
			assert(!job.cron.running);
		});
	});

	it("should return false if there is no job to remove", async () => {
		const { server, plugin } = await createServer();
		expect(plugin.removeJob("noJob")).toBe(false);
	});
});
