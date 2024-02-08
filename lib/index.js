/// <reference path="./hapi.d.ts" />
import { assert, merge } from "@hapi/hoek";
import { CronJob } from "cron";
import { createRequire } from "node:module";

const nodeRequire = createRequire(import.meta.url);
// @ts-ignore
const PluginPackage = nodeRequire("../package.json");
/**
 * @type {{name: string}}
 */
const { name } = PluginPackage;

/**
 *
 * @param {import('@hapi/hapi').Server} server
 * @param {HapiCronJob} job
 * @returns
 */
function trigger(server, job) {
	return async () => {
		server.log([name], `${job.name}: Running`);
		const res = await server.inject(
			merge(
				{
					plugins: {
						hapiCronForked: {
							job,
						},
					},
				},
				job.request,
			),
		);
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
	name: "hapiCron",
	register(server, options) {
		/**
		 * @type {HapiCronJobMap}
		 */
		const jobs = new Map();
		server.expose("jobs", jobs);
		server.expose("getJob", getJob);
		server.expose("addJob", addJob);
		server.expose("removeJob", removeJob);
		server.expose("toggleJob", toggleJob);

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
		 *
		 * @param {string} name
		 * @returns
		 */
		function getJob(name) {
			return jobs.get(name);
		}
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
				if (oldJob) {
					// Stop the old job
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
		/**
		 *
		 * @param {string} name Name of the job to remove
		 * @returns {boolean} `true` if a job was removed, `false` otherwise
		 */
		function removeJob(name) {
			const job = jobs.get(name);
			if (job) {
				job.cron.stop();
				return jobs.delete(name);
			}
			return false;
		}
		/**
		 *
		 * @param {string} name Name of the job to toggle
		 * @param {boolean} [running] What state should the job end up at? defaults to toggling the state
		 * @returns {boolean} `true` if the job is now running, `false` if the job is now stopped
		 */
		function toggleJob(name, running) {
			const job = jobs.get(name);
			if (!job || !server.info.started) {
				return false;
			}
			// biome-ignore lint/style/noParameterAssign: Cleaner this way
			running = running ?? !job.cron.running;
			if (job.cron.running !== running) {
				if (running) {
					job.cron.start();
				} else {
					job.cron.stop();
				}
			}
			return running;
		}
	},
};

export default hapiCron;
