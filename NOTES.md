This updated format is meant to grow with the user. 

We are currently limited to vuetify version 3, because of the vue-toolkit

this requires the version of `vue-toolkit` currently on (or up to date with ) the `main` branch. 

To use it, assuming the toolkit is in a directory next to yours, link it like this.
use `yarn link --relative ../vue-toolkit` to work with a local repo and `yarn unlink ../vue-toolkit` to undo it

This is also the reason for the `include: ['@cosmicds/vue-toolkit',]` in `vite.config.mts`

we need the pinia resolution to get the toolkit and the web-engine on the same pinia version. 
the toolkit ask for ~2.1.7, and the engine is on ^2.0.22. Yarn will just install both, which then causes
a type error. This forces yarn to use a common version. 

needed to downgrade font-aweseom vue for local development. yarn `Cannot link into a workspac with a dependency conflict`

updated packages to most recent minor/patch versions with `npx npm-check-updates -u --target minor`

we use local imports, so that we have type-checking in our components

i added prettier so they vs-code can format according to rules and formats we have generally used. 
i do not include a `format` script because it doesn't perfectly align with our lint rules. linting
is the main way we do formatting. but people with prettier setup in their editors will get formatting 
that is inline with how we usually code (mainly split attributes, 2-space tabs)

CI has be unpdated to v22 of node, as that is a LTS  release. 
going to version 25 requires installing corepack manually. 

.editorconfig is an older standard like prettier that helps other editor format and strucutre files

moved HighwayGothic to index.html so it doesn't need to be imported multiple times
compress to woff2 format with `fonttools ttLib.woff2 compress -o HighwayGothicNarrow.woff2 HighwayGothicNarrow.ttf`
and placed into public because things in `assets` need to be manually imported if in any js context. they don't need to be
imported if in a pure html string (still need to be at `./assets/mything.ext`) because we have `transformAssetUrls`.
css strings (`url(...)` in less/css) are a separate thing, vite resolves those on its own, transformAssetUrls is
only for the vue template
