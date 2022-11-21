<a name="MarketData"></a>

## MarketData
<p>This class requires no private key and is blockchain read-only.
No gas required for the queries here.</p>

**Kind**: global class  

* [MarketData](#MarketData)
    * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ <code>ExchangeInfo</code>
    * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
    * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>MarginAccount</code>

<a name="MarketData+exchangeInfo"></a>

### marketData.exchangeInfo() ⇒ <code>ExchangeInfo</code>
<p>Information about the products traded in the exchange.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>ExchangeInfo</code> - <p>Array of static data for all the pools and perpetuals in the system.</p>  
<a name="MarketData+openOrders"></a>

### marketData.openOrders(traderAddr, symbol) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
<p>All open orders for a trader-address and a symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code> - <p>Array of open orders and corresponding order-ids.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the open orders.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

<a name="MarketData+positionRisk"></a>

### marketData.positionRisk(traderAddr, symbol) ⇒ <code>MarginAccount</code>
<p>Information about the position open by a given trader in a given perpetual contract.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

