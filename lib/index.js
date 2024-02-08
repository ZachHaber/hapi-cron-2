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
		server.log([name], `${job.name}: Running`);
		const res = await server.inject(job.request);
		/* istanbul ignore else  */
		if (job.onComplete) {
			job.onComplete(res);
		}
		server.log([name], `${job.name}: Complete`);
	};
}

/**
 *
 * @param {HapiCronJobMap} jobs
 * @returns
 */
function onPostStart(jobs) {
	return () => {
		for (const job of jobs.values()) {
			job.cron.start();
		}
	};
}

/**
 *
 * @param {HapiCronJobMap} jobs
 * @returns
 */
function onPreStop(jobs) {
	return () => {
		for (const job of jobs.values()) {
			job.cron.stop();
		}
	};
}

/*********************************************************************************
 3. Exports
 *********************************************************************************/

/**
 * @typedef {{
 * 	name: string;
 * 	crontab: string;
 *	timezone: string;
 *	request: import('@hapi/hapi').ServerInjectOptions;
 *	onComplete?: <T=unknown>(result: import('@hapi/hapi').ServerInjectResponse<T>	)=>void;
 * }} HapiCronJobOptions
 *
 * @typedef {{
 * 	jobs: HapiCronJobOptions[];
 * }} HapiCronOptions
 *
 * @typedef {{
 * 	cron: CronJob
 * } & HapiCronJobOptions} HapiCronJob
 *
 * @typedef {Map<string,HapiCronJob>} HapiCronJobMap
 */

/**
 * @type {import('@hapi/hapi').Plugin<HapiCronOptions>}
 */
const hapiCron = {
	pkg: PluginPackage,
	once: true,
	register(server, options) {
		/**
		 * @type {HapiCronJobMap}
		 */
		const jobs = new Map();
		server.expose("jobs", jobs);

		if (!options.jobs || !options.jobs.length) {
			server.log([name], "No cron jobs provided.");
		} else {
			for (const job of options.jobs) {
				assert(!jobs.has(job.name), "Job name has already been defined");
				addJob(job);
			}
		}
		server.ext("onPostStart", onPostStart(jobs));
		server.ext("onPreStop", onPreStop(jobs));

		/**
		 * @param {HapiCronJobOptions} job
		 */
		function addJob(job) {
			const oldJob = jobs.get(job.name);
			assert(job.name, "Missing job name");
			assert(job.crontab, "Missing job time");
			assert(job.timezone, "Missing job time zone");
			assert(job.request, "Missing job request options");
			assert(job.request.url, "Missing job request url");
			assert(
				typeof job.onComplete === "function" ||
					typeof job.onComplete === "undefined",
				"onComplete value must be a function",
			);
			try {
				/**
				 * Need to cast here due to TS not liking this construct...
				 * @type {HapiCronJob}
				 */
				const newJob = { .../** @type {HapiCronJob} */ (job) };

				newJob.cron = new CronJob(
					job.crontab,
					trigger(server, newJob),
					null,
					false,
					job.timezone,
				);
				jobs.set(job.name, newJob);
				// Don't remove the old job if it is still present
				if (oldJob) {
					oldJob.cron.stop();
				}
				if (server.info.started) {
					// Make sure that registering will trigger the job to start!
					newJob.cron.start();
				}
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
	},
};

export default hapiCron;
