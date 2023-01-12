<a name="MarketData"></a>

## MarketData ⇐ <code>PerpetualDataHandler</code>
<p>Functions to access market data (e.g., information on open orders, information on products that can be traded).
This class requires no private key and is blockchain read-only.
No gas required for the queries here.</p>

**Kind**: global class  
**Extends**: <code>PerpetualDataHandler</code>  

* [MarketData](#MarketData) ⇐ <code>PerpetualDataHandler</code>
    * [new MarketData(config)](#new_MarketData_new)
    * [.createProxyInstance(provider)](#MarketData+createProxyInstance)
    * [.getReadOnlyProxyInstance()](#MarketData+getReadOnlyProxyInstance) ⇒
    * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ <code>ExchangeInfo</code>
    * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
    * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>MarginAccount</code>
    * [.getOraclePrice(base, quote)](#MarketData+getOraclePrice) ⇒ <code>number</code>
    * [.getMarkPrice(symbol)](#MarketData+getMarkPrice) ⇒
    * [.getPerpetualPrice(symbol, quantity)](#MarketData+getPerpetualPrice) ⇒

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
<p>Information about the positions open by a given trader in a given perpetual contract.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
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
  // Get position risk info
  let posRisk = await mktData.positionRisk("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "ETH-USD-MATIC");
  console.log(posRisk);
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
