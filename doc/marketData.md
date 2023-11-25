<a name="MarketData"></a>

## MarketData ⇐ <code>PerpetualDataHandler</code>
<p>Functions to access market data (e.g., information on open orders, information on products that can be traded).
This class requires no private key and is blockchain read-only.
No gas required for the queries here.</p>

**Kind**: global class  
**Extends**: <code>PerpetualDataHandler</code>  

* [MarketData](#MarketData) ⇐ <code>PerpetualDataHandler</code>
    * [new MarketData(config)](#new_MarketData_new)
    * [.createProxyInstance(providerOrMarketData)](#MarketData+createProxyInstance)
    * [.getProxyAddress()](#MarketData+getProxyAddress) ⇒ <code>string</code>
    * [.getTriangulations()](#MarketData+getTriangulations) ⇒
    * [.smartContractOrderToOrder(smOrder)](#MarketData+smartContractOrderToOrder) ⇒ <code>Order</code>
    * [.getReadOnlyProxyInstance()](#MarketData+getReadOnlyProxyInstance) ⇒ <code>Contract</code>
    * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ <code>ExchangeInfo</code>
    * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒
    * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>Array.&lt;MarginAccount&gt;</code>
    * [.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo)](#MarketData+positionRiskOnTrade) ⇒
    * [.positionRiskOnCollateralAction(deltaCollateral, account)](#MarketData+positionRiskOnCollateralAction) ⇒ <code>MarginAccount</code>
    * [.getWalletBalance(address, symbol)](#MarketData+getWalletBalance) ⇒
    * [.getPoolShareTokenBalance(address, symbolOrId)](#MarketData+getPoolShareTokenBalance) ⇒ <code>number</code>
    * [.getShareTokenPrice(symbolOrId)](#MarketData+getShareTokenPrice) ⇒ <code>number</code>
    * [.getParticipationValue(address, symbolOrId)](#MarketData+getParticipationValue) ⇒
    * [.maxOrderSizeForTrader(traderAddr, symbol)](#MarketData+maxOrderSizeForTrader) ⇒
    * [.maxSignedPosition(side, symbol)](#MarketData+maxSignedPosition) ⇒ <code>number</code>
    * [.getOraclePrice(base, quote)](#MarketData+getOraclePrice) ⇒ <code>number</code>
    * [.getOrderStatus(symbol, orderId, overrides)](#MarketData+getOrderStatus) ⇒
    * [.getOrdersStatus(symbol, orderId)](#MarketData+getOrdersStatus) ⇒
    * [.getMarkPrice(symbol)](#MarketData+getMarkPrice) ⇒ <code>number</code>
    * [.getPerpetualPrice(symbol, quantity)](#MarketData+getPerpetualPrice) ⇒ <code>number</code>
    * [.getPerpetualState(symbol)](#MarketData+getPerpetualState) ⇒ <code>PerpetualState</code>
    * [.getPoolState(poolSymbol)](#MarketData+getPoolState) ⇒ <code>PoolState</code>
    * [.getPerpetualStaticInfo(symbol)](#MarketData+getPerpetualStaticInfo) ⇒ <code>PerpetualStaticInfo</code>
    * [.getPerpetualMidPrice(symbol)](#MarketData+getPerpetualMidPrice) ⇒ <code>number</code>
    * [.getAvailableMargin(traderAddr, symbol, indexPrices)](#MarketData+getAvailableMargin) ⇒
    * [.getTraderLoyalityScore(traderAddr)](#MarketData+getTraderLoyalityScore) ⇒ <code>number</code>
    * [.isMarketClosed(symbol)](#MarketData+isMarketClosed) ⇒ <code>boolean</code>
    * [.getPriceInUSD(symbol)](#MarketData+getPriceInUSD) ⇒ <code>Map.&lt;string, number&gt;</code>

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
  // load configuration for Polygon zkEVM (testnet)
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  // MarketData (read only, no authentication needed)
  let mktData = new MarketData(config);
  // Create a proxy instance to access the blockchain
  await mktData.createProxyInstance();
}
main();
```
<a name="MarketData+createProxyInstance"></a>

### marketData.createProxyInstance(providerOrMarketData)
<p>Initialize the marketData-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Description |
| --- | --- |
| providerOrMarketData | <p>optional provider or existing market data instance</p> |

<a name="MarketData+getProxyAddress"></a>

### marketData.getProxyAddress() ⇒ <code>string</code>
<p>Get the proxy address</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>string</code> - <p>Address of the perpetual proxy contract</p>  
<a name="MarketData+getTriangulations"></a>

### marketData.getTriangulations() ⇒
<p>Get the pre-computed triangulations</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Triangulations</p>  
<a name="MarketData+smartContractOrderToOrder"></a>

### marketData.smartContractOrderToOrder(smOrder) ⇒ <code>Order</code>
<p>Convert the smart contract output of an order into a convenient format of type &quot;Order&quot;</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Order</code> - <p>more convenient format of order, type &quot;Order&quot;</p>  

| Param | Type | Description |
| --- | --- | --- |
| smOrder | <code>SmartContractOrder</code> | <p>SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event</p> |

<a name="MarketData+getReadOnlyProxyInstance"></a>

### marketData.getReadOnlyProxyInstance() ⇒ <code>Contract</code>
<p>Get contract instance. Useful for event listening.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Contract</code> - <p>read-only proxy instance</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get exchange info
  let info = await mktData.exchangeInfo();
  console.log(info);
}
main();
```
<a name="MarketData+openOrders"></a>

### marketData.openOrders(traderAddr, symbol) ⇒
<p>All open orders for a trader-address and a symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>For each perpetual an array of open orders and corresponding order-ids.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the open orders.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC or a pool symbol, or undefined. If a poolSymbol is provided, the response includes orders in all perpetuals of the given pool. If no symbol is provided, the response includes orders from all perpetuals in all pools.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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

### marketData.positionRisk(traderAddr, symbol) ⇒ <code>Array.&lt;MarginAccount&gt;</code>
<p>Information about the position open by a given trader in a given perpetual contract, or
for all perpetuals in a pool</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Array.&lt;MarginAccount&gt;</code> - <p>Array of position risks of trader.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC, or pool symbol (&quot;MATIC&quot;) to get all positions in a given pool, or no symbol to get all positions in all pools.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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

### marketData.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo) ⇒
<p>Estimates what the position risk will be if a given order is executed.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Position risk after trade, including order cost and maximal trade sizes for position</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| order | <p>Order to be submitted</p> |
| account | <p>Position risk before trade. Defaults to current position if not given.</p> |
| indexPriceInfo | <p>Index prices and market status (open/closed). Defaults to current market status if not given.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  const mktData = new MarketData(config);
  await mktData.createProxyInstance();
  const order: Order = {
       symbol: "MATIC-USD-MATIC",
       side: "BUY",
       type: "MARKET",
       quantity: 100,
       leverage: 2,
       executionTimestamp: Date.now()/1000,
   };
  // Get position risk conditional on this order being executed
  const posRisk = await mktData.positionRiskOnTrade("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", order);
  console.log(posRisk);
}
main();
```
<a name="MarketData+positionRiskOnCollateralAction"></a>

### marketData.positionRiskOnCollateralAction(deltaCollateral, account) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if given amount of collateral is added/removed from the account.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after collateral has been added/removed</p>  

| Param | Type | Description |
| --- | --- | --- |
| deltaCollateral | <code>number</code> | <p>Amount of collateral to add or remove (signed)</p> |
| account | <code>MarginAccount</code> | <p>Position risk before collateral is added or removed</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  const mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get position risk conditional on removing 3.14 MATIC
  const traderAddr = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";
  const curPos = await mktData.positionRisk("traderAddr", "BTC-USD-MATIC");
  const posRisk = await mktData.positionRiskOnCollateralAction(-3.14, curPos);
  console.log(posRisk);
}
main();
```
<a name="MarketData+getWalletBalance"></a>

### marketData.getWalletBalance(address, symbol) ⇒
<p>Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Perpetual's collateral token balance of the given address.</p>  

| Param | Description |
| --- | --- |
| address | <p>Address to check</p> |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get MATIC balance of address
  let marginTokenBalance = await md.getWalletBalance(myaddress, "BTC-USD-MATIC");
  console.log(marginTokenBalance);
}
main();
```
<a name="MarketData+getPoolShareTokenBalance"></a>

### marketData.getPoolShareTokenBalance(address, symbolOrId) ⇒ <code>number</code>
<p>Get the address' balance of the pool share token</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>Pool share token balance of the given address (e.g. dMATIC balance)</p>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | <p>address of the liquidity provider</p> |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>Symbol of the form ETH-USD-MATIC, or MATIC (collateral only), or Pool-Id</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get dMATIC balance of address
  let shareTokenBalance = await md.getPoolShareTokenBalance(myaddress, "MATIC");
  console.log(shareTokenBalance);
}
main();
```
<a name="MarketData+getShareTokenPrice"></a>

### marketData.getShareTokenPrice(symbolOrId) ⇒ <code>number</code>
<p>Value of pool token in collateral currency</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>current pool share token price in collateral currency</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get price of 1 dMATIC in MATIC
  let shareTokenPrice = await md.getShareTokenPrice(myaddress, "MATIC");
  console.log(shareTokenPrice);
}
main();
```
<a name="MarketData+getParticipationValue"></a>

### marketData.getParticipationValue(address, symbolOrId) ⇒
<p>Value of the pool share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>the value (in collateral tokens) of the pool share, #share tokens, shareTokenAddress</p>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | <p>address of liquidity provider</p> |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get value of pool share token
  let shareToken = await md.getParticipationValue(myaddress, "MATIC");
  console.log(shareToken);
}
main();
```
<a name="MarketData+maxOrderSizeForTrader"></a>

### marketData.maxOrderSizeForTrader(traderAddr, symbol) ⇒
<p>Gets the maximal order sizes to open positions (increase size), both long and short,
considering the existing position, state of the perpetual
Accounts for user's wallet balance.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Maximal trade sizes</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of trader</p> |
| symbol | <code>symbol</code> | <p>Symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // max order sizes
  let shareToken = await md.maxOrderSizeForTrader(myaddress, "BTC-USD-MATIC");
  console.log(shareToken); // {buy: 314, sell: 415}
}
main();
```
<a name="MarketData+maxSignedPosition"></a>

### marketData.maxSignedPosition(side, symbol) ⇒ <code>number</code>
<p>Perpetual-wide maximal signed position size in perpetual.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>signed maximal position size in base currency</p>  

| Param | Type | Description |
| --- | --- | --- |
| side |  | <p>BUY_SIDE or SELL_SIDE</p> |
| symbol | <code>string</code> | <p>of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let maxLongPos = await mktData.maxSignedPosition(BUY_SIDE, "BTC-USD-MATIC");
  console.log(maxLongPos);
}
main();
```
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
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let price = await mktData.getOraclePrice("ETH", "USD");
  console.log(price);
}
main();
```
<a name="MarketData+getOrderStatus"></a>

### marketData.getOrderStatus(symbol, orderId, overrides) ⇒
<p>Get the status of an order given a symbol and order Id</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Order status (cancelled = 0, executed = 1, open = 2,  unkown = 3)</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |
| orderId | <p>Order Id</p> |
| overrides |  |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get order stauts
  let status = await mktData.getOrderStatus("ETH-USD-MATIC", "0xmyOrderId");
  console.log(status);
}
main();
```
<a name="MarketData+getOrdersStatus"></a>

### marketData.getOrdersStatus(symbol, orderId) ⇒
<p>Get the status of an array of orders given a symbol and their Ids</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Array of order status</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |
| orderId | <p>Array of order Ids</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get order stauts
  let status = await mktData.getOrdersStatus("ETH-USD-MATIC", ["0xmyOrderId1", "0xmyOrderId2"]);
  console.log(status);
}
main();
```
<a name="MarketData+getMarkPrice"></a>

### marketData.getMarkPrice(symbol) ⇒ <code>number</code>
<p>Get the current mark price</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>mark price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get mark price
  let price = await mktData.getMarkPrice("ETH-USD-MATIC");
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualPrice"></a>

### marketData.getPerpetualPrice(symbol, quantity) ⇒ <code>number</code>
<p>get the current price for a given quantity</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>price</p>  

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
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual price
  let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualState"></a>

### marketData.getPerpetualState(symbol) ⇒ <code>PerpetualState</code>
<p>Query recent perpetual state from blockchain</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>PerpetualState</code> - <p>PerpetualState copy</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="MarketData+getPoolState"></a>

### marketData.getPoolState(poolSymbol) ⇒ <code>PoolState</code>
<p>Query recent pool state from blockchain, not including perpetual states</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>PoolState</code> - <p>PoolState copy</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbol | <code>string</code> | <p>symbol of the form USDC</p> |

<a name="MarketData+getPerpetualStaticInfo"></a>

### marketData.getPerpetualStaticInfo(symbol) ⇒ <code>PerpetualStaticInfo</code>
<p>Query perpetual static info.
This information is queried once at createProxyInstance-time, and remains static after that.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>PerpetualStaticInfo</code> - <p>Perpetual static info copy.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol</p> |

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
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>address of the trader</p> |
| symbol | <code>string</code> | <p>perpetual symbol of the form BTC-USD-MATIC</p> |
| indexPrices |  | <p>optional index prices, will otherwise fetch from REST API</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get available margin
  let mgn = await mktData.getAvailableMargin("0xmyAddress", "ETH-USD-MATIC");
  console.log(mgn);
}
main();
```
<a name="MarketData+getTraderLoyalityScore"></a>

### marketData.getTraderLoyalityScore(traderAddr) ⇒ <code>number</code>
<p>Calculate a type of exchange loyality score based on trader volume</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>a loyality score (4 worst, 1 best)</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>address of the trader</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get scpre
  let s = await mktData.getTraderLoyalityScore("0xmyAddress");
  console.log(s);
}
main();
```
<a name="MarketData+isMarketClosed"></a>

### marketData.isMarketClosed(symbol) ⇒ <code>boolean</code>
<p>Get market open/closed status</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>boolean</code> - <p>True if the market is closed</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // is market closed?
  let s = await mktData.isMarketClosed("ETH-USD-MATIC");
  console.log(s);
}
main();
```
<a name="MarketData+getPriceInUSD"></a>

### marketData.getPriceInUSD(symbol) ⇒ <code>Map.&lt;string, number&gt;</code>
<p>Get the latest on-chain price of a perpetual base index in USD.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Map.&lt;string, number&gt;</code> - <p>Price of the base index in USD, e.g. for ETH-USDC-MATIC, it returns the value of ETH-USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USDC-MATIC. If a pool symbol is used, it returns an array of all the USD prices of the indices in the pool. If no argument is provided, it returns all prices of all the indices in the pools of the exchange.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // is market closed?
  let px = await mktData.getPriceInUSD("ETH-USDC-USDC");
  console.log(px); // {'ETH-USD' -> 1800}
}
main();
```
