import type {} from "@hapi/hapi";
import { HapiCronJob, HapiCronJobOptions } from "./index.js";
export * from "./hapi.js";
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
			addJob(job: HapiCronJobOptions): void;
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
