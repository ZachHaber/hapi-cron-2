# Changelog

## 1.0.0 (2024-02-10)


### ⚠ BREAKING CHANGES

* **jobs:** the jobs server plugin context is now a Map
* **job:** the jobs you can view are now config + job.cron where cron is the actual CronJob from node-cron
* time is now crontab to be a more accurate name
* node requirement is set to 16
* the plugin name in Hapi is now hapiCron when interfacing with hapi

### Features

* **jobs:** the jobs server plugin context is now a Map ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **job:** the jobs you can view are now config + job.cron where cron is the actual CronJob from node-cron ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **options:** timezones are now optional ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **requestPlugin:** adds job to the request's plugin context when it is run by the scheduler. ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **serverPlugin:** adds `addJob(jobConfig)` ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **serverPlugin:** adds `addJob(jobConfig)` ([#5](https://github.com/ZachHaber/hapi-cron-2/issues/5)) ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **serverPlugin:** adds getJob(name) to get the job information ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **serverPlugin:** adds removeJob(name) ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **serverPlugin:** adds toggleJob(name, changeTo) ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* **typedefs:** adds full typescript definitions using JSDoc ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))


### Bug Fixes

* **core:** trigger onComplete if defined and pass response arguments ([20706df](https://github.com/ZachHaber/hapi-cron-2/commit/20706df34dd60133251f4f2e9d5380d340da3c97))
* **eslint:** adding new line ([99e21d5](https://github.com/ZachHaber/hapi-cron-2/commit/99e21d58f74e64fb4c711138ae1e789802f02fb6))
* **package:** update @hapi/hoek to version 7.2.0 ([3201cce](https://github.com/ZachHaber/hapi-cron-2/commit/3201cce4b05248cb1da3b0ff1e00d8b774c352c3))
* **package:** update hoek to version 6.0.0 ([#15](https://github.com/ZachHaber/hapi-cron-2/issues/15)) ([d358a6e](https://github.com/ZachHaber/hapi-cron-2/commit/d358a6e4fcdc65bc3b393c85152981113d168126))
* **plugin:** adding missing to set timezone correctly - fixes [#1](https://github.com/ZachHaber/hapi-cron-2/issues/1) ([171c789](https://github.com/ZachHaber/hapi-cron-2/commit/171c7894fb7d376f8c6c92cde4d7272d57ccd405))
* **plugin:** starting and stopping cron jobs on server events - fixes [#2](https://github.com/ZachHaber/hapi-cron-2/issues/2) ([eda7349](https://github.com/ZachHaber/hapi-cron-2/commit/eda734963f2c926c7da7e49cb572d3627cd4c0a5))


### Code Refactoring

* node requirement is set to 16 ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* the plugin name in Hapi is now hapiCron when interfacing with hapi ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* time is now crontab to be a more accurate name ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
