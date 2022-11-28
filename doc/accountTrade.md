<a name="AccountTrade"></a>

## AccountTrade
<p>Functions to create, submit and cancel orders on the exchange.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p>

**Kind**: global class  

* [AccountTrade](#AccountTrade)
    * [new AccountTrade(config, privateKey)](#new_AccountTrade_new)
    * [.cancelOrder(symbol, orderId)](#AccountTrade+cancelOrder)
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
const config = PerpetualDataHandler.readSDKConfig("testnet")
```
<a name="AccountTrade+cancelOrder"></a>

### accountTrade.cancelOrder(symbol, orderId)
<p>Cancels an existing order on the exchange.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be cancelled.</p> |

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
let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 1,
}
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

<a name="AccountTrade+getCurrentTraderVolume"></a>

### accountTrade.getCurrentTraderVolume(poolSymbolName) ⇒ <code>number</code>
<p>Exponentially weighted EMA of the total trading volume of all trades performed by this trader.
The weights are chosen so that in average this coincides with the 30 day volume.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>number</code> - <p>Current trading volume for this trader, in USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="AccountTrade+getOrderIds"></a>

### accountTrade.getOrderIds(symbol) ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of Ids for all the orders currently open by this trader.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

