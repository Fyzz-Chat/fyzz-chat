# [0.16.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.15.0...v0.16.0) (2026-01-24)


### Bug Fixes

* **anonymous-login:** refetch session on successful login ([a383345](https://github.com/Fyzz-Chat/fyzz-chat/commit/a3833459fce685f7fd27ccfe15fa0210ef3fd01b))
* import streamdown style correctly ([1ba5923](https://github.com/Fyzz-Chat/fyzz-chat/commit/1ba5923f51c58a1dc621a5d2e55e61a51a02cd05))
* **model-selector:** typing issue fix ([9a06575](https://github.com/Fyzz-Chat/fyzz-chat/commit/9a06575b40dd5ca9a409e5a728dcfb74165e1834))
* **users:** disable anonymous login server action when not configured, do not log email ([cf6869e](https://github.com/Fyzz-Chat/fyzz-chat/commit/cf6869e5b82a9c84c6e54b2f9b0e10fea7e606c8))


### Features

* **auth:** introduce anonymous logins ([dda2e0c](https://github.com/Fyzz-Chat/fyzz-chat/commit/dda2e0cd05ec3db41e13ec9717f51d3f6a808fa9))

# [0.15.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.14.0...v0.15.0) (2026-01-22)


### Bug Fixes

* address code review comments ([43f3e18](https://github.com/Fyzz-Chat/fyzz-chat/commit/43f3e18fc8fea4b4dbc164543efc9d9fa25dfd16))
* **dialog:** revert top left slide in in favor of simple reveal ([1ec0766](https://github.com/Fyzz-Chat/fyzz-chat/commit/1ec0766309df091ae12f5931bb59c19bdd8a456e))
* **login:** forgot password cannot be tabbed ([3c9bbbe](https://github.com/Fyzz-Chat/fyzz-chat/commit/3c9bbbed6223c3d9b80528aa350b0a2186309ccc))
* **providers:** add missing types ([149799e](https://github.com/Fyzz-Chat/fyzz-chat/commit/149799e9aee2256faef41c1d6c42bfac46484f57))
* **translations:** memoize translations ([d9ecc4a](https://github.com/Fyzz-Chat/fyzz-chat/commit/d9ecc4a5b47493984c05ac206807f879638a2a38))


### Features

* **auth:** add authPopup and remove sidebar when user not logged in ([0bb9597](https://github.com/Fyzz-Chat/fyzz-chat/commit/0bb9597042d0e513a3c6744fc467666cdfa11f30))
* **auth:** fill login and register with email address ([086cea8](https://github.com/Fyzz-Chat/fyzz-chat/commit/086cea86c2929f464fefd9426574d059201d5a9a))
* **db:** add indexes to common columns to increase performance ([c46671c](https://github.com/Fyzz-Chat/fyzz-chat/commit/c46671c6cb235f715a643296deea8dcd72f4230e))
* implement first step login and sign up popup ([a1d7083](https://github.com/Fyzz-Chat/fyzz-chat/commit/a1d7083c25ba670d68efe9b63f66281c5460acd3))

# [0.14.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.13.1...v0.14.0) (2026-01-11)


### Bug Fixes

* **cloudformation:** update ami to latest supported version ([1365888](https://github.com/Fyzz-Chat/fyzz-chat/commit/13658882fbb6d4e504218a790f3b48fe692a77ca))


### Features

* **cloudformation:** add https listener depending on certificate set ([79ea64a](https://github.com/Fyzz-Chat/fyzz-chat/commit/79ea64a5cb75ea71d4017994e5ff6ee523b3e340))
* **db:** add migration task definition ([152f887](https://github.com/Fyzz-Chat/fyzz-chat/commit/152f887b32b951f19c6caffbcb7dcca52071891e))

## [0.13.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.13.0...v0.13.1) (2026-01-11)


### Bug Fixes

* **db:** fix migration image command ([74ba34e](https://github.com/Fyzz-Chat/fyzz-chat/commit/74ba34e96bd0ddb54ccab350403611a0fd4be92c))

# [0.13.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.12.1...v0.13.0) (2026-01-11)


### Features

* add agent instructions and mcp servers ([a6f1586](https://github.com/Fyzz-Chat/fyzz-chat/commit/a6f158693f87ccaa9040598c19d551d553acd3bc))
* add cloudformation config ([c081271](https://github.com/Fyzz-Chat/fyzz-chat/commit/c0812718b51d54f4921619204d9e9e2f724f31d8))
* add rds to stack ([e1ae7e3](https://github.com/Fyzz-Chat/fyzz-chat/commit/e1ae7e38dd40b4855e8b3703b735bc2241472520))
* **input:** add option to instantly fill a new chat's input ([67da666](https://github.com/Fyzz-Chat/fyzz-chat/commit/67da6661c0ebf49e28f6c315cf4f3e5013cd2b89))
* **logger:** add colored logs ([d5a9261](https://github.com/Fyzz-Chat/fyzz-chat/commit/d5a92614056816baf5f8915910a1cef7f53d5035))

## [0.12.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.12.0...v0.12.1) (2026-01-02)


### Bug Fixes

* **auth:** delete user account correctly ([c36e03d](https://github.com/Fyzz-Chat/fyzz-chat/commit/c36e03d79d6fe3d2b07c6f1c30b85c5aa0fe88ff))

# [0.12.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.11.1...v0.12.0) (2026-01-02)


### Features

* add current file debug script and recommended bun vs code extension ([1f1f63e](https://github.com/Fyzz-Chat/fyzz-chat/commit/1f1f63e6d7f0f67300222a03b6bdfe96d7383eba))
* **ai:** upgrade to version 6 ([1bd0909](https://github.com/Fyzz-Chat/fyzz-chat/commit/1bd09095feb735a55474a717bbbc6d9466d80e05))

## [0.11.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.11.0...v0.11.1) (2025-12-24)


### Bug Fixes

* **images:** show uploaded images correctly ([d658721](https://github.com/Fyzz-Chat/fyzz-chat/commit/d6587216d8501c73908a2bc5e4f22bc11e2fd684))

# [0.11.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.10.0...v0.11.0) (2025-12-23)


### Features

* **google:** add vision to gemma ([2ee9ad5](https://github.com/Fyzz-Chat/fyzz-chat/commit/2ee9ad57af196a5e29a4bd16d839dc91191d6de0))

# [0.10.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.9.0...v0.10.0) (2025-12-22)


### Features

* **google:** add gemma 3 ([7520e46](https://github.com/Fyzz-Chat/fyzz-chat/commit/7520e46b18a6e63dfc6ee317afcc2717617175c1))

# [0.9.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.8.0...v0.9.0) (2025-12-21)


### Bug Fixes

* **auth:** fetch conversations after login ([f78c91c](https://github.com/Fyzz-Chat/fyzz-chat/commit/f78c91ce70823e92c2ec50d93e45e4ae6f10cea2))
* **images:** show images in correct size on click ([9166740](https://github.com/Fyzz-Chat/fyzz-chat/commit/91667402f626b725e07535e432c2e70c867493b9))
* **input:** handle not loaded model ([b762649](https://github.com/Fyzz-Chat/fyzz-chat/commit/b7626499d03959818fc1bab5904731641de8a335))
* **sign-out:** clear conversations on signout ([ca19ef6](https://github.com/Fyzz-Chat/fyzz-chat/commit/ca19ef6a191f177630b063ee516957a8b5d6ad7f))


### Features

* add coderabbit config ([116f455](https://github.com/Fyzz-Chat/fyzz-chat/commit/116f4555da6a3f588f10dfa2c9205a52c5351672))
* add mcp tool finish handler ([c548934](https://github.com/Fyzz-Chat/fyzz-chat/commit/c5489342ed1847e90a136ecc156dc6ed17690bb3))
* **image-generation:** add openai image generation ([4602564](https://github.com/Fyzz-Chat/fyzz-chat/commit/46025643ae13f2aa2f8fd22025467184bd370ae8))
* **mcp:** add ai elements mcp server ([4bd0216](https://github.com/Fyzz-Chat/fyzz-chat/commit/4bd0216e14f9bd8179fa6a88079af6f2d6096112))
* **mcp:** add shadcn mcp server ([384dd19](https://github.com/Fyzz-Chat/fyzz-chat/commit/384dd190307b7e03445d9020eab55785c294f69a))
* **models:** introduce cost multiplier ([190e3f5](https://github.com/Fyzz-Chat/fyzz-chat/commit/190e3f537df89bd6155325c9e9fed66d00874a37))
* **models:** show cost multiplier ([2242bd6](https://github.com/Fyzz-Chat/fyzz-chat/commit/2242bd64865de3d200c9796ca709bd19ee37dbeb))

# [0.8.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.7.0...v0.8.0) (2025-12-19)


### Bug Fixes

* hooks dependency arrays ([3f5e9d6](https://github.com/Fyzz-Chat/fyzz-chat/commit/3f5e9d61f9cfc8d19eb9d9f3533d544b96f735dc))
* **icons:** use accessible properties ([8c916b7](https://github.com/Fyzz-Chat/fyzz-chat/commit/8c916b7d87602082aa3cc0d56f52b432068e4953))
* **model-menu:** adjust height correctly ([88fddc6](https://github.com/Fyzz-Chat/fyzz-chat/commit/88fddc6ca10c01e433f06f783105ea0db9f54582))


### Features

* **biome:** include email in lint ([cd1b32c](https://github.com/Fyzz-Chat/fyzz-chat/commit/cd1b32c4ff2de7585e236c91273253b7087893fd))

# [0.7.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.6.1...v0.7.0) (2025-12-18)


### Bug Fixes

* **chat:** set title correctly for new conversations ([bef7f24](https://github.com/Fyzz-Chat/fyzz-chat/commit/bef7f247d1920f16173b970e1514d780599cf749))
* **model-menu:** pass status to mobile menu ([784ea7a](https://github.com/Fyzz-Chat/fyzz-chat/commit/784ea7aaee223037cd4616a71021ce26d4808791))
* **model:** set height dynamically ([ef40bf1](https://github.com/Fyzz-Chat/fyzz-chat/commit/ef40bf1e6fc91978c0b5393adf76894abf9f105e))
* **models:** remove pdf from haiku 3 ([1ab9e0f](https://github.com/Fyzz-Chat/fyzz-chat/commit/1ab9e0f07f5bd6973df506b166052ca039334278))
* **settings:** fix jump on navigation ([1880d45](https://github.com/Fyzz-Chat/fyzz-chat/commit/1880d459156619b62157216c4e1863e24fd7ada0))


### Features

* **models:** add gemini 3 flash ([5a07874](https://github.com/Fyzz-Chat/fyzz-chat/commit/5a07874e6393240a4184fbb1c31cbf84ac96ff2d))
* **models:** add gpt 5.2 ([280a28d](https://github.com/Fyzz-Chat/fyzz-chat/commit/280a28d5d9f6ec149e80105d9002a390e448416d))

## [0.6.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.6.0...v0.6.1) (2025-12-14)


### Bug Fixes

* **read-url:** revert to raw fetch ([af3536a](https://github.com/Fyzz-Chat/fyzz-chat/commit/af3536a1c6acfb52cf5aa11bd6022a4050e413f0))

# [0.6.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.5.0...v0.6.0) (2025-12-14)


### Bug Fixes

* **anthropic:** ensure tool calls have results ([726223b](https://github.com/Fyzz-Chat/fyzz-chat/commit/726223bae488f31500efd1cb703d5a794ee8e235))
* **model-menu:** clean up imports ([5b6b1d0](https://github.com/Fyzz-Chat/fyzz-chat/commit/5b6b1d09652a7c00e79d546729639a9516ff3d2f))
* update readme ([4cdd357](https://github.com/Fyzz-Chat/fyzz-chat/commit/4cdd3578fadc4f138772868bc3c65f77559bc1a6))


### Features

* **header:** link to github version ([b8064cc](https://github.com/Fyzz-Chat/fyzz-chat/commit/b8064ccc9275e7bbaac494dd38247f464961c305))
* **model-menu:** highlight active model ([aa67d0d](https://github.com/Fyzz-Chat/fyzz-chat/commit/aa67d0d257610d9a1df0df6c63bdfa2ed6e3beef))

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
