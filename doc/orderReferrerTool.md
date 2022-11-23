<a name="OrderReferrerTool"></a>

## OrderReferrerTool
<p>Methods to execute existing orders from the limit order book.</p>

**Kind**: global class  

* [OrderReferrerTool](#OrderReferrerTool)
    * [new OrderReferrerTool(config, privateKey)](#new_OrderReferrerTool_new)
    * [.executeOrder(symbol, orderId, [referrerAddr])](#OrderReferrerTool+executeOrder) ⇒

<a name="new_OrderReferrerTool_new"></a>

### new OrderReferrerTool(config, privateKey)
<p>Constructor.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object.</p> |
| privateKey | <code>string</code> | <p>Private key of the wallet that executes the conditional orders.</p> |

<a name="OrderReferrerTool+executeOrder"></a>

### orderReferrerTool.executeOrder(symbol, orderId, [referrerAddr]) ⇒
<p>Executes an order by symbol and ID.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be executed.</p> |
| [referrerAddr] | <code>string</code> | <p>Address of the wallet to be credited for executing the order, if different from the one submitting this transaction.</p> |

