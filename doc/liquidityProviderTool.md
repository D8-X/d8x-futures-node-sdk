<a name="LiquidityProviderTool"></a>

## LiquidityProviderTool ⇐ <code>WriteAccessHandler</code>
<p>Functions to provide liquidity. This class requires a private key and executes
smart-contract interactions that require gas-payments.</p>

**Kind**: global class  
**Extends**: <code>WriteAccessHandler</code>  

* [LiquidityProviderTool](#LiquidityProviderTool) ⇐ <code>WriteAccessHandler</code>
    * [new LiquidityProviderTool(config, privateKey)](#new_LiquidityProviderTool_new)
    * [.getParticipationValue(poolSymbolName)](#LiquidityProviderTool+getParticipationValue) ⇒
    * [.addLiquidity(poolSymbolName, amountCC)](#LiquidityProviderTool+addLiquidity) ⇒
    * [.initiateLiquidityWithdrawal(poolSymbolName, amountPoolShares)](#LiquidityProviderTool+initiateLiquidityWithdrawal) ⇒
    * [.executeLiquidityWithdrawal(poolSymbolName)](#LiquidityProviderTool+executeLiquidityWithdrawal) ⇒

<a name="new_LiquidityProviderTool_new"></a>

### new LiquidityProviderTool(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey |  | <p>private key of account that trades</p> |

**Example**  
```js
import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidityProviderTool);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // LiquidityProviderTool (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let lqudtProviderTool = new LiquidityProviderTool(config, pk);
  // Create a proxy instance to access the blockchain
  await lqudtProviderTool.createProxyInstance();
}
main();
```
<a name="LiquidityProviderTool+getParticipationValue"></a>

### liquidityProviderTool.getParticipationValue(poolSymbolName) ⇒
<p>Value of the pool share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Returns**: <p>Value in poolSymbol-currency (e.g. MATIC, USDC), balance of pool share tokens, and share token symbol.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC).</p> |

**Example**  
```js
import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidityProviderTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtProviderTool = new LiquidityProviderTool(config, pk);
  await lqudtProviderTool.createProxyInstance();
  // get value of pool share token
  let shareToken = await lqudtProviderTool.getParticipationValue("MATIC");
  console.log(shareToken);
}
main();
```
<a name="LiquidityProviderTool+addLiquidity"></a>

### liquidityProviderTool.addLiquidity(poolSymbolName, amountCC) ⇒
<p>Add liquidity to the PnL participant fund. The address gets pool shares in return.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Returns**: <p>Transaction object</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Name of pool symbol (e.g. MATIC)</p> |
| amountCC | <code>number</code> | <p>Amount in pool-collateral currency</p> |

**Example**  
```js
import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidityProviderTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtProviderTool = new LiquidityProviderTool(config, pk);
  await lqudtProviderTool.createProxyInstance();
  // add liquidity
  await lqudtProviderTool.setAllowance("MATIC");
  let respAddLiquidity = await lqudtProviderTool.addLiquidity("MATIC", 0.1);
  console.log(respAddLiquidity);
}
main();
```
<a name="LiquidityProviderTool+initiateLiquidityWithdrawal"></a>

### liquidityProviderTool.initiateLiquidityWithdrawal(poolSymbolName, amountPoolShares) ⇒
<p>Initiates a liquidity withdrawal from the pool
It triggers a time-delayed unlocking of the given number of pool shares.
The amount of pool shares to be unlocked is fixed by this call, but not their value in pool currency.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Name of pool symbol (e.g. MATIC).</p> |
| amountPoolShares | <code>string</code> | <p>Amount in pool-shares, removes everything if &gt; available amount.</p> |

**Example**  
```js
import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidityProviderTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtProviderTool = new LiquidityProviderTool(config, pk);
  await lqudtProviderTool.createProxyInstance();
  // initiate withdrawal
  let respRemoveLiquidity = await lqudtProviderTool.initiateLiquidityWithdrawal("MATIC", 0.1);
  console.log(respRemoveLiquidity);
}
main();
```
<a name="LiquidityProviderTool+executeLiquidityWithdrawal"></a>

### liquidityProviderTool.executeLiquidityWithdrawal(poolSymbolName) ⇒
<p>Withdraws as much liquidity as there is available after a call to initiateLiquidityWithdrawal.
The address loses pool shares in return.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Returns**: <p>Transaction object.</p>  

| Param |
| --- |
| poolSymbolName | 

**Example**  
```js
import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidityProviderTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtProviderTool = new LiquidityProviderTool(config, pk);
  await lqudtProviderTool.createProxyInstance();
  // remove liquidity
  let respRemoveLiquidity = await lqudtProviderTool.executeLiquidityWithdrawal("MATIC", 0.1);
  console.log(respRemoveLiquidity);
}
main();
```
