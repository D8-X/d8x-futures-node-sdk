<a name="BrokerTool"></a>

## BrokerTool
<p>Functions for brokers to determine fees, deposit lots, and sign-up traders.</p>

**Kind**: global class  

* [BrokerTool](#BrokerTool)
    * [new BrokerTool(config, privateKey)](#new_BrokerTool_new)
    * [.getLotSize(symbol)](#BrokerTool+getLotSize) ⇒ <code>number</code>
    * [.getBrokerDesignation(symbol)](#BrokerTool+getBrokerDesignation) ⇒ <code>number</code>
    * [.getFeeForBrokerDesignation(symbol, lots)](#BrokerTool+getFeeForBrokerDesignation) ⇒ <code>number</code>
    * [.brokerDepositToDefaultFund(symbol, lots)](#BrokerTool+brokerDepositToDefaultFund) ⇒
    * [.getFeeForBrokerVolume(symbol)](#BrokerTool+getFeeForBrokerVolume) ⇒ <code>number</code>
    * [.determineExchangeFee(order, traderAddr)](#BrokerTool+determineExchangeFee) ⇒ <code>number</code>
    * [.queryExchangeFee(symbol, traderAddr)](#BrokerTool+queryExchangeFee) ⇒ <code>number</code>
    * [.signOrder(order, traderAddr, feeDecimals, deadline)](#BrokerTool+signOrder) ⇒ <code>Order</code>
    * [.createSignatureForTrader(traderAddr, symbol, brokerFee, deadline)](#BrokerTool+createSignatureForTrader) ⇒

<a name="new_BrokerTool_new"></a>

### new BrokerTool(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object.</p> |
| privateKey | <code>string</code> | <p>Private key of a broker.</p> |

<a name="BrokerTool+getLotSize"></a>

### brokerTool.getLotSize(symbol) ⇒ <code>number</code>
<p>Broker lot size for a given pool.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Broker lot size in collateral currency, e.g. in MATIC for symbol ETH-USD-MATIC or MATIC.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>String</code> | <p>Symbol of the form ETH-USD-MATIC or just MATIC.</p> |

<a name="BrokerTool+getBrokerDesignation"></a>

### brokerTool.getBrokerDesignation(symbol) ⇒ <code>number</code>
<p>Designation of this broker.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Number of lots purchased by this broker.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC or just MATIC.</p> |

<a name="BrokerTool+getFeeForBrokerDesignation"></a>

### brokerTool.getFeeForBrokerDesignation(symbol, lots) ⇒ <code>number</code>
<p>Determine the exchange fee based on lots purchased by this broker.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on this broker's designation, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC or just MATIC</p> |
| lots | <code>number</code> | <p>Optional, designation to use if different from this broker's.</p> |

<a name="BrokerTool+brokerDepositToDefaultFund"></a>

### brokerTool.brokerDepositToDefaultFund(symbol, lots) ⇒
<p>Deposit to a given pool.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC or just MATIC.</p> |
| lots | <code>number</code> | <p>Number of lots to deposit into this pool.</p> |

<a name="BrokerTool+getFeeForBrokerVolume"></a>

### brokerTool.getFeeForBrokerVolume(symbol) ⇒ <code>number</code>
<p>Determine the exchange fee based on volume traded under this broker.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on this broker's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC or just MATIC.</p> |

<a name="BrokerTool+determineExchangeFee"></a>

### brokerTool.determineExchangeFee(order, traderAddr) ⇒ <code>number</code>
<p>Determine exchange fee based on an order.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order for which to determine the exchange fee, not necessarily signed by this broker.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader for whom to determine the fee.</p> |

<a name="BrokerTool+queryExchangeFee"></a>

### brokerTool.queryExchangeFee(symbol, traderAddr) ⇒ <code>number</code>
<p>Fee that a trader would get if trading with this broker.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Exchange fee, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATC or just MATIC.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader.</p> |

<a name="BrokerTool+signOrder"></a>

### brokerTool.signOrder(order, traderAddr, feeDecimals, deadline) ⇒ <code>Order</code>
<p>Adds this broker's signature to an order so it can be submitted by an approved trader.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>Order</code> - <p>An order signed by this broker, which can be submitted directly with AccountTrade.order.</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order to sign.</p> |
| traderAddr | <code>string</code> | <p>Address of trader submitting the order.</p> |
| feeDecimals | <code>number</code> | <p>Fee that this broker is approving for the trader.</p> |
| deadline | <code>number</code> | <p>Deadline for the order to be executed.</p> |

<a name="BrokerTool+createSignatureForTrader"></a>

### brokerTool.createSignatureForTrader(traderAddr, symbol, brokerFee, deadline) ⇒
<p>Creates a signature that a trader can use to place orders with this broker.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Broker signature approving this trader's fee, symbol, and deadline.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader signing up with this broker.</p> |
| symbol | <code>string</code> | <p>Perpetual that this trader will be trading, of the form ETH-USD-MATIC.</p> |
| brokerFee | <code>number</code> | <p>Broker fee for this trader, in decimals (i.e. 0.1% is 0.001).</p> |
| deadline | <code>number</code> | <p>Deadline for the order to be executed.</p> |

