<a name="OrderReferrerTool"></a>

## OrderReferrerTool ⇐ <code>WriteAccessHandler</code>
<p>Functions to execute existing conditional orders from the limit order book. This class
requires a private key and executes smart-contract interactions that require
gas-payments.</p>

**Kind**: global class  
**Extends**: <code>WriteAccessHandler</code>  

* [OrderReferrerTool](#OrderReferrerTool) ⇐ <code>WriteAccessHandler</code>
    * [new OrderReferrerTool(config, signer)](#new_OrderReferrerTool_new)
    * [.executeOrder(symbol, orderId, [referrerAddr], [nonce], [submission])](#OrderReferrerTool+executeOrder) ⇒
    * [.getAllOpenOrders(symbol)](#OrderReferrerTool+getAllOpenOrders) ⇒
    * [.numberOfOpenOrders(symbol)](#OrderReferrerTool+numberOfOpenOrders) ⇒ <code>number</code>
    * [.getOrderById(symbol, digest)](#OrderReferrerTool+getOrderById) ⇒
    * [.pollLimitOrders(symbol, numElements, [startAfter])](#OrderReferrerTool+pollLimitOrders) ⇒
    * [.isTradeable(order, indexPrices)](#OrderReferrerTool+isTradeable) ⇒
    * [.isTradeableBatch(orders, indexPrice)](#OrderReferrerTool+isTradeableBatch) ⇒
    * [._isTradeable(order, tradePrice, markPrice, blockTimestamp, symbolToPerpInfoMap)](#OrderReferrerTool+_isTradeable) ⇒
    * [.smartContractOrderToOrder(scOrder)](#OrderReferrerTool+smartContractOrderToOrder) ⇒

<a name="new_OrderReferrerTool_new"></a>

### new OrderReferrerTool(config, signer)
<p>Constructor.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |
| signer | <code>string</code> \| <code>Signer</code> | <p>Private key or ethers Signer of the account</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // OrderReferrerTool (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  // Create a proxy instance to access the blockchain
  await orderTool.createProxyInstance();
}
main();
```
<a name="OrderReferrerTool+executeOrder"></a>

### orderReferrerTool.executeOrder(symbol, orderId, [referrerAddr], [nonce], [submission]) ⇒
<p>Executes an order by symbol and ID. This action interacts with the blockchain and incurs gas costs.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be executed.</p> |
| [referrerAddr] | <code>string</code> | <p>optional address of the wallet to be credited for executing the order, if different from the one submitting this transaction.</p> |
| [nonce] | <code>number</code> | <p>optional nonce</p> |
| [submission] | <code>PriceFeedSubmission</code> | <p>optional signed prices obtained via PriceFeeds::fetchLatestFeedPriceInfoForPerpetual</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler, Order } from "@d8x/perpetuals-sdk";
async function main() {
  console.log(OrderReferrerTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  const symbol = "ETH-USD-MATIC";
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get some open orders
  const maxOrdersToGet = 5;
  let [orders, ids]: [Order[], string[]] = await orderTool.pollLimitOrders(symbol, maxOrdersToGet);
  console.log(`Got ${ids.length} orders`);
  for (let k = 0; k < ids.length; k++) {
    // check whether order meets conditions
    let doExecute = await orderTool.isTradeable(orders[k]);
    if (doExecute) {
      // execute
      let tx = await orderTool.executeOrder(symbol, ids[k]);
      console.log(`Sent order id ${ids[k]} for execution, tx hash = ${tx.hash}`);
    }
  }
}
main();
```
<a name="OrderReferrerTool+getAllOpenOrders"></a>

### orderReferrerTool.getAllOpenOrders(symbol) ⇒
<p>All the orders in the order book for a given symbol that are currently open.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Array with all open orders and their IDs.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let openOrders = await orderTool.getAllOpenOrders("ETH-USD-MATIC");
  console.log(openOrders);
}
main();
```
<a name="OrderReferrerTool+numberOfOpenOrders"></a>

### orderReferrerTool.numberOfOpenOrders(symbol) ⇒ <code>number</code>
<p>Total number of limit orders for this symbol, excluding those that have been cancelled/removed.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <code>number</code> - <p>Number of open orders.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let numberOfOrders = await orderTool.numberOfOpenOrders("ETH-USD-MATIC");
  console.log(numberOfOrders);
}
main();
```
<a name="OrderReferrerTool+getOrderById"></a>

### orderReferrerTool.getOrderById(symbol, digest) ⇒
<p>Get order from the digest (=id)</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>order or undefined</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of order book, e.g. ETH-USD-MATIC</p> |
| digest | <p>digest of the order (=order ID)</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get order by ID
  let myorder = await orderTool.getOrderById("MATIC-USD-MATIC",
      "0x0091a1d878491479afd09448966c1403e9d8753122e25260d3b2b9688d946eae");
  console.log(myorder);
}
main();
```
<a name="OrderReferrerTool+pollLimitOrders"></a>

### orderReferrerTool.pollLimitOrders(symbol, numElements, [startAfter]) ⇒
<p>Get a list of active conditional orders in the order book.
This a read-only action and does not incur in gas costs.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Array of orders and corresponding order IDs</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| numElements | <code>number</code> | <p>Maximum number of orders to poll.</p> |
| [startAfter] | <code>string</code> | <p>Optional order ID from where to start polling. Defaults to the first order.</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let activeOrders = await orderTool.pollLimitOrders("ETH-USD-MATIC", 2);
  console.log(activeOrders);
}
main();
```
<a name="OrderReferrerTool+isTradeable"></a>

### orderReferrerTool.isTradeable(order, indexPrices) ⇒
<p>Check if a conditional order can be executed</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>true if order can be executed for the current state of the perpetuals</p>  

| Param | Description |
| --- | --- |
| order | <p>order structure</p> |
| indexPrices | <p>pair of index prices S2 and S3. S3 set to zero if not required. If undefined the function will fetch the latest prices from the REST API</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // check if tradeable
  let openOrders = await orderTool.getAllOpenOrders("MATIC-USD-MATIC");
  let check = await orderTool.isTradeable(openOrders[0][0]);
  console.log(check);
}
main();
```
<a name="OrderReferrerTool+isTradeableBatch"></a>

### orderReferrerTool.isTradeableBatch(orders, indexPrice) ⇒
<p>Check for a batch of orders on the same perpetual whether they can be traded</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>array of tradeable boolean</p>  

| Param | Description |
| --- | --- |
| orders | <p>orders belonging to 1 perpetual</p> |
| indexPrice | <p>S2,S3-index prices for the given perpetual. Will fetch prices from REST API if not defined.</p> |

<a name="OrderReferrerTool+_isTradeable"></a>

### orderReferrerTool.\_isTradeable(order, tradePrice, markPrice, blockTimestamp, symbolToPerpInfoMap) ⇒
<p>Can the order be executed?</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>true if trading conditions met, false otherwise</p>  

| Param | Description |
| --- | --- |
| order | <p>order struct</p> |
| tradePrice | <p>&quot;preview&quot; price of this order</p> |
| markPrice | <p>current mark price</p> |
| blockTimestamp | <p>last observed block timestamp (hence already in past)</p> |
| symbolToPerpInfoMap | <p>metadata</p> |

<a name="OrderReferrerTool+smartContractOrderToOrder"></a>

### orderReferrerTool.smartContractOrderToOrder(scOrder) ⇒
<p>Wrapper of static method to use after mappings have been loaded into memory.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>A user-friendly order struct.</p>  

| Param | Description |
| --- | --- |
| scOrder | <p>Perpetual order as received in the proxy events.</p> |

