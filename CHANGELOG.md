# Changelog

## [1.0.1](https://github.com/ZachHaber/hapi-cron-2/compare/hapi-cron-2-v1.0.0...hapi-cron-2-v1.0.1) (2024-02-10)


### Bug Fixes

* **deps:** prevent lefthook error when installing ([09a8d93](https://github.com/ZachHaber/hapi-cron-2/commit/09a8d93ad073cc69efbf5cdb7b5bcf3ca2421a4c))

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


### Code Refactoring

* node requirement is set to 16 ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* the plugin name in Hapi is now hapiCron when interfacing with hapi ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
* time is now crontab to be a more accurate name ([7512bdb](https://github.com/ZachHaber/hapi-cron-2/commit/7512bdb1a65499b0262eeabe06169b21a47101cb))
