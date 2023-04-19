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

- Pyth recommends to run your own Pyth-price service
  - Follow the instructions on [Wormhole Spy](https://github.com/pyth-network/pyth-crosschain/tree/main/price_service/server), specifically
    - Copy `.env.example` into `.env` and edit as described in the Readme
    - To run the price service, you need to build the image as described in the last [paragraph of the Readme here](https://github.com/pyth-network/pyth-crosschain/tree/main/price_service/server).
      Ensure your own price server is enabled in docker-compose:
      ```
      # image: public.ecr.aws/pyth-network/xc-server:v3.0.0
      image: pyth_price_server
      ```

### Test

`yarn test`

### NPM Package Deployment

`yarn build`
`yarn build:doc`
`yarn login`
`yarn publish`
