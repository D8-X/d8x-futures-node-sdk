# @d8x/perpetuals-sdk

Node TypeScript SDK for D8X Perpetual Futures

### Installations

- install node via nvm, [see here](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)
- install typescript
  `npm install -g typescript`
  `npm install -g ts-node`
- install yarn [see here](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
- clone this repo
- open directory of repo and type `yarn` to install packages

#### Optional
- To execute orders and liquidate traders, we recommend to run your own Pyth-price service
    - Efficient execution requires the endpoint `api/latest_vaas_ts` which is available
    in D8X's [fork](https://github.com/D8-X/pyth-crosschain-d8x.git) of [Pyth's repo](https://github.com/pyth-network/pyth-crosschain.git)
    - Follow the instructions on [Wormhole Spy](https://github.com/pyth-network/pyth-crosschain/tree/main/price_service/server), specifically
      - Copy `.env.example` into `.env` and edit as described
      - For the D8X fork (with `api/latest_vaas_ts`) to run, you need to build the image as described in the last paragraph
### Test

`yarn test`

### NPM Package Deployment

`yarn build`
`yarn build:doc`
`yarn login`
`yarn publish`
