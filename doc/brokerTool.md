<a name="BrokerTool"></a>

## BrokerTool ⇐ <code>WriteAccessHandler</code>
<p>Functions for brokers to determine fees, deposit lots, and sign-up traders.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p>

**Kind**: global class  
**Extends**: <code>WriteAccessHandler</code>  

* [BrokerTool](#BrokerTool) ⇐ <code>WriteAccessHandler</code>
    * [new BrokerTool(config, privateKey, signer)](#new_BrokerTool_new)
    * [.getBrokerInducedFee(poolSymbolName)](#BrokerTool+getBrokerInducedFee) ⇒ <code>number</code>
    * [.getFeeForBrokerDesignation(poolSymbolName, [lots])](#BrokerTool+getFeeForBrokerDesignation) ⇒ <code>number</code>
    * [.getFeeForBrokerVolume(poolSymbolName)](#BrokerTool+getFeeForBrokerVolume) ⇒ <code>number</code>
    * [.getFeeForBrokerStake([brokerAddr])](#BrokerTool+getFeeForBrokerStake) ⇒ <code>number</code>
    * [.determineExchangeFee(order, traderAddr)](#BrokerTool+determineExchangeFee) ⇒ <code>number</code>
    * [.getCurrentBrokerVolume(poolSymbolName)](#BrokerTool+getCurrentBrokerVolume) ⇒ <code>number</code>
    * [.getLotSize(poolSymbolName)](#BrokerTool+getLotSize) ⇒ <code>number</code>
    * [.getBrokerDesignation(poolSymbolName)](#BrokerTool+getBrokerDesignation) ⇒ <code>number</code>
    * [.brokerDepositToDefaultFund(poolSymbolName, lots)](#BrokerTool+brokerDepositToDefaultFund) ⇒ <code>ContractTransaction</code>
    * [.signOrder(order, traderAddr)](#BrokerTool+signOrder) ⇒ <code>Order</code>
    * [.transferOwnership(poolSymbolName, newAddress)](#BrokerTool+transferOwnership) ⇒ <code>ContractTransaction</code>

<a name="new_BrokerTool_new"></a>

### new BrokerTool(config, privateKey, signer)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of a broker.</p> |
| signer | <code>Signer</code> | <p>Signer (ignored if a private key is provided)</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // BrokerTool (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  // Create a proxy instance to access the blockchain
  await brokTool.createProxyInstance();
}
main();
```
<a name="BrokerTool+getBrokerInducedFee"></a>

### brokerTool.getBrokerInducedFee(poolSymbolName) ⇒ <code>number</code>
<p>Determine the exchange fee based on lots, traded volume, and D8X balance of this broker.
This is the final exchange fee that this broker can offer to traders that trade through him.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Exchange fee for this broker, in decimals (i.e. 0.1% is 0.001)</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get broker induced fee
  let brokFee = await brokTool.getBrokerInducedFee("MATIC");
  console.log(brokFee);
}
main();
```
<a name="BrokerTool+getFeeForBrokerDesignation"></a>

### brokerTool.getFeeForBrokerDesignation(poolSymbolName, [lots]) ⇒ <code>number</code>
<p>Determine the exchange fee based on lots purchased by this broker.
The final exchange fee that this broker can offer to traders that trade through him is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on this broker's designation, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| [lots] | <code>number</code> | <p>Optional, designation to use if different from this broker's.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get broker fee induced by lots
  let brokFeeLots = await brokTool.getFeeForBrokerDesignation("MATIC");
  console.log(brokFeeLots);
}
main();
```
<a name="BrokerTool+getFeeForBrokerVolume"></a>

### brokerTool.getFeeForBrokerVolume(poolSymbolName) ⇒ <code>number</code>
<p>Determine the exchange fee based on volume traded under this broker.
The final exchange fee that this broker can offer to traders that trade through him is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on a broker's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get broker fee induced by volume
  let brokFeeVol = await brokTool.getFeeForBrokerVolume("MATIC");
  console.log(brokFeeVol);
}
main();
```
<a name="BrokerTool+getFeeForBrokerStake"></a>

### brokerTool.getFeeForBrokerStake([brokerAddr]) ⇒ <code>number</code>
<p>Determine the exchange fee based on the current D8X balance in a broker's wallet.
The final exchange fee that this broker can offer to traders that trade through him is equal to
maximum(brokerTool.getFeeForBrokerDesignation(symbol, lots),  brokerTool.getFeeForBrokerVolume(symbol), brokerTool.getFeeForBrokerStake)</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on a broker's D8X balance, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| [brokerAddr] | <code>string</code> | <p>Address of the broker in question, if different from the one calling this function.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get broker fee induced by staked d8x
  let brokFeeStake = await brokTool.getFeeForBrokerStake("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
  console.log(brokFeeStake);
}
main();
```
<a name="BrokerTool+determineExchangeFee"></a>

### brokerTool.determineExchangeFee(order, traderAddr) ⇒ <code>number</code>
<p>Determine exchange fee based on an order and a trader.
This is the fee charged by the exchange only, excluding the broker fee,
and it takes into account whether the order given here has been signed by a broker or not.
Use this, for instance, to verify that the fee to be charged for a given order is as expected,
before and after signing it with brokerTool.signOrder.
This fee is equal or lower than the broker induced fee, provided the order is properly signed.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order structure. As a minimum the structure needs to specify symbol, side, type and quantity.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader for whom to determine the fee.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get exchange fee based on an order and trader
  let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 100,
      executionTimestamp: Date.now()/1000
  };
   let exchFee = await brokTool.determineExchangeFee(order,
       "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
  console.log(exchFee);
}
main();
```
<a name="BrokerTool+getCurrentBrokerVolume"></a>

### brokerTool.getCurrentBrokerVolume(poolSymbolName) ⇒ <code>number</code>
<p>Exponentially weighted EMA of the total trading volume of all trades performed under this broker.
The weights are chosen so that in average this coincides with the 30 day volume.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Current trading volume for this broker, in USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get 30 day volume for broker
  let brokVolume = await brokTool.getCurrentBrokerVolume("MATIC");
  console.log(brokVolume);
}
main();
```
<a name="BrokerTool+getLotSize"></a>

### brokerTool.getLotSize(poolSymbolName) ⇒ <code>number</code>
<p>Total amount of collateral currency a broker has to deposit into the default fund to purchase one lot.
This is equivalent to the price of a lot expressed in a given pool's currency (e.g. MATIC, USDC, etc).</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Broker lot size in a given pool's currency, e.g. in MATIC for poolSymbolName MATIC.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get lot price
  let brokLotSize = await brokTool.getLotSize("MATIC");
  console.log(brokLotSize);
}
main();
```
<a name="BrokerTool+getBrokerDesignation"></a>

### brokerTool.getBrokerDesignation(poolSymbolName) ⇒ <code>number</code>
<p>Provides information on how many lots a broker purchased for a given pool.
This is relevant to determine the broker's fee tier.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Number of lots purchased by this broker.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get broker designation
  let brokDesignation = await brokTool.getBrokerDesignation("MATIC");
  console.log(brokDesignation);
}
main();
```
<a name="BrokerTool+brokerDepositToDefaultFund"></a>

### brokerTool.brokerDepositToDefaultFund(poolSymbolName, lots) ⇒ <code>ContractTransaction</code>
<p>Deposit lots to the default fund of a given pool.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>ContractTransaction</code> - <p>ContractTransaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| lots | <code>number</code> | <p>Number of lots to deposit into this pool.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // deposit to default fund
  await brokTool.setAllowance("MATIC");
  let respDeposit = await brokTool.brokerDepositToDefaultFund("MATIC",1);
  console.log(respDeposit);
}
main();
```
<a name="BrokerTool+signOrder"></a>

### brokerTool.signOrder(order, traderAddr) ⇒ <code>Order</code>
<p>Adds this broker's signature to an order. An order signed by a broker is considered
to be routed through this broker and benefits from the broker's fee conditions.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>Order</code> - <p>An order signed by this broker, which can be submitted directly with AccountTrade.order.</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order to sign. It must contain valid broker fee, broker address, and order deadline.</p> |
| traderAddr | <code>string</code> | <p>Address of trader submitting the order.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // sign order
  let order = {symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 1,
      executionTimestamp: Date.now()/1000
   };
   let signedOrder = await brokTool.signOrder(order, "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
       0.0001, 1669723339);
  console.log(signedOrder);
  // execute order
  let orderTransaction = await accTrade.order(signedOrder);
  console.log(orderTransaction.hash);
}
main();
```
<a name="BrokerTool+transferOwnership"></a>

### brokerTool.transferOwnership(poolSymbolName, newAddress) ⇒ <code>ContractTransaction</code>
<p>Transfer ownership of a broker's status to a new wallet. This function transfers the values related to
(i) trading volume and (ii) deposited lots to newAddress. The broker needs in addition to manually transfer
his D8X holdings to newAddress. Until this transfer is completed, the broker will not have his current designation reflected at newAddress.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>ContractTransaction</code> - <p>ethers transaction object</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| newAddress | <code>string</code> | <p>The address this broker wants to use from now on.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // transfer ownership
  let respTransferOwnership = await brokTool.transferOwnership("MATIC", "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
  console.log(respTransferOwnership);
}
main();
```
