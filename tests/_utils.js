import { expect } from "@jest/globals";
import HapiCron from "../lib/index.js";
import { Server } from "@hapi/hapi";

/**
 * @param {*} assertion
 * @returns {asserts assertion}
 */
export function assert(assertion) {
	expect(assertion).toBeTruthy();
}

/**
 * @type {import("../lib/index.js").HapiCronJobOptions}
 */
export const baseJob = {
	name: "testcron",
	crontab: "*/10 * * * * *",
	timezone: "Europe/London",
	request: {
		method: "GET",
		url: "/test-url",
	},
};

/**
 *
 * @param {import("../lib/index.js").HapiCronJobOptions[]} jobs
 */
export const createServer = async (jobs = [baseJob]) => {
	const server = new Server();

	await server.register({
		plugin: HapiCron,
		options: {
			jobs: jobs,
		},
	});
	return { server, plugin: server.plugins.hapiCron };
};

/**
 * Start the server and stop it at the end!
 * @param {Server} server
 * @param {()=>(Promise<void>|void)} cb
 * @returns {Promise<void>}
 */
export async function runServer(server, cb) {
	await server.start();
	try {
		await cb();
	} finally {
		await server.stop();
	}
}
