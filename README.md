# hapi-cron-2

A Hapi plugin to setup cron jobs that will call predefined server routes at specified times.

## Requirements

This plugin is compatible with **hapi** v17+ and requires Node v16+.

## Installation

Add `hapi-cron-2` as a dependency to your project:

```bash
npm install --save hapi-cron-2
```

## Usage

```javascript
const Hapi = require("@hapi/hapi");
const HapiCron = require("hapi-cron-2");

const server = new Hapi.Server();

async function allSystemsGo() {
	try {
		await server.register({
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
						onComplete: (res) => {
							console.log(res.result); // 'hello world'
						},
					},
				],
			},
		});

		server.route({
			method: "GET",
			path: "/test-url",
			handler: function (request, h) {
				return "hello world";
			},
		});

		await server.start();
	} catch (err) {
		console.info("there was an error");
	}
}

allSystemsGo();
```

## Options

`HapiCronOptions`

- `jobs: HapiCronJobConfig[]` - An array of `HapiCronJobConfig` options - [See below](#job-options)
- `timezone?: string` - A valid [timezone](https://momentjs.com/timezone/) - `optional`

## Job Options

`HapiCronJobConfig`

- `name: string` - A unique name for the cron job
- `crontab: string` - A valid cron value. [See cron configuration](#cron-configuration)
- `timezone?: string` - A valid [timezone](https://momentjs.com/timezone/) - `optional`. If this is undefined, the `HapiCronOptions.timezone` will be used. The server's local timezone will be used if both this _and_ the `HapiCronOptions.timezone` are undefined!
- `request: object` - The request object containing the route url path. Other [options](https://hapi.dev/api/#-await-serverinjectoptions) can also be passed into the request object
  - `url` - Route path to request
  - `method` - Request method (defaults to `GET`) - `optional`
- `onComplete: (result)=>void` - A synchronous function to run after the route has been requested. The function will contain the entire injection result from the request - `optional`

## Cron configuration

This plugin uses the [node-cron](https://github.com/kelektiv/node-cron) module to setup the cron job.

### Available cron patterns:

```
Asterisk. E.g. *
Ranges. E.g. 1-3,5
Steps. E.g. */2
```

[Read up on cron patterns here](http://crontab.org) and check https://crontab.guru/ for help writing them. **Note** the examples in both links have five fields, and 1 minute as the finest granularity, but the node cron module allows six fields, with 1 second as the finest granularity.

### Cron Ranges

When specifying your cron values you'll need to make sure that your values fall within the ranges. For instance, some cron's use a 0-7 range for the day of week where both 0 and 7 represent Sunday. We do not.

- Seconds: 0-59
- Minutes: 0-59
- Hours: 0-23
- Day of Month: 1-31
- Months: 0-11
- Day of Week: 0-6
