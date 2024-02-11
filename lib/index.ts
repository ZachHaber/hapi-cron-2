import type {
	Plugin,
	Server,
	ServerInjectOptions,
	ServerInjectResponse,
} from "@hapi/hapi";
import { assert, merge } from "@hapi/hoek";
import { CronJob } from "cron";
import { createRequire } from "node:module";

declare module "@hapi/hapi" {
	export interface PluginProperties {
		hapiCron: {
			/**
			 * The jobs that currently exist.
			 */
			jobs: Map<string, HapiCronJob>;
			/**
			 * Gets the job associated with a name
			 * @param name The name of the job to retrieve
			 */
			getJob(name: string): HapiCronJob | undefined;
			/**
			 * Adds a new job to the scheduler
			 * @param job The cronjob to add
			 */
			addJob(job: HapiCronJobConfig): void;
			/**
			 * Stops and removes a job from the list of jobs
			 * @param name The name of the job to remove
			 * @returns `true` if a job was removed, `false` otherwise - when there was no job to remove
			 */
			removeJob(name: string): boolean;
			/**
			 * Toggles a job's running state. If `changeTo` is specified, then the state will be changed to that.
			 * @param name The name of the job to toggle
			 * @param changeTo `true` to run start the job, `false` to stop the job, `undefined` to toggle the running status
			 * Will be a no-op if the job is already in the correct state.
			 * @returns the job's new running status, or `false` if the job didn't exist
			 */
			toggleJob(name: string, changeTo?: boolean): boolean;
		};
	}
	export interface PluginsStates {
		hapiCron: {
			job: HapiCronJob;
		};
	}
}

const nodeRequire = createRequire(import.meta.url);
const PluginPackage = nodeRequire("../package.json");

const { name } = PluginPackage as { name: string };

/**
 *
 * @param {Server} server
 * @param {HapiCronJob} job
 * @returns
 */
function trigger(server: Server, job: HapiCronJob) {
	return async () => {
		server.log([name], `${job.name}: Running`);
		const res = await server.inject(
			merge(
				{
					plugins: {
						hapiCron: {
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
function onPostStart(jobs: HapiCronJobMap) {
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
function onPreStop(jobs: HapiCronJobMap) {
	return () => {
		for (const job of jobs.values()) {
			job.cron.stop();
		}
	};
}

export interface HapiCronJobConfig {
	name: string;
	crontab: string;
	timezone?: string;
	request: ServerInjectOptions;
	onComplete?: <T = unknown>(result: ServerInjectResponse<T>) => void;
}

export interface HapiCronOptions {
	jobs: HapiCronJobConfig[];
	timezone?: string;
}

export interface HapiCronJob extends HapiCronJobConfig {
	cron: CronJob;
}

type HapiCronJobMap = Map<string, HapiCronJob>;

/**
 * @type {Plugin<HapiCronOptions>}
 */
const hapiCron: Plugin<HapiCronOptions> = {
	pkg: PluginPackage,
	once: true,
	name: "hapiCron",
	register(
		server,
		{
			jobs: jobConfig,
			timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
		},
	) {
		/**
		 * @type {HapiCronJobMap}
		 */
		const jobs: HapiCronJobMap = new Map();
		server.expose("jobs", jobs);
		server.expose("getJob", getJob);
		server.expose("addJob", addJob);
		server.expose("removeJob", removeJob);
		server.expose("toggleJob", toggleJob);

		if (jobConfig?.length) {
			for (const job of jobConfig) {
				// Only check here for duplicate names, since after this, all jobs are added 1 by 1
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
		function getJob(name: string) {
			return jobs.get(name);
		}
		/**
		 * @param {HapiCronJobConfig} job
		 */
		function addJob(job: HapiCronJobConfig) {
			const oldJob = jobs.get(job.name);
			assert(job.name, "Missing job name");
			assert(job.crontab, "Missing job time");
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
				 */
				const newJob: HapiCronJob = { ...(job as HapiCronJob) };

				newJob.cron = new CronJob(
					job.crontab,
					trigger(server, newJob),
					null,
					false,
					job.timezone || timezone,
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
		function removeJob(name: string): boolean {
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
		function toggleJob(name: string, running: boolean): boolean {
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
