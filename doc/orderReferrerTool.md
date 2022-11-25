<a name="OrderReferrerTool"></a>

## OrderReferrerTool
<p>Methods to execute existing orders from the limit order book.</p>

**Kind**: global class  

* [OrderReferrerTool](#OrderReferrerTool)
    * [new OrderReferrerTool(config, privateKey)](#new_OrderReferrerTool_new)
    * [.executeOrder(symbol, orderId, [referrerAddr])](#OrderReferrerTool+executeOrder) ⇒
    * [.getAllOpenOrders(symbol)](#OrderReferrerTool+getAllOpenOrders) ⇒
    * [.numberOfOpenOrders(symbol)](#OrderReferrerTool+numberOfOpenOrders) ⇒ <code>number</code>
    * [.pollLimitOrders(symbol, numElements, [startAfter])](#OrderReferrerTool+pollLimitOrders) ⇒

<a name="new_OrderReferrerTool_new"></a>

### new OrderReferrerTool(config, privateKey)
<p>Constructor.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object.</p> |
| privateKey | <code>string</code> | <p>Private key of the wallet that executes the conditional orders.</p> |

<a name="OrderReferrerTool+executeOrder"></a>

### orderReferrerTool.executeOrder(symbol, orderId, [referrerAddr]) ⇒
<p>Executes an order by symbol and ID. This action interacts with the blockchain and incurs in gas costs.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be executed.</p> |
| [referrerAddr] | <code>string</code> | <p>Address of the wallet to be credited for executing the order, if different from the one submitting this transaction.</p> |

<a name="OrderReferrerTool+getAllOpenOrders"></a>

### orderReferrerTool.getAllOpenOrders(symbol) ⇒
<p>All the orders in the order book for a given symbol that are currently open.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Array with all open orders and their IDs.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

<a name="OrderReferrerTool+numberOfOpenOrders"></a>

### orderReferrerTool.numberOfOpenOrders(symbol) ⇒ <code>number</code>
<p>Total number of limit orders for this symbol, excluding those that have been cancelled/removed.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <code>number</code> - <p>Number of open orders.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

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

