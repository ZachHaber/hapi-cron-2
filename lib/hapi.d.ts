import type {} from "@hapi/hapi";
import { CronJob } from "cron";
export * from "./hapi.js";
declare module "@hapi/hapi" {
	export interface PluginProperties {
		"hapi-cron-forked": {
			jobs: Map<string, CronJob>;
		};
	}
}
