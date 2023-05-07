<a name="MarketData"></a>

## MarketData ⇐ <code>PerpetualDataHandler</code>
<p>Functions to access market data (e.g., information on open orders, information on products that can be traded).
This class requires no private key and is blockchain read-only.
No gas required for the queries here.</p>

**Kind**: global class  
**Extends**: <code>PerpetualDataHandler</code>  

* [MarketData](#MarketData) ⇐ <code>PerpetualDataHandler</code>
    * [new MarketData(config)](#new_MarketData_new)
    * _instance_
        * [.createProxyInstance(provider)](#MarketData+createProxyInstance)
        * [.getProxyAddress()](#MarketData+getProxyAddress) ⇒
        * [.smartContractOrderToOrder(smOrder)](#MarketData+smartContractOrderToOrder) ⇒
        * [.getReadOnlyProxyInstance()](#MarketData+getReadOnlyProxyInstance) ⇒
        * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ <code>ExchangeInfo</code>
        * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
        * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>MarginAccount</code>
        * [.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo)](#MarketData+positionRiskOnTrade) ⇒ <code>MarginAccount</code>
        * [.positionRiskOnCollateralAction(traderAddr, deltaCollateral, currentPositionRisk)](#MarketData+positionRiskOnCollateralAction) ⇒ <code>MarginAccount</code>
        * [.getWalletBalance(address, symbol)](#MarketData+getWalletBalance) ⇒
        * [.getPoolShareTokenBalance(address, symbolOrId)](#MarketData+getPoolShareTokenBalance)
        * [._getPoolShareTokenBalanceFromId(address, poolId)](#MarketData+_getPoolShareTokenBalanceFromId) ⇒
        * [.getShareTokenPrice(symbolOrId)](#MarketData+getShareTokenPrice) ⇒
        * [.getParticipationValue(address, symbolOrId)](#MarketData+getParticipationValue) ⇒
        * [.maxOrderSizeForTrader(side, positionRisk)](#MarketData+maxOrderSizeForTrader) ⇒
        * [.maxSignedPosition(side, symbol)](#MarketData+maxSignedPosition) ⇒
        * [.getOraclePrice(base, quote)](#MarketData+getOraclePrice) ⇒ <code>number</code>
        * [.getMarkPrice(symbol)](#MarketData+getMarkPrice) ⇒
        * [.getPerpetualPrice(symbol, quantity)](#MarketData+getPerpetualPrice) ⇒
        * [.getPerpetualState(symbol, indexPrices)](#MarketData+getPerpetualState) ⇒
        * [.getPerpetualStaticInfo(symbol)](#MarketData+getPerpetualStaticInfo) ⇒
        * [.getPerpetualMidPrice(symbol)](#MarketData+getPerpetualMidPrice) ⇒ <code>number</code>
        * [.getAvailableMargin(traderAddr, symbol, indexPrices)](#MarketData+getAvailableMargin) ⇒
        * [.getTraderLoyalityScore(traderAddr, brokerAddr)](#MarketData+getTraderLoyalityScore) ⇒
        * [.isMarketClosed(symbol)](#MarketData+isMarketClosed) ⇒
    * _static_
        * [._getAllIndexPrices(_symbolToPerpStaticInfo, _priceFeedGetter)](#MarketData._getAllIndexPrices) ⇒
        * [._queryMidPrices(_proxyContract, _nestedPerpetualIDs, _symbolToPerpStaticInfo, _perpetualIdToSymbol, _idxPriceMap)](#MarketData._queryMidPrices) ⇒

<a name="new_MarketData_new"></a>

### new MarketData(config)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // MarketData (read only, no authentication needed)
  let mktData = new MarketData(config);
  // Create a proxy instance to access the blockchain
  await mktData.createProxyInstance();
}
main();
```
<a name="MarketData+createProxyInstance"></a>

### marketData.createProxyInstance(provider)
<p>Initialize the marketData-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="MarketData+getProxyAddress"></a>

### marketData.getProxyAddress() ⇒
<p>Get the proxy address</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Address of the perpetual proxy contract</p>  
<a name="MarketData+smartContractOrderToOrder"></a>

### marketData.smartContractOrderToOrder(smOrder) ⇒
<p>Convert the smart contract output of an order into a convenient format of type &quot;Order&quot;</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>more convenient format of order, type &quot;Order&quot;</p>  

| Param | Description |
| --- | --- |
| smOrder | <p>SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event</p> |

<a name="MarketData+getReadOnlyProxyInstance"></a>

### marketData.getReadOnlyProxyInstance() ⇒
<p>Get contract instance. Useful for event listening.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>read-only proxy instance</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get contract instance
  let proxy = await mktData.getReadOnlyProxyInstance();
  console.log(proxy);
}
main();
```
<a name="MarketData+exchangeInfo"></a>

### marketData.exchangeInfo() ⇒ <code>ExchangeInfo</code>
<p>Information about the products traded in the exchange.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>ExchangeInfo</code> - <p>Array of static data for all the pools and perpetuals in the system.</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get exchange info
  let info = await mktData.exchangeInfo();
  console.log(info);
}
main();
```
<a name="MarketData+openOrders"></a>

### marketData.openOrders(traderAddr, symbol) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
<p>All open orders for a trader-address and a symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code> - <p>Array of open orders and corresponding order-ids.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the open orders.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get all open orders for a trader/symbol
  let opOrder = await mktData.openOrders("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "ETH-USD-MATIC");
  console.log(opOrder);
}
main();
```
<a name="MarketData+positionRisk"></a>

### marketData.positionRisk(traderAddr, symbol) ⇒ <code>MarginAccount</code>
<p>Information about the position open by a given trader in a given perpetual contract.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk of trader.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC. Can also be the perpetual id as string</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get position risk info
  let posRisk = await mktData.positionRisk("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "ETH-USD-MATIC");
  console.log(posRisk);
}
main();
```
<a name="MarketData+positionRiskOnTrade"></a>

### marketData.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if a given order is executed.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after trade</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| order | <p>Order to be submitted</p> |
| account | <p>Position risk before trade</p> |
| indexPriceInfo | <p>Index prices and market status (open/closed)</p> |

<a name="MarketData+positionRiskOnCollateralAction"></a>

### marketData.positionRiskOnCollateralAction(traderAddr, deltaCollateral, currentPositionRisk) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if given amount of collateral is added/removed from the account.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| deltaCollateral | <p>Amount of collateral to add or remove (signed)</p> |
| currentPositionRisk | <p>Position risk before</p> |

<a name="MarketData+getWalletBalance"></a>

### marketData.getWalletBalance(address, symbol) ⇒
<p>Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Balance</p>  

| Param | Description |
| --- | --- |
| address | <p>Address to check</p> |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

<a name="MarketData+getPoolShareTokenBalance"></a>

### marketData.getPoolShareTokenBalance(address, symbolOrId)
<p>Get the address' balance of the pool share token</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Description |
| --- | --- |
| address | <p>address of the liquidity provider</p> |
| symbolOrId | <p>Symbol of the form ETH-USD-MATIC, or MATIC (collateral only), or Pool-Id</p> |

<a name="MarketData+_getPoolShareTokenBalanceFromId"></a>

### marketData.\_getPoolShareTokenBalanceFromId(address, poolId) ⇒
<p>Query the pool share token holdings of address</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>pool share token balance of address</p>  

| Param | Description |
| --- | --- |
| address | <p>address of token holder</p> |
| poolId | <p>pool id</p> |

<a name="MarketData+getShareTokenPrice"></a>

### marketData.getShareTokenPrice(symbolOrId) ⇒
<p>Value of pool token in collateral currency</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>current pool share token price in collateral currency</p>  

| Param | Description |
| --- | --- |
| symbolOrId | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

<a name="MarketData+getParticipationValue"></a>

### marketData.getParticipationValue(address, symbolOrId) ⇒
<p>Value of the pool share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>the value (in collateral tokens) of the pool share</p>  

| Param | Description |
| --- | --- |
| address | <p>address of liquidity provider</p> |
| symbolOrId | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get value of pool share token
  let shareToken = await md.getParticipationValue(myaddress, "MATIC");
  console.log(shareToken);
}
main();
```
<a name="MarketData+maxOrderSizeForTrader"></a>

### marketData.maxOrderSizeForTrader(side, positionRisk) ⇒
<p>Gets the maximal order size to open positions (increase size),
considering the existing position, state of the perpetual
Ignores users wallet balance.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Maximal trade size, not signed</p>  

| Param | Description |
| --- | --- |
| side | <p>BUY or SELL</p> |
| positionRisk | <p>Current position risk (as seen in positionRisk)</p> |

<a name="MarketData+maxSignedPosition"></a>

### marketData.maxSignedPosition(side, symbol) ⇒
**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>signed maximal position size in base currency</p>  

| Param | Description |
| --- | --- |
| side | <p>BUY_SIDE or SELL_SIDE</p> |
| symbol | <p>of the form ETH-USD-MATIC.</p> |

<a name="MarketData+getOraclePrice"></a>

### marketData.getOraclePrice(base, quote) ⇒ <code>number</code>
<p>Uses the Oracle(s) in the exchange to get the latest price of a given index in a given currency, if a route exists.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>Price of index in given currency.</p>  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>string</code> | <p>Index name, e.g. ETH.</p> |
| quote | <code>string</code> | <p>Quote currency, e.g. USD.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let price = await mktData.getOraclePrice("ETH", "USD");
  console.log(price);
}
main();
```
<a name="MarketData+getMarkPrice"></a>

### marketData.getMarkPrice(symbol) ⇒
<p>Get the current mark price</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>mark price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get mark price
  let price = await mktData.getMarkPrice("ETH-USD-MATIC");
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualPrice"></a>

### marketData.getPerpetualPrice(symbol, quantity) ⇒
<p>get the current price for a given quantity</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>price (number)</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |
| quantity | <p>quantity to be traded, negative if short</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual price
  let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualState"></a>

### marketData.getPerpetualState(symbol, indexPrices) ⇒
<p>Query recent perpetual state from blockchain</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>PerpetualState reference</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |
| indexPrices | <p>S2 and S3 prices/isMarketOpen if not provided fetch via REST API</p> |

<a name="MarketData+getPerpetualStaticInfo"></a>

### marketData.getPerpetualStaticInfo(symbol) ⇒
<p>Query perpetual static info.
This information is queried once at createProxyInstance-time and remains static after that.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>PerpetualStaticInfo copy.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="MarketData+getPerpetualMidPrice"></a>

### marketData.getPerpetualMidPrice(symbol) ⇒ <code>number</code>
<p>get the current mid-price for a perpetual</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual mid price
  let midPrice = await mktData.getPerpetualMidPrice("ETH-USD-MATIC");
  console.log(midPrice);
}
main();
```
<a name="MarketData+getAvailableMargin"></a>

### marketData.getAvailableMargin(traderAddr, symbol, indexPrices) ⇒
<p>Query the available margin conditional on the given (or current) index prices
Result is in collateral currency</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>available margin in collateral currency</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>address of the trader</p> |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |
| indexPrices | <p>optional index prices, will otherwise fetch from REST API</p> |

<a name="MarketData+getTraderLoyalityScore"></a>

### marketData.getTraderLoyalityScore(traderAddr, brokerAddr) ⇒
<p>Calculate a type of exchange loyality score based on trader volume</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>a loyality score (4 worst, 1 best)</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>address of the trader</p> |
| brokerAddr | <p>address of the trader's broker or undefined</p> |

<a name="MarketData+isMarketClosed"></a>

### marketData.isMarketClosed(symbol) ⇒
<p>Get market open/closed status</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>True if the market is closed</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Perpetual symbol of the form ETH-USD-MATIC</p> |

<a name="MarketData._getAllIndexPrices"></a>

### MarketData.\_getAllIndexPrices(_symbolToPerpStaticInfo, _priceFeedGetter) ⇒
<p>Get all off-chain prices</p>

**Kind**: static method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>mapping of symbol-pair (e.g. BTC-USD) to price/isMarketClosed</p>  

| Param | Description |
| --- | --- |
| _symbolToPerpStaticInfo | <p>mapping: PerpetualStaticInfo for each perpetual</p> |
| _priceFeedGetter | <p>priceFeed class from which we can get offchain price data</p> |

<a name="MarketData._queryMidPrices"></a>

### MarketData.\_queryMidPrices(_proxyContract, _nestedPerpetualIDs, _symbolToPerpStaticInfo, _perpetualIdToSymbol, _idxPriceMap) ⇒
<p>Collect all mid-prices</p>

**Kind**: static method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>perpetual symbol to mid-prices mapping</p>  

| Param | Description |
| --- | --- |
| _proxyContract | <p>contract instance</p> |
| _nestedPerpetualIDs | <p>contains all perpetual ids for each pool</p> |
| _symbolToPerpStaticInfo | <p>maps symbol to static info</p> |
| _perpetualIdToSymbol | <p>maps perpetual id to symbol of the form BTC-USD-MATIC</p> |
| _idxPriceMap | <p>symbol to price/market closed</p> |

