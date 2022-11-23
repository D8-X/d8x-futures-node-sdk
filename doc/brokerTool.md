<a name="BrokerTool"></a>

## BrokerTool
<p>Functions for brokers to determine fees, deposit lots, and sign-up traders.</p>

**Kind**: global class  

* [BrokerTool](#BrokerTool)
    * [new BrokerTool(config, privateKey)](#new_BrokerTool_new)
    * [.getLotSize(poolSymbolName)](#BrokerTool+getLotSize) ⇒
    * [.getBrokerDesignation(poolSymbolName)](#BrokerTool+getBrokerDesignation) ⇒
    * [.brokerDepositToDefaultFund(poolSymbolName, lots)](#BrokerTool+brokerDepositToDefaultFund) ⇒
    * [.getFeeForBrokerDesignation(poolSymbolName, lots)](#BrokerTool+getFeeForBrokerDesignation) ⇒
    * [.getFeeForBrokerVolume(poolSymbolName)](#BrokerTool+getFeeForBrokerVolume) ⇒
    * [.getFeeForBrokerStake([brokerAddr])](#BrokerTool+getFeeForBrokerStake) ⇒
    * [.determineExchangeFee(order, traderAddr)](#BrokerTool+determineExchangeFee) ⇒
    * [.signOrder(order, traderAddr, feeDecimals, deadline)](#BrokerTool+signOrder) ⇒
    * [.createSignatureForTrader(traderAddr, symbol, brokerFee, deadline)](#BrokerTool+createSignatureForTrader) ⇒

<a name="new_BrokerTool_new"></a>

### new BrokerTool(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object.</p> |
| privateKey | <code>string</code> | <p>Private key of a broker.</p> |

<a name="BrokerTool+getLotSize"></a>

### brokerTool.getLotSize(poolSymbolName) ⇒
<p>Total amount of collateral currency a broker has to deposit into the default fund to purchase one lot.
This is equivalent to the price of a lot expressed in a given pool's currency (e.g. MATIC, USDC, etc).</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Broker lot size in a given pool's currency, e.g. in MATIC for poolSymbolName MATIC.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+getBrokerDesignation"></a>

### brokerTool.getBrokerDesignation(poolSymbolName) ⇒
<p>Provides information on how many lots a broker purchased for a given pool.
This is relevant to determine the broker's fee tier.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Number of lots purchased by this broker.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+brokerDepositToDefaultFund"></a>

### brokerTool.brokerDepositToDefaultFund(poolSymbolName, lots) ⇒
<p>Deposit lots to the default fund of a given pool.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| lots |  | <p>Number of lots to deposit into this pool.</p> |

<a name="BrokerTool+getFeeForBrokerDesignation"></a>

### brokerTool.getFeeForBrokerDesignation(poolSymbolName, lots) ⇒
<p>Determine the exchange fee based on lots purchased by this broker.
The final exchange fee paid by the broker is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Fee based solely on this broker's designation, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| lots | <code>number</code> | <p>Optional, designation to use if different from this broker's.</p> |

<a name="BrokerTool+getFeeForBrokerVolume"></a>

### brokerTool.getFeeForBrokerVolume(poolSymbolName) ⇒
<p>Determine the exchange fee based on volume traded under this broker.
The final exchange fee paid by the broker is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Fee based solely on a broker's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+getFeeForBrokerStake"></a>

### brokerTool.getFeeForBrokerStake([brokerAddr]) ⇒
<p>Determine the exchange fee based on the current D8X balance in a broker's wallet.
The final exchange fee paid by the broker is equal to
maximum(brokerTool.getFeeForBrokerDesignation(symbol, lots),  brokerTool.getFeeForBrokerVolume(symbol), brokerTool.getFeeForBrokerStake)</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Fee based solely on a broker's D8X balance, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| [brokerAddr] | <code>string</code> | <p>Address of the broker in question, if different from the one calling this function.</p> |

<a name="BrokerTool+determineExchangeFee"></a>

### brokerTool.determineExchangeFee(order, traderAddr) ⇒
<p>Determine exchange fee based on an order and a trader.
This is the fee charged by the exchange only, excluding the broker fee,
and it takes into account whether the order given here has been signed by a broker or not.
Use this, for instance, to verify that the fee to be charged for a given order is as expected,
before and after signing it with brokerTool.signOrder.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>Fee in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order for which to determine the exchange fee. Not necessarily signed by this broker.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader for whom to determine the fee.</p> |

<a name="BrokerTool+signOrder"></a>

### brokerTool.signOrder(order, traderAddr, feeDecimals, deadline) ⇒
<p>Adds this broker's signature to an order so it can be submitted by an approved trader.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <p>An order signed by this broker, which can be submitted directly with AccountTrade.order.</p>  

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

