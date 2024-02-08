import type {} from "@hapi/hapi";
import { HapiCronJob } from "./index.js";
export * from "./hapi.js";
declare module "@hapi/hapi" {
	export interface PluginProperties {
		"hapi-cron-forked": {
			/**
			 * The jobs that currently exist.
			 */
			jobs: Map<string, HapiCronJob>;
		};
	}
}
