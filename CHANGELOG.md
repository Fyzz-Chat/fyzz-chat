# [0.5.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.4.0...v0.5.0) (2025-12-14)


### Bug Fixes

* **auth:** pass callback to after ([54879d8](https://github.com/Fyzz-Chat/fyzz-chat/commit/54879d89a2a00d219c51423afe929ec9cf377131))
* **docker:** security optimizations in the dockerfile ([a5ef4f6](https://github.com/Fyzz-Chat/fyzz-chat/commit/a5ef4f623550b56fdf65eab37f4cd5f4fda8407d))


### Features

* **auth:** add autocomplete properties to inputs ([7077711](https://github.com/Fyzz-Chat/fyzz-chat/commit/70777115e4d01cd8eb8f36c0cd9bae523e996253))
* **scripts:** add version update scripts ([641be0f](https://github.com/Fyzz-Chat/fyzz-chat/commit/641be0fa947c9ff843255e7622824634d59095a8))
* **turnstile:** add warning and debug log to turnstile validation ([304a9f9](https://github.com/Fyzz-Chat/fyzz-chat/commit/304a9f9450c90891813771a64a1e2cfd53d4617f))
* **turnstile:** reset check after failure ([3276022](https://github.com/Fyzz-Chat/fyzz-chat/commit/327602243e4d73d093f5fb55538b6cf4b06af3c1))

# [0.4.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.3.1...v0.4.0) (2025-12-04)


### Bug Fixes

* **chat:** delete loading to be able open model menu instantly ([86a7e8c](https://github.com/Fyzz-Chat/fyzz-chat/commit/86a7e8c92d02ffa2992c7c08e0ee8e3c2b0bc02b))


### Features

* add snow in december ([b3260b7](https://github.com/Fyzz-Chat/fyzz-chat/commit/b3260b7f0f6a923cd009317ffde31e272b8ed7cf))
* **google:** add gemini 2.5 flash lite ([f9fdb84](https://github.com/Fyzz-Chat/fyzz-chat/commit/f9fdb84770ede04c65618c2b9519c761af049213))
* **openai:** add gpt oss 120b from fireworks ([1f805e8](https://github.com/Fyzz-Chat/fyzz-chat/commit/1f805e8c0478a6a804d47a0886e21c4b0695c7a1))

## [0.3.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.3.0...v0.3.1) (2025-11-30)


### Bug Fixes

* **ci:** release first, then build ([008849d](https://github.com/Fyzz-Chat/fyzz-chat/commit/008849d7cb8db9b60d0deef96a69e069b9015671))

# [0.3.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.2.1...v0.3.0) (2025-11-30)


### Bug Fixes

* **auth:** make build pass ([aaa7443](https://github.com/Fyzz-Chat/fyzz-chat/commit/aaa74438944e96e28cc3f8ba624d9594bf2379df))
* **ci:** add missing dummy env var ([60f1b6d](https://github.com/Fyzz-Chat/fyzz-chat/commit/60f1b6da561f05cac23159e85b209e7b005669c1))
* **ci:** add missing env ([7cb3c37](https://github.com/Fyzz-Chat/fyzz-chat/commit/7cb3c37bb6e173646ef8f8aa38d8d4e3465ab047))
* **docker:** copy prisma config ([bf8e81a](https://github.com/Fyzz-Chat/fyzz-chat/commit/bf8e81a34e8fdc61040a5376360c5b90f500f625))
* **docker:** copy prisma schema ([a387292](https://github.com/Fyzz-Chat/fyzz-chat/commit/a387292083b2a6296955a3b875a530fb94776081))
* **docker:** correct typo in path ([59a09ed](https://github.com/Fyzz-Chat/fyzz-chat/commit/59a09ed03df0f43f228efcf4a5310aa3bd16a8ab))
* **prisma:** use migrate deploy ([032d460](https://github.com/Fyzz-Chat/fyzz-chat/commit/032d460d75b3e277fec83406d75760fc39640d7e))
* **ses:** do not break on missing aws credentials ([6f653d3](https://github.com/Fyzz-Chat/fyzz-chat/commit/6f653d3ea4d3cc1bc6d9f3d25b3f6fa455b7281e))
* **ses:** handle unconfigured aws ([9dcfaf7](https://github.com/Fyzz-Chat/fyzz-chat/commit/9dcfaf7cea637784705fe6307f2fe13f13e786d3))


### Features

* add loading to chat page ([22a1650](https://github.com/Fyzz-Chat/fyzz-chat/commit/22a1650a5beb2340d81ef253d7bcf35a7de2513c))
* **auth:** extend with custom field options on create ([3aa43ac](https://github.com/Fyzz-Chat/fyzz-chat/commit/3aa43ac1448a584d5c1b3f88c89ba7cc02671f83))
* **auth:** introduce password reset option ([0f96eec](https://github.com/Fyzz-Chat/fyzz-chat/commit/0f96eeca7738cee13199fa5453b6c50b6cc21ee2))
* **auth:** mention additional fields in user schema ([5780ffd](https://github.com/Fyzz-Chat/fyzz-chat/commit/5780ffde418cffb92d8ed5bd68443c646412da83))
* **auth:** upgrade authjs to better auth ([6defa38](https://github.com/Fyzz-Chat/fyzz-chat/commit/6defa38a5812dfd07b35d217a280ded55dce3e43))
* **chat:** log who aborted stream ([26fa8e9](https://github.com/Fyzz-Chat/fyzz-chat/commit/26fa8e9e55f68b8c76788a5bbc4cebdc8171a11e))
* **email:** redesign password reset email ([48207a2](https://github.com/Fyzz-Chat/fyzz-chat/commit/48207a22abbb70284b840e6e1958242f0eb7d7c1))
* show version in header ([08d05f9](https://github.com/Fyzz-Chat/fyzz-chat/commit/08d05f9fcc8586fe5979833dfdb91d267ac3d520))

## [0.2.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.2.0...v0.2.1) (2025-11-22)


### Bug Fixes

* **files:** make it possible to upload files with aws configured ([55a0a2e](https://github.com/Fyzz-Chat/fyzz-chat/commit/55a0a2e514b06b2a74efb376df31205559235d41))

# [0.2.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.1.0...v0.2.0) (2025-11-22)


### Features

* **ci:** automatically tag docker images based on version ([71baf88](https://github.com/Fyzz-Chat/fyzz-chat/commit/71baf88c13d2a989fefc22fb6fb90c3fd3faa948))

 [0.1.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.0.1...v0.1.0) (2025-11-22)


### Features

* **ci:** auto increase package.json version ([2447815](https://github.com/Fyzz-Chat/fyzz-chat/commit/244781536ea996bc54957bbe24eeeee3bbec77ab))
