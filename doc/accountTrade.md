<a name="AccountTrade"></a>

## AccountTrade ⇐ <code>WriteAccessHandler</code>
<p>Functions to create, submit and cancel orders on the exchange.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p>

**Kind**: global class  
**Extends**: <code>WriteAccessHandler</code>  

* [AccountTrade](#AccountTrade) ⇐ <code>WriteAccessHandler</code>
    * [new AccountTrade(config, privateKey)](#new_AccountTrade_new)
    * [.cancelOrder(symbol, orderId)](#AccountTrade+cancelOrder) ⇒ <code>ContractTransaction</code>
    * [.order(order)](#AccountTrade+order) ⇒ <code>ContractTransaction</code>
    * [.queryExchangeFee(poolSymbolName, [brokerAddr])](#AccountTrade+queryExchangeFee) ⇒
    * [.getCurrentTraderVolume(poolSymbolName)](#AccountTrade+getCurrentTraderVolume) ⇒ <code>number</code>
    * [.getOrderIds(symbol)](#AccountTrade+getOrderIds) ⇒ <code>Array.&lt;string&gt;</code>

<a name="new_AccountTrade_new"></a>

### new AccountTrade(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of account that trades.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // AccountTrade (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  // Create a proxy instance to access the blockchain
  await accTrade.createProxyInstance();
}
main();
```
<a name="AccountTrade+cancelOrder"></a>

### accountTrade.cancelOrder(symbol, orderId) ⇒ <code>ContractTransaction</code>
<p>Cancels an existing order on the exchange.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>ContractTransaction</code> - <p>Contract Transaction (containing events).</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be cancelled.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
async function main() {
   console.log(AccountTrade);
   // setup (authentication required, PK is an environment variable with a private key)
   const config = PerpetualDataHandler.readSDKConfig("testnet");
   const pk: string = <string>process.env.PK;
   let accTrade = new AccountTrade(config, pk);
   await accTrade.createProxyInstance();
   // cancel order
   let cancelTransaction = accTrade.cancelOrder("MATIC-USD-MATIC",
       "0x4639061a58dcf34f4c9c703f49f1cb00d6a4fba490d62c0eb4a4fb06e1c76c19")
   console.log(cancelTransaction);
 }
 main();
```
<a name="AccountTrade+order"></a>

### accountTrade.order(order) ⇒ <code>ContractTransaction</code>
<p>Submits an order to the exchange.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>ContractTransaction</code> - <p>Contract Transaction (containing events).</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order structure. As a minimum the structure needs to specify symbol, side, type and quantity.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
async function main() {
   console.log(AccountTrade);
   // setup (authentication required, PK is an environment variable with a private key)
   const config = PerpetualDataHandler.readSDKConfig("testnet");
   const pk: string = <string>process.env.PK;
   let accTrade = new AccountTrade(config, pk);
   await accTrade.createProxyInstance();
   // set allowance
   await accTrade.setAllowance("MATIC");
   // set an order
   let order: Order = {
       symbol: "MATIC-USD-MATIC",
       side: "BUY",
       type: "MARKET",
       quantity: 100,
       leverage: 2,
       timestamp: Date.now()/1000,
   };
   let orderTransaction = await accTrade.order(order);
   console.log(orderTransaction);
 }
 main();
```
**Example**  
```js
import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
async function main() {
   console.log(AccountTrade);
   // setup (authentication required, PK is an environment variable with a private key)
   const config = PerpetualDataHandler.readSDKConfig("testnet");
   const pk: string = <string>process.env.PK;
   let accTrade = new AccountTrade(config, pk);
   await accTrade.createProxyInstance();
   // set allowance
   await accTrade.setAllowance("MATIC");
   // set an order
  let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "LIMIT",
      limitPrice: 1,
      quantity: 5,
      leverage: 2,
      timestamp: Date.now() / 1000,
      deadline: Date.now() / 1000 + 8*60*60, // order expires 8 hours from now
   };
   let orderTransaction = await accTrade.order(order);
   console.log(orderTransaction);
 }
 main();
```
<a name="AccountTrade+queryExchangeFee"></a>

### accountTrade.queryExchangeFee(poolSymbolName, [brokerAddr]) ⇒
<p>Fee charged by the exchange for trading any perpetual on a given pool.
It accounts for the current trader's fee tier (based on the trader's D8X balance and trading volume).
If trading with a broker, it also accounts for the selected broker's fee tier.
Note that this result only includes exchange fees, additional broker fees are not included.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <p>Exchange fee, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| [brokerAddr] | <code>string</code> | <p>Optional address of a broker this trader may use to trade under.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // query exchange fee
  let fees = await accTrade.queryExchangeFee("MATIC");
  console.log(fees);
}
main();
```
<a name="AccountTrade+getCurrentTraderVolume"></a>

### accountTrade.getCurrentTraderVolume(poolSymbolName) ⇒ <code>number</code>
<p>Exponentially weighted EMA of the total trading volume of all trades performed by this trader.
The weights are chosen so that in average this coincides with the 30 day volume.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>number</code> - <p>Current trading volume for this trader, in USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // query 30 day volume
  let vol = await accTrade.getCurrentTraderVolume("MATIC");
  console.log(vol);
}
main();
```
<a name="AccountTrade+getOrderIds"></a>

### accountTrade.getOrderIds(symbol) ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of Ids for all the orders currently open by this trader.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // get order IDs
  let orderIds = await accTrade.getOrderIds("MATIC-USD-MATIC");
  console.log(orderIds);
}
main();
```
