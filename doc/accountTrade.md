<a name="AccountTrade"></a>

## AccountTrade
<p>Account and Trade.
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p>

**Kind**: global class  

* [AccountTrade](#AccountTrade)
    * [new AccountTrade(config, privateKey)](#new_AccountTrade_new)
    * [.cancelOrder(symbol, orderId)](#AccountTrade+cancelOrder)
    * [.order(order)](#AccountTrade+order) ⇒ <code>string</code>

<a name="new_AccountTrade_new"></a>

### new AccountTrade(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of account that trades.</p> |

<a name="AccountTrade+cancelOrder"></a>

### accountTrade.cancelOrder(symbol, orderId)
<p>Cancels an existing order on the exchange.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be cancelled.</p> |

<a name="AccountTrade+order"></a>

### accountTrade.order(order) ⇒ <code>string</code>
<p>Submits an order to the exchange.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>string</code> - <p>Transaction hash.</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order struct.</p> |

