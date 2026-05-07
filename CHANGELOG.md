## [0.40.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.40.0...v0.40.1) (2026-05-07)


### Bug Fixes

* check token limit in entire message history ([e2951db](https://github.com/Fyzz-Chat/fyzz-chat/commit/e2951db8494267aa8e022ae752b8ea368fe582b9))

# [0.40.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.39.0...v0.40.0) (2026-05-07)


### Bug Fixes

* **auth:** cache session in cookie ([ff35d49](https://github.com/Fyzz-Chat/fyzz-chat/commit/ff35d49608c6455a7905312a9c563f9183557efe))
* clear error state on error ([271f8d7](https://github.com/Fyzz-Chat/fyzz-chat/commit/271f8d7acc20623672bda87e4fd47a30886e0449))
* **input:** break long words ([8d0306a](https://github.com/Fyzz-Chat/fyzz-chat/commit/8d0306aa45662f3726f20fc84b8b356633d22f71))


### Features

* **errors:** add error boundary components for app and global error handling ([77dd8c5](https://github.com/Fyzz-Chat/fyzz-chat/commit/77dd8c509efc64c8bc5b5c7f643559f8a2c9c647))
* **token-limits:** implement token limit enforcement for messages and texts ([942e806](https://github.com/Fyzz-Chat/fyzz-chat/commit/942e806a5022b7b7aaf0dc63380f4535ad43f5f2))
* **unpdf:** add unpdf dependency and implement attachment token counter ([ad84200](https://github.com/Fyzz-Chat/fyzz-chat/commit/ad84200b11b466c5a8235979d63b2bff93cf3662))

# [0.39.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.38.0...v0.39.0) (2026-05-01)


### Bug Fixes

* **chat:** remove metadata generation from ChatIdPage and set document title in ChatMessageList ([d6c99bc](https://github.com/Fyzz-Chat/fyzz-chat/commit/d6c99bc08cfddf0a5d2e84bb157e1bbbf9dafcd7))


### Features

* **agents:** introduce boilerplate-first rendering guidelines for data-bound widgets ([5eb66a8](https://github.com/Fyzz-Chat/fyzz-chat/commit/5eb66a83bf6e501de4c5ff0b7309a808e3ea63c7))
* **chat:** implement prefetching for conversation and messages in ChatIdPage ([31fbdde](https://github.com/Fyzz-Chat/fyzz-chat/commit/31fbddeca5d0bb21a6ca0ac0c2ab6f4ea1eb07e3))
* **projects:** enhance project page with new header, handlers, and loading skeletons ([82af2c1](https://github.com/Fyzz-Chat/fyzz-chat/commit/82af2c1111a89439b55723c8b6ec92284460a260))

# [0.38.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.37.0...v0.38.0) (2026-05-01)


### Bug Fixes

* **chat:** rely on sequence for message ordering ([b170c33](https://github.com/Fyzz-Chat/fyzz-chat/commit/b170c3395107bbcb70dbacb3d958d100fff0a78c))


### Features

* **research:** enhance chat input and settings for deep research integration ([5546582](https://github.com/Fyzz-Chat/fyzz-chat/commit/55465824bb3b6ddca2f26c62defefadf03702ac7))
* **research:** enhance deep research functionality and UI integration ([f1bb9b3](https://github.com/Fyzz-Chat/fyzz-chat/commit/f1bb9b3a7eb57b5a537c764ed1b58a9e17443d8f))
* **research:** implement deep research functionality with OpenAI integration ([e5a72cd](https://github.com/Fyzz-Chat/fyzz-chat/commit/e5a72cd97166468d7197311ce2dc1fb2fcda5857))
* **research:** update conversation title during deep research initiation ([0abce26](https://github.com/Fyzz-Chat/fyzz-chat/commit/0abce2637a3a7768d9713660ed2cea390537ffe3))

# [0.37.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.36.0...v0.37.0) (2026-04-26)


### Bug Fixes

* **chat:** prefetch with same key as the actual page load ([ec0f6bc](https://github.com/Fyzz-Chat/fyzz-chat/commit/ec0f6bc26355dd179917ca0af2958ac861274585))
* **chat:** simplify message editing by removing saving state and improving edit handling ([6cf9f73](https://github.com/Fyzz-Chat/fyzz-chat/commit/6cf9f73f5b1109eaaf239770501559d97971d34a))
* **conversations:** simplify title generation by extracting the first user prompt ([6736fce](https://github.com/Fyzz-Chat/fyzz-chat/commit/6736fce8a959cc0b25c0d06c4d748cad0dff3653))
* **sidebar:** pass user prop to prevent hydration error ([3a81612](https://github.com/Fyzz-Chat/fyzz-chat/commit/3a8161206b447afc9278b2faf897f77d561e62e7))
* **title:** allow shorter than 4 word titles ([02ed5c3](https://github.com/Fyzz-Chat/fyzz-chat/commit/02ed5c3c907bc6586970624ae9feacdac495948e))


### Features

* **google:** add gemma 4 models ([ebda74d](https://github.com/Fyzz-Chat/fyzz-chat/commit/ebda74d4869876e1b6e590eb7873ad79f24c3ba4))
* **tool:** show search results and queries better ([0563e5e](https://github.com/Fyzz-Chat/fyzz-chat/commit/0563e5ec98a08cabc5e9ea8eabf59bd5544b4bf0))

# [0.36.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.35.0...v0.36.0) (2026-04-25)


### Bug Fixes

* **openai:** update image generation output format and parameters to improve quality ([b4f32c8](https://github.com/Fyzz-Chat/fyzz-chat/commit/b4f32c85adc2e7f93752a379357e3ed72ee303d4))


### Features

* **openai:** update image generation model to gpt-image-2 ([60c8e3b](https://github.com/Fyzz-Chat/fyzz-chat/commit/60c8e3b4b277d2538b4e41da1581ca5f2cb2b131))
* **providers:** add GPT-5.4 nano, GPT-5.4 mini, GPT-5.5, Kimi K2.6 ([6254dea](https://github.com/Fyzz-Chat/fyzz-chat/commit/6254dea8435448e98714c646f52de05199c56f66))

# [0.35.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.34.0...v0.35.0) (2026-04-24)


### Features

* **accordion:** add new component ([00209ce](https://github.com/Fyzz-Chat/fyzz-chat/commit/00209ce8bd41b848647ed5a92c46f7388e484833))
* **memories:** add browser memory selection and user memory queries ([875fa73](https://github.com/Fyzz-Chat/fyzz-chat/commit/875fa73faa336d48be50c6f41a6ab080d80da7d8))
* **memories:** add ConfidenceBar component to display memory confidence visually ([d31d735](https://github.com/Fyzz-Chat/fyzz-chat/commit/d31d7354520139c8516c6bccfa8e0d1d1aa42f21))
* **memories:** add function to group project memories by type ([e7d528c](https://github.com/Fyzz-Chat/fyzz-chat/commit/e7d528ccc826ca4e0efbe23624af9766be596f5b))
* **memories:** implement memory removal function and enhance project memory deletion ([249c625](https://github.com/Fyzz-Chat/fyzz-chat/commit/249c625eaaed9373aade4f813e41c42f888698b0))
* **memories:** refactor memory retrieval to group user memories by type ([cb8b097](https://github.com/Fyzz-Chat/fyzz-chat/commit/cb8b097e162d6ca3068df962728e9402c3aeda49))
* **memory-browser:** introduce TypedMemoryBrowser component ([29db50e](https://github.com/Fyzz-Chat/fyzz-chat/commit/29db50e0db5d4dae9b0ab1c2e5ed020fcacd0aeb))
* **memory:** add agent memory prompt for retrieving user and project memories ([57d4f32](https://github.com/Fyzz-Chat/fyzz-chat/commit/57d4f32c52526b9262b76e379911fd702d3bea85))
* **memory:** add functionality to retrieve recent low-rated messages in agent memory prompt ([7a87edc](https://github.com/Fyzz-Chat/fyzz-chat/commit/7a87edcb9f769033d8557f08c89c04992be65b57))
* **memory:** add functions for querying and creating typed memories ([33c4e83](https://github.com/Fyzz-Chat/fyzz-chat/commit/33c4e83d98ff760573b324fbbeaa27544fa125c3))
* **memory:** add project metadata retrieval to agent memory prompt generation ([3462639](https://github.com/Fyzz-Chat/fyzz-chat/commit/346263964d1a1b695a3f76bb18ea7fb555663bf5))
* **memory:** enhance opinion management by implementing retirement logic ([7b0a50d](https://github.com/Fyzz-Chat/fyzz-chat/commit/7b0a50d950443476c2c4f48a82d59570930b25e4))
* **memory:** implement agent memory tools for storing facts, opinions, learnings, feedback ([2fa3df4](https://github.com/Fyzz-Chat/fyzz-chat/commit/2fa3df4501df767fb11e9653b0aecd51d8f53df3))
* **memory:** implement fair packing of memory items and enforce character limits for memory content ([67eb7d8](https://github.com/Fyzz-Chat/fyzz-chat/commit/67eb7d8d7d74962405e4ced56f72571effb70fdb))
* **memory:** integrate user persona retrieval into agent memory prompt generation ([d3bcd97](https://github.com/Fyzz-Chat/fyzz-chat/commit/d3bcd97244c3f0aba8622ed5d498f6ea6815c92f))
* **memory:** introduce typed memory ([680573d](https://github.com/Fyzz-Chat/fyzz-chat/commit/680573d0b18adf271e94bac7d51a93942cc0c2b7))
* **memory:** update memory handling to use agent memory tools and prompts ([98a4ed9](https://github.com/Fyzz-Chat/fyzz-chat/commit/98a4ed92bba652d31eea131f7315c16a2d4fcad2))
* **persona:** add PersonaForm component for user display and agent name management ([51c74c7](https://github.com/Fyzz-Chat/fyzz-chat/commit/51c74c7ef4a891cb4c2caff474cc4a0b84f69fa0))
* **queries:** enable refetching of project memories and skills on mount ([fab99df](https://github.com/Fyzz-Chat/fyzz-chat/commit/fab99dfbb78836cb464cf595a4930e41de57acdf))
* **ratings:** add rating actions for messaging with upsert and delete functionality ([243d098](https://github.com/Fyzz-Chat/fyzz-chat/commit/243d098ce9a907206a3b0bba23c6cdb40113ce7f))
* **ratings:** add ratings model ([e1aac6e](https://github.com/Fyzz-Chat/fyzz-chat/commit/e1aac6e148dc687864bdd518123818d4144f0cfb))
* **ratings:** implement rating functionality with upsert, retrieval, and deletion methods ([930d0b6](https://github.com/Fyzz-Chat/fyzz-chat/commit/930d0b6ebba98042f0ccd0aa2feeecf9a2fae13c))
* **ratings:** integrate MessageRating component for user feedback on messages ([232dcaf](https://github.com/Fyzz-Chat/fyzz-chat/commit/232dcafd466ad3d6ddf46fd7fa11dddf794e2a3f))
* **user:** add agentName and displayName fields to User model ([3fd722d](https://github.com/Fyzz-Chat/fyzz-chat/commit/3fd722dfc1d8effdc5e2fd55a2d5cb0bb20189b7))

# [0.34.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.33.0...v0.34.0) (2026-04-23)


### Features

* **chat:** integrate SkillSlashMenu for skill command input ([619e443](https://github.com/Fyzz-Chat/fyzz-chat/commit/619e44328b0241666f3b74b14915494de822d2a0))
* **skills:** enhance SkillSlashMenu with project skills ([aecf512](https://github.com/Fyzz-Chat/fyzz-chat/commit/aecf5123805eb1e7d6349c2acd741388d72e9963))

# [0.33.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.32.1...v0.33.0) (2026-04-23)


### Features

* **settings:** add skills management section and integrate skills form ([564ba83](https://github.com/Fyzz-Chat/fyzz-chat/commit/564ba836ee0607619a1f06a9a4c6f087e33fe635))
* **skills:** add activate skill tool and integrate into runtime ([db51e13](https://github.com/Fyzz-Chat/fyzz-chat/commit/db51e13c5fe84ef9d4abdc41644a7b24dc940afa))
* **skills:** add copy functionality for skills with tooltip feedback ([7abd23a](https://github.com/Fyzz-Chat/fyzz-chat/commit/7abd23aeb19f1452b8308537148e86d42f700352))
* **skills:** add frontmatter parsing for skill input fields ([16e20dc](https://github.com/Fyzz-Chat/fyzz-chat/commit/16e20dc70ed739884ca30a2857f9746229ff12bc))
* **skills:** implement skill dao ([e8d422c](https://github.com/Fyzz-Chat/fyzz-chat/commit/e8d422c533d1cea51b1f6df7165153b214e475df))
* **skills:** implement skill management actions and integrate into TRPC router ([c418507](https://github.com/Fyzz-Chat/fyzz-chat/commit/c418507f69ab525fc1dda44c5f84cbbc1f1d007b))
* **skills:** integrate project skills ([6ae68ed](https://github.com/Fyzz-Chat/fyzz-chat/commit/6ae68edeaa78424943cb776d37b4026c97952497))
* **skills:** introduce skills table ([ca4a747](https://github.com/Fyzz-Chat/fyzz-chat/commit/ca4a747641853a2b03b4898a95969bb8b3bcd511))
* **skills:** show skill activation in chat ([87a8649](https://github.com/Fyzz-Chat/fyzz-chat/commit/87a8649331129be7e6e207c157cbbb09bfa684ea))
* **skills:** start supporting project-specific skills ([bc90ae9](https://github.com/Fyzz-Chat/fyzz-chat/commit/bc90ae9cb0b0b3161e9febf986f988d1be7654d9))
* **skills:** support optional project association ([90c8b12](https://github.com/Fyzz-Chat/fyzz-chat/commit/90c8b12d5074ebfa0bdcacb8cb66484df2d29c71))
* **system-prompt:** refactor system prompt generation to include skills ([ad900e4](https://github.com/Fyzz-Chat/fyzz-chat/commit/ad900e4cc3a6e4bb3bf895b142206e4e9bae7b34))

## [0.32.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.32.0...v0.32.1) (2026-04-22)


### Bug Fixes

* set meta title for conversations to chat title ([37e90e8](https://github.com/Fyzz-Chat/fyzz-chat/commit/37e90e8a956ae1fdddf53c27a5a79992c9aa75c1))
* **title:** limit model input to 2000 chars or 4 messages ([c6652a9](https://github.com/Fyzz-Chat/fyzz-chat/commit/c6652a9d40fba551e6f0ae756e558bac0bba59b8))

# [0.32.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.31.0...v0.32.0) (2026-04-16)


### Features

* update anthropic models, add opus 4.7 ([e0884fb](https://github.com/Fyzz-Chat/fyzz-chat/commit/e0884fb6a4432d1876b1f63bfe810c0c36bd8416))

# [0.31.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.30.0...v0.31.0) (2026-03-19)


### Bug Fixes

* **api-keys:** let new keys be deleted ([47e8c19](https://github.com/Fyzz-Chat/fyzz-chat/commit/47e8c19e3de9c0e31ca57830ea3235aa9b886960))


### Features

* **api-keys:** implement API key management functionality ([cf579d7](https://github.com/Fyzz-Chat/fyzz-chat/commit/cf579d748662f0e82e6fea72b337fd5c75abb0af))

# [0.30.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.29.0...v0.30.0) (2026-03-15)


### Features

* **gemini:** add 3.1 flash lite and nano banana 2 ([ab4b206](https://github.com/Fyzz-Chat/fyzz-chat/commit/ab4b206b892b023673b02f739cdbb2a3df13271f))
* **gemini:** add markdown and csv support ([d69c674](https://github.com/Fyzz-Chat/fyzz-chat/commit/d69c6743ee652006ed795318eb87d3aed4611a83))
* **gemini:** add nano banana pro ([8327296](https://github.com/Fyzz-Chat/fyzz-chat/commit/83272967492b70f3a537e721e12e5a49c81c2f16))
* **gemini:** add plaintext type to gemini models ([58cffda](https://github.com/Fyzz-Chat/fyzz-chat/commit/58cffda1f39964a0cd5c224c8e43fc1c484760d6))

# [0.29.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.28.0...v0.29.0) (2026-03-14)


### Features

* **auth:** implement domain restriction for user registration and login ([ba3a934](https://github.com/Fyzz-Chat/fyzz-chat/commit/ba3a9342d6c54376a9d1277fed826ca7a1ae6c5b))

# [0.28.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.27.0...v0.28.0) (2026-03-14)


### Features

* add lint skill ([189a78e](https://github.com/Fyzz-Chat/fyzz-chat/commit/189a78ea2a683649505a452a289167ea03f94c24))
* **agents.md:** extend with useChat special rules ([e347f33](https://github.com/Fyzz-Chat/fyzz-chat/commit/e347f33a6a018720d8b852cc50cc3fb7256487de))
* **agents:** add optimize skill ([6f6ca82](https://github.com/Fyzz-Chat/fyzz-chat/commit/6f6ca823300299148411b11b237ff760c91c0e84))
* **agents:** add remember skill ([b822366](https://github.com/Fyzz-Chat/fyzz-chat/commit/b8223667afd63f1251895d5376b8dadacc3bf4cc))
* **claude:** add build hook ([f0c27fa](https://github.com/Fyzz-Chat/fyzz-chat/commit/f0c27fa0a18c2f767f8b0ef3104595b32a4b7449))
* **claude:** commit allowlisted settings ([6337349](https://github.com/Fyzz-Chat/fyzz-chat/commit/6337349c0757f7bf7b46cb4a23b823aa4c640db7))
* **opencode:** add lint plugin ([f6efc23](https://github.com/Fyzz-Chat/fyzz-chat/commit/f6efc237537d3f34aa0ca0e412ae6a395d56154b))

# [0.27.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.26.1...v0.27.0) (2026-03-13)


### Bug Fixes

* **input:** clear debounce save when message is quickly sent after typing ([6ef8933](https://github.com/Fyzz-Chat/fyzz-chat/commit/6ef89338d0b76e1822f9b27990ba4e66059b6b2b))
* **react-scan:** use lib correctly ([5d7764c](https://github.com/Fyzz-Chat/fyzz-chat/commit/5d7764ce01a8b4f6505f9e41e42f30fbe23f47c2))
* **regenerate:** make logic stable ([fcd79da](https://github.com/Fyzz-Chat/fyzz-chat/commit/fcd79daab1b718a226109ea5531808b46c909118))
* **streamdown:** add temporary horizontal scroll fix ([2e04dca](https://github.com/Fyzz-Chat/fyzz-chat/commit/2e04dca75105b0b4bb5e379aa774819eaaa6c96a))


### Features

* **anthropic:** add cache control to system message, files, and last user message ([3800c0d](https://github.com/Fyzz-Chat/fyzz-chat/commit/3800c0de1d736b41bfb4f3ec398f62d30ef45680))

## [0.26.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.26.0...v0.26.1) (2026-03-11)


### Bug Fixes

* prevent the upload of unsupported file types ([cf268a9](https://github.com/Fyzz-Chat/fyzz-chat/commit/cf268a9273650178eeaa38e9bce24e0e67667e26))
* **search:** make search work again ([b4e603b](https://github.com/Fyzz-Chat/fyzz-chat/commit/b4e603ba8b3f73037ac63c428a91084252a8ae3a))

# [0.26.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.25.1...v0.26.0) (2026-03-08)


### Bug Fixes

* **projects:** align back button correctly ([31205dc](https://github.com/Fyzz-Chat/fyzz-chat/commit/31205dcedc67a2d39394483efbac7975cf06df02))


### Features

* introduce memories table, migrate old user memories, introduce project memories ([cf5b019](https://github.com/Fyzz-Chat/fyzz-chat/commit/cf5b0192e356e5f1ac853adfd862d583f2f46aae))
* **project:** include project name and description in the system prompt ([4947001](https://github.com/Fyzz-Chat/fyzz-chat/commit/4947001ae4091b6d058ee1122b529bb692f1e174))
* **projects:** show project memories ([9b58f69](https://github.com/Fyzz-Chat/fyzz-chat/commit/9b58f6977d19f27a5c221b9452eed2f8b91646ec))

## [0.25.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.25.0...v0.25.1) (2026-03-08)


### Bug Fixes

* **projects:** only update the relevant list when a new conversation is created ([607656f](https://github.com/Fyzz-Chat/fyzz-chat/commit/607656fafc5f0bd3ffd525612a718f7241bc7da5))

# [0.25.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.24.0...v0.25.0) (2026-03-08)


### Bug Fixes

* **projects:** update conversation count when new one is started ([d988a0c](https://github.com/Fyzz-Chat/fyzz-chat/commit/d988a0c9d90667c41a892aa57420dff756e52855))


### Features

* add feature icons ([47220e3](https://github.com/Fyzz-Chat/fyzz-chat/commit/47220e3332224b39ffc85d3fd9906e500178a8a3))
* introduce project pages ([22f7d06](https://github.com/Fyzz-Chat/fyzz-chat/commit/22f7d062687eac619a3fe189b71a1d1697f4fb0f))
* introduce projects list ([48ee662](https://github.com/Fyzz-Chat/fyzz-chat/commit/48ee662a5b563d75b3ae09394a49a6bbc73fd3a4))
* **projects:** introduce optional description field ([2520613](https://github.com/Fyzz-Chat/fyzz-chat/commit/252061313e4fafd7599ab3cd02e1cc1c895beb3c))

# [0.24.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.23.0...v0.24.0) (2026-03-06)


### Bug Fixes

* **auth:** login popup shows on first message ([9a0bc3e](https://github.com/Fyzz-Chat/fyzz-chat/commit/9a0bc3e83c25502c046eb0a99c969d889ec86191))
* **logout:** clean up thoroughly on logout ([a466291](https://github.com/Fyzz-Chat/fyzz-chat/commit/a466291f3671a4c216a17e767c7951827af4edbe))


### Features

* **openai:** add image generation to more models ([163e111](https://github.com/Fyzz-Chat/fyzz-chat/commit/163e111069b453ab315a02490df97ee53b2156ff))

# [0.23.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.22.0...v0.23.0) (2026-03-06)


### Features

* **models:** add gpt-5.4 ([209871d](https://github.com/Fyzz-Chat/fyzz-chat/commit/209871def4ab1c7bf8e82645e4c64a8ce77cbd09))

# [0.22.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.21.0...v0.22.0) (2026-03-03)


### Bug Fixes

* **models:** remove deprecated models, update existing ones ([410ef7d](https://github.com/Fyzz-Chat/fyzz-chat/commit/410ef7dd30757c2511c944c49667057dbb7437e8))
* **projects:** only populate the full list with initial data ([8c08871](https://github.com/Fyzz-Chat/fyzz-chat/commit/8c08871d854a00cbd805c3ec35c1a3c693eca856))


### Features

* add better logging to chat endpoint ([3419df3](https://github.com/Fyzz-Chat/fyzz-chat/commit/3419df310dd6ee5be62d71f484a900857ba1bff3))
* add code execution tools to claude models ([5002b40](https://github.com/Fyzz-Chat/fyzz-chat/commit/5002b40b260ce66bedbf4fe18c59160e11fbe4a3))
* add projects table ([46001c3](https://github.com/Fyzz-Chat/fyzz-chat/commit/46001c3ad91cf09cc5644cb7766b6c76a46c695a))
* **projects:** add dao and actions ([d3b0afa](https://github.com/Fyzz-Chat/fyzz-chat/commit/d3b0afa600a237cd05e454f35124c0b321b224b7))
* **projects:** add mobile drawer menu ([fbeda38](https://github.com/Fyzz-Chat/fyzz-chat/commit/fbeda38f4f996fc2cb0768a13058a50a31ea16c7))
* **projects:** add option to assign conversations to projects ([f54d3e2](https://github.com/Fyzz-Chat/fyzz-chat/commit/f54d3e2857f86d6711ad56baee502e77f7e93e55))
* **projects:** add option to delete and rename projects ([0736f89](https://github.com/Fyzz-Chat/fyzz-chat/commit/0736f89aa5428fb64cb8307cb3f95db1aaf02f31))
* **projects:** add sidebar menu ([e62e743](https://github.com/Fyzz-Chat/fyzz-chat/commit/e62e7431d5b4dc9df8f9d8213701366a6a70b962))
* **projects:** branching a conversation in a project stays in the project ([98a4f11](https://github.com/Fyzz-Chat/fyzz-chat/commit/98a4f114b89fc15629816da789b370de38698cab))
* **projects:** introduce queries and trpc endpoints ([861ee28](https://github.com/Fyzz-Chat/fyzz-chat/commit/861ee28ab5e286b662d850d5d6a5bdfeed1e5f73))

# [0.21.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.20.0...v0.21.0) (2026-03-01)


### Features

* **branching:** add optimistic UI updates ([e157ca9](https://github.com/Fyzz-Chat/fyzz-chat/commit/e157ca9edd3de341d9f882f03ca4e5236793e57e))
* **branching:** implement file copying ([f0e6452](https://github.com/Fyzz-Chat/fyzz-chat/commit/f0e64523e3f8a44fbe6017ecfa09f8aa3fe3f76a))
* implement branching logic without file operations ([740a909](https://github.com/Fyzz-Chat/fyzz-chat/commit/740a90968eff8bed3684cefb48b11142176f8c99))

# [0.20.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.19.0...v0.20.0) (2026-03-01)


### Bug Fixes

* enforce runtime preset declaration for all models and update provider configuration ([60df404](https://github.com/Fyzz-Chat/fyzz-chat/commit/60df404ceade10e24f99e9e9684d004a3a92d6a6))
* **mcp:** refer to mcp.json correctly ([de15f81](https://github.com/Fyzz-Chat/fyzz-chat/commit/de15f81dc3f0918f502b1152cafc6cab2f575608))
* **tools:** remove tool messages from history for models not supporting tools ([8d142f4](https://github.com/Fyzz-Chat/fyzz-chat/commit/8d142f49d3673baafad81b8a32d880182747b98a))


### Features

* add provider tests for xai ([d23ec6f](https://github.com/Fyzz-Chat/fyzz-chat/commit/d23ec6f3905c5189a8321314eeee7a8fd69ef47e))
* add reasoning effort to fireworks models ([bce4c32](https://github.com/Fyzz-Chat/fyzz-chat/commit/bce4c3280c9bbb0306924593c7f32ce3785934d5))
* add reasoning effort to settings ([4663092](https://github.com/Fyzz-Chat/fyzz-chat/commit/4663092eea28586cf27fdb4ac52bbb8ca52f5da1))
* add sequence to messages ([04bba47](https://github.com/Fyzz-Chat/fyzz-chat/commit/04bba47dc1789f233b7a23c35c3a82cbf151d771))
* add todos where sequence must be set as default ordering once prod is migrated ([15abda3](https://github.com/Fyzz-Chat/fyzz-chat/commit/15abda318f90e2a74b8ef14e417a9dc2de2ec738))
* add vercel ai sdk skill ([d7fd4a0](https://github.com/Fyzz-Chat/fyzz-chat/commit/d7fd4a0877d3ef3075d53f2aa0d9005ea8fc3e57))
* enhance logging for message sequence handling and retries ([31183b9](https://github.com/Fyzz-Chat/fyzz-chat/commit/31183b910581eaa74608eeeac59ba1b09cb2c6d0))
* **grok:** add x search tools ([4ccbb76](https://github.com/Fyzz-Chat/fyzz-chat/commit/4ccbb76e63919ad5ec83505a4d0091343fc39bfd))
* **messages:** only load the last 16 message by default ([e063e77](https://github.com/Fyzz-Chat/fyzz-chat/commit/e063e773aff332c377dbf2a628d2d3c09f00dcf0))
* run tests in ci, pre commit, and agent hooks ([09faafb](https://github.com/Fyzz-Chat/fyzz-chat/commit/09faafbaeeb8ae569883747551fd05c907ff5926))
* **share:** add option to delete shares ([6844428](https://github.com/Fyzz-Chat/fyzz-chat/commit/6844428568b22fe141569d760607867a0f021698))
* **tests:** add comprehensive tests for provider configuration and runtime behavior ([8337335](https://github.com/Fyzz-Chat/fyzz-chat/commit/8337335d3676976b0ae76c6fe9baffa593c2050c))
* use sequence when saving messages ([6080d22](https://github.com/Fyzz-Chat/fyzz-chat/commit/6080d22b5af6c6bf46488c1aec11a5a777c9eb75))

# [0.19.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.18.0...v0.19.0) (2026-02-25)


### Bug Fixes

* make default model work ([4bab929](https://github.com/Fyzz-Chat/fyzz-chat/commit/4bab92920f837ace17eb7deac6dca9dfd1ba416a))


### Features

* add agent hooks ([e5420b3](https://github.com/Fyzz-Chat/fyzz-chat/commit/e5420b328b01031850c8576e98083347b93cd5e4))
* add csv and video support to gemini models ([fdba4e6](https://github.com/Fyzz-Chat/fyzz-chat/commit/fdba4e689b1a34593184211ac86b162ccf26d824))

# [0.18.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.17.0...v0.18.0) (2026-02-24)


### Bug Fixes

* add back browse param ([831eae0](https://github.com/Fyzz-Chat/fyzz-chat/commit/831eae034b8f5cb8d3f7a07ae431ce7503a017e3))
* add back help menu ([5a01bc9](https://github.com/Fyzz-Chat/fyzz-chat/commit/5a01bc92887cfde5619809af11d23e93cb6a3ac3))
* address code review comments ([c15ca71](https://github.com/Fyzz-Chat/fyzz-chat/commit/c15ca710a43a964dc620720371462e0d9c77c60a))
* address code review comments ([13598f5](https://github.com/Fyzz-Chat/fyzz-chat/commit/13598f5044f7d7af2916cb26c334b3425639d6bf))
* **chat-layout:** add missing use client directive ([8259b91](https://github.com/Fyzz-Chat/fyzz-chat/commit/8259b91b4ed3e1f2d3c899dea00208b7eaf2f357))
* **conversation:** adjust fade out width ([bd74321](https://github.com/Fyzz-Chat/fyzz-chat/commit/bd7432159b94b432bdbc7b9a60be1005e95dd1bd))
* **input:** make file upload work again ([164226b](https://github.com/Fyzz-Chat/fyzz-chat/commit/164226bef968d1a6eca34db2f7a582f77889b168))
* **kimi:** use correct model id ([98036cf](https://github.com/Fyzz-Chat/fyzz-chat/commit/98036cf10ec047aa77367819f29d510be5e0d50e))
* logo dark and light theme ([fe2fd50](https://github.com/Fyzz-Chat/fyzz-chat/commit/fe2fd5063a5b1dfecf995ad893072186321351f2))
* **message-item:** use streaming param ([bb41419](https://github.com/Fyzz-Chat/fyzz-chat/commit/bb4141921dbe66523ad3f6fe298e4f87b10d2600))
* **message-list:** send metadata correctly ([ae5c997](https://github.com/Fyzz-Chat/fyzz-chat/commit/ae5c997c6f2c71f0a4d87376ae19fd79760ee047))
* **message:** auto grow edited message input ([e661105](https://github.com/Fyzz-Chat/fyzz-chat/commit/e661105cadf76d4e7f0b1529b960fcd472893223))
* **message:** change back to uuid v4 ([b52492f](https://github.com/Fyzz-Chat/fyzz-chat/commit/b52492fce85068a4c2e5e7a7434e72009efb4a7d))
* **message:** make assistant messages copyable ([ba5fa26](https://github.com/Fyzz-Chat/fyzz-chat/commit/ba5fa26679e7ff78441a7cb89fcd37ac0ae225f1))
* **messages:** send every message for temporary chats ([456a307](https://github.com/Fyzz-Chat/fyzz-chat/commit/456a307894301d774bf08086715c1337eaa78321))
* **model-selector:** do not render on server ([fe92fcd](https://github.com/Fyzz-Chat/fyzz-chat/commit/fe92fcdbc4adcd3bb509401546ee7f9e60841df0))
* **prompt-input:** enable closing attach menu on click ([ca502a8](https://github.com/Fyzz-Chat/fyzz-chat/commit/ca502a8e7b5a54c6f73c04db9e134e7e7f3f0931))
* **prompt-input:** limit available extensions ([9149689](https://github.com/Fyzz-Chat/fyzz-chat/commit/914968980209a4a235bca77f6ca6db374ffc1dff))
* reset model to default on new page ([c81eec5](https://github.com/Fyzz-Chat/fyzz-chat/commit/c81eec56cc56eb020839ffbc8c44319811fce564))
* **sidebar:** update sidebar with new item instantly ([d0e6d36](https://github.com/Fyzz-Chat/fyzz-chat/commit/d0e6d36c06fa5e4633d6ea7d6dfb3530b0484ae0))


### Features

* add back claude.md as link to agents.md ([635a40b](https://github.com/Fyzz-Chat/fyzz-chat/commit/635a40bb075e3a43135dda40c19e0a07c1891a45))
* add back mcp configs as links to .agent mcp config ([64bbeb4](https://github.com/Fyzz-Chat/fyzz-chat/commit/64bbeb46764b8288988d9db9ca18a3cbff1d94e0))
* add empty loading tsx to new endpoints ([2c14ad9](https://github.com/Fyzz-Chat/fyzz-chat/commit/2c14ad9d23204d27e48e2adfd9272d79d98cf091))
* add github icon button ([3801c97](https://github.com/Fyzz-Chat/fyzz-chat/commit/3801c97f28d2cefffae8066a885c00aa370b99e8))
* add inline citations ([7271a80](https://github.com/Fyzz-Chat/fyzz-chat/commit/7271a809ec024ace8c61ca778349ff3105b5b30e))
* add option to block sending input ([776a3a6](https://github.com/Fyzz-Chat/fyzz-chat/commit/776a3a68f14cdce50c7d43c5cbf0e89bf3bb411b))
* add react scan ([e123b99](https://github.com/Fyzz-Chat/fyzz-chat/commit/e123b99282d16befae0e1c6e2f24c1569e608742))
* add sidebar to new endpoint ([6038eeb](https://github.com/Fyzz-Chat/fyzz-chat/commit/6038eeb725a9e3d9a9c419feb3ed2dad2066afda))
* change color schema ([6a3fa11](https://github.com/Fyzz-Chat/fyzz-chat/commit/6a3fa11873cde56dd12a367cac6807e32ceae0e4))
* change logo ([6189865](https://github.com/Fyzz-Chat/fyzz-chat/commit/618986542fa1404042b14acfbdf8da13db7aeb5e))
* **citation:** add utm tags ([a5eaffd](https://github.com/Fyzz-Chat/fyzz-chat/commit/a5eaffdd1a99819ef357786b16852827879db85d))
* enable file uploads on mock input ([014f385](https://github.com/Fyzz-Chat/fyzz-chat/commit/014f38586197ce9aeddc88e936f272cc55e542f2))
* **input:** limit file size to 20MB ([eb5bfde](https://github.com/Fyzz-Chat/fyzz-chat/commit/eb5bfde6ce6f1bf5d08bebfa3b16e99b93175ef4))
* introduce Kimi K2.5 ([a48d72b](https://github.com/Fyzz-Chat/fyzz-chat/commit/a48d72b88440eaeb650dbd740c033cdbee26f41e))
* make new input field navigable with keyboard ([8bcfa92](https://github.com/Fyzz-Chat/fyzz-chat/commit/8bcfa92a84bc95652afd53fb9ce88ca8307afa9b))
* **message:** add MessageCopyAction component for copying messages ([bc8ec3a](https://github.com/Fyzz-Chat/fyzz-chat/commit/bc8ec3acbaf58ffa9d793b524b503182f23c177d))
* **messages:** show model name ([0b069c0](https://github.com/Fyzz-Chat/fyzz-chat/commit/0b069c052a26df68d7a3e9f52ba3153be2911987))
* **mock:** add file upload support ([8400ef0](https://github.com/Fyzz-Chat/fyzz-chat/commit/8400ef0cf67fbaedf8ba77d0e4c836b3737fd78d))
* **mock:** add message editing ([e003481](https://github.com/Fyzz-Chat/fyzz-chat/commit/e003481a1db41f0612c3bc316bf95db1cc4b0f7b))
* **mock:** add message regeneration ([9c868bf](https://github.com/Fyzz-Chat/fyzz-chat/commit/9c868bfcde2be4f385aca0bf1d5232d1b68f3da2))
* **mock:** add root endpoint and navigation to new chat pages ([48f8812](https://github.com/Fyzz-Chat/fyzz-chat/commit/48f8812ca1b182b3cabe50546b8b483dfffd9f26))
* **providers:** add glm 5 ([3026177](https://github.com/Fyzz-Chat/fyzz-chat/commit/3026177fdec938a4c1dde6e7575b8893652e128f))
* **providers:** add sonnet and opus 4.6 ([8f8e712](https://github.com/Fyzz-Chat/fyzz-chat/commit/8f8e71286da365c6ec946993679a63ee76f130ab))
* **providers:** update deepseek models ([4e67f63](https://github.com/Fyzz-Chat/fyzz-chat/commit/4e67f63f0a6b5a0a8379189f0ec15beeb7f19255))

# [0.17.0](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.16.2...v0.17.0) (2026-01-27)


### Bug Fixes

* **aws:** introduce base64 cloudfront private key env var ([62be0b3](https://github.com/Fyzz-Chat/fyzz-chat/commit/62be0b39e29c6162443886720106667171a68150))
* **cloudformation:** remove special characters from db password, double length to 64 ([341c209](https://github.com/Fyzz-Chat/fyzz-chat/commit/341c209f2c8057573639cacf10e1dd690f91d6d2))
* **fireworks:** separate gpt-oss-20b from openai ([f781cf1](https://github.com/Fyzz-Chat/fyzz-chat/commit/f781cf16bbdb918e89abc8843ec49e778b0ce632))
* **s3:** add option to set different cloudfront domain and s3 bucket name ([c8169d1](https://github.com/Fyzz-Chat/fyzz-chat/commit/c8169d17a9711513471e4f51a04630b73b7a6b72))


### Features

* **cloudformation:** add fargate version ([1e74b0f](https://github.com/Fyzz-Chat/fyzz-chat/commit/1e74b0f0d273c34dc147fc024564cfaf505e1a6a))

## [0.16.2](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.16.1...v0.16.2) (2026-01-27)


### Bug Fixes

* **message:** fix code block streaming ([8e315bd](https://github.com/Fyzz-Chat/fyzz-chat/commit/8e315bdecd934039e3d9b42f97582d2eb0895e45))
* **streamdown:** fix code block coloring ([c9f2e20](https://github.com/Fyzz-Chat/fyzz-chat/commit/c9f2e20603fa63134c9bbb8093fe86a7eb46261e))

## [0.16.1](https://github.com/Fyzz-Chat/fyzz-chat/compare/v0.16.0...v0.16.1) (2026-01-25)


### Bug Fixes

* **conversations:** select metadata instead of content on retrieval ([7f09ccf](https://github.com/Fyzz-Chat/fyzz-chat/commit/7f09ccf8233816d457a6939b64ae90a7cafb3b9a))

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
