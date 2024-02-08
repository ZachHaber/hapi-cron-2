import type {} from "@hapi/hapi";
import { HapiCronJob } from "./index.js";
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
			get(name: string): HapiCronJob | undefined;
		};
	}
	export interface PluginsStates {
		hapiCron: {
			job: HapiCronJob;
		};
	}
}
