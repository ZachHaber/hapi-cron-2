/// <reference path="./hapi.d.ts" />
/*********************************************************************************
 1. Dependencies
 *********************************************************************************/
import { createRequire } from "node:module";
import { assert } from "@hapi/hoek";
import { CronJob } from "cron";

const nodeRequire = createRequire(import.meta.url);
// @ts-ignore
const PluginPackage = nodeRequire("../package.json");
/**
 * @type {{name: string}}
 */
const { name } = PluginPackage;
/*********************************************************************************
 2. Internals
 *********************************************************************************/

/**
 *
 * @param {import('@hapi/hapi').Server} server
 * @param {HapiCronJob} job
 * @returns
 */
function trigger(server, job) {
	return async () => {
		server.log([name], job.name);

		const res = await server.inject(job.request);
		/* istanbul ignore else  */
		if (job.onComplete) {
			job.onComplete(res);
		}
	};
}

/**
 *
 * @param {Map<string,CronJob>} jobs
 * @returns
 */
function onPostStart(jobs) {
	return () => {
		for (const job of jobs.values()) {
			job.start();
		}
	};
}

/**
 *
 * @param {Map<string,CronJob>} jobs
 * @returns
 */
function onPreStop(jobs) {
	return () => {
		for (const job of jobs.values()) {
			job.stop();
		}
	};
}

/*********************************************************************************
 3. Exports
 *********************************************************************************/

/**
 * @typedef {{
 * 	name: string;
 * 	time: string;
 *	timezone: string;
 *	request: import('@hapi/hapi').ServerInjectOptions;
 *	onComplete?: <T=unknown>(result: import('@hapi/hapi').ServerInjectResponse<T>	)=>void;
 * }} HapiCronJob
 *
 * @typedef {{
 * 	jobs: HapiCronJob[];
 * }} HapiCronOptions
 */

/**
 * @type {import('@hapi/hapi').Plugin<HapiCronOptions>}
 */
const hapiCron = {
	pkg: PluginPackage,
	register(server, options) {
		/**
		 * @type {Map<string,CronJob>}
		 */
		const jobs = new Map();

		if (!options.jobs || !options.jobs.length) {
			server.log([name], "No cron jobs provided.");
		} else {
			for (const job of options.jobs) {
				assert(!jobs.has(job.name), "Job name has already been defined");
				assert(job.name, "Missing job name");
				assert(job.time, "Missing job time");
				assert(job.timezone, "Missing job time zone");
				assert(job.request, "Missing job request options");
				assert(job.request.url, "Missing job request url");
				assert(
					typeof job.onComplete === "function" ||
						typeof job.onComplete === "undefined",
					"onComplete value must be a function",
				);

				try {
					jobs.set(
						job.name,
						new CronJob(
							job.time,
							trigger(server, job),
							null,
							false,
							job.timezone,
						),
					);
				} catch (err) {
					/* istanbul ignore else  */
					if (err instanceof Error) {
						if (err.message === "Invalid timezone.") {
							assert(
								!err,
								"Invalid timezone. See https://moment.github.io/luxon/api-docs/index.html#datetimesetzone for valid timezones",
							);
						} else {
							assert(!err, `Time is not a cron expression: ${err}`);
						}
					} else {
						throw err;
					}
				}
			}
		}

		server.expose("jobs", jobs);
		server.ext("onPostStart", onPostStart(jobs));
		server.ext("onPreStop", onPreStop(jobs));
	},
};

export default hapiCron;
