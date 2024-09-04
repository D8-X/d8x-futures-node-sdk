### Installations

- install node via nvm, [see here](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)
- install typescript
  `npm install -g typescript`
  `npm install -g ts-node`
- install yarn [see here](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
- clone this repo
- open directory of repo and type `yarn` to install packages

### Remote Configs

Some configuration files are fetched from github.com/D8-X/sync-hub/:

- `priceFeedConfig.json`, see priceFeeds.ts
- `symbolList.json`, see perpetualDataHandler.ts

### Test

`yarn test`

### NPM Package Deployment

`yarn build`
`yarn build:doc`
`yarn login`
`yarn publish`
