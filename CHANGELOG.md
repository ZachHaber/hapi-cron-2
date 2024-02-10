# Changelog

## 1.0.0 (2024-02-10)


### Features

* add `add` plugin function to allow dynamically adding a job ([ba3df51](https://github.com/ZachHaber/hapi-cron-2/commit/ba3df5184823d0f0bfea94dbb28f11ca6299708b))
* add `get` plugin function to get a job ([b4efa9a](https://github.com/ZachHaber/hapi-cron-2/commit/b4efa9a1987f60c0fef252898096097afbdfd454))
* Add `hapiCrong.job` to the request's context when triggered ([5c35d61](https://github.com/ZachHaber/hapi-cron-2/commit/5c35d61cc0f81325e0e43de50a944421c734a90d))
* add `remove` plugin function to allow deleting a job ([4f67c23](https://github.com/ZachHaber/hapi-cron-2/commit/4f67c2322734e152ade5cf431e39ebdf6c7e3acb))
* add `toggle` plugin function to allow toggling a single job on/off ([3a23748](https://github.com/ZachHaber/hapi-cron-2/commit/3a23748cb3e7886238771c9ace9ce8ebd63afea8))
* rename exposed functions to add `job` ([fc21536](https://github.com/ZachHaber/hapi-cron-2/commit/fc21536c37d11b65900d503de47e0e77de4137b3))
* timezones are now optional and can also be set globally ([3ba1c02](https://github.com/ZachHaber/hapi-cron-2/commit/3ba1c02a527430844496378f1c571d7d7324c153))


### Bug Fixes

* **core:** trigger onComplete if defined and pass response arguments ([20706df](https://github.com/ZachHaber/hapi-cron-2/commit/20706df34dd60133251f4f2e9d5380d340da3c97))
* **eslint:** adding new line ([99e21d5](https://github.com/ZachHaber/hapi-cron-2/commit/99e21d58f74e64fb4c711138ae1e789802f02fb6))
* **package:** update @hapi/hoek to version 7.2.0 ([3201cce](https://github.com/ZachHaber/hapi-cron-2/commit/3201cce4b05248cb1da3b0ff1e00d8b774c352c3))
* **package:** update hoek to version 6.0.0 ([#15](https://github.com/ZachHaber/hapi-cron-2/issues/15)) ([d358a6e](https://github.com/ZachHaber/hapi-cron-2/commit/d358a6e4fcdc65bc3b393c85152981113d168126))
* **plugin:** adding missing to set timezone correctly - fixes [#1](https://github.com/ZachHaber/hapi-cron-2/issues/1) ([171c789](https://github.com/ZachHaber/hapi-cron-2/commit/171c7894fb7d376f8c6c92cde4d7272d57ccd405))
* **plugin:** starting and stopping cron jobs on server events - fixes [#2](https://github.com/ZachHaber/hapi-cron-2/issues/2) ([eda7349](https://github.com/ZachHaber/hapi-cron-2/commit/eda734963f2c926c7da7e49cb572d3627cd4c0a5))
* **plugin:** use the correct name ([be562f9](https://github.com/ZachHaber/hapi-cron-2/commit/be562f9f3efcac56aec9810493abd81aead3e567))
