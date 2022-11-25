## Modules

<dl>
<dt><a href="#module_d8xMath">d8xMath</a></dt>
<dd></dd>
<dt><a href="#module_utils">utils</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#AccountTrade">AccountTrade</a></dt>
<dd><p>Functions to create, submit and cancel orders on the exchange.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p></dd>
<dt><a href="#BrokerTool">BrokerTool</a></dt>
<dd><p>Functions for brokers to determine fees, deposit lots, and sign-up traders.</p></dd>
<dt><a href="#LiquidatorTool">LiquidatorTool</a></dt>
<dd><p>Methods to liquidate traders.</p></dd>
<dt><a href="#LiquidityProviderTool">LiquidityProviderTool</a></dt>
<dd><p>Methods to provide liquidity</p></dd>
<dt><a href="#MarketData">MarketData</a></dt>
<dd><p>This class requires no private key and is blockchain read-only.
No gas required for the queries here.</p></dd>
<dt><a href="#OrderReferrerTool">OrderReferrerTool</a></dt>
<dd><p>Methods to execute existing orders from the limit order book.</p></dd>
<dt><a href="#PerpetualDataHandler">PerpetualDataHandler</a></dt>
<dd><p>Parent class for AccountTrade and MarketData that handles
common data and chain operations</p></dd>
<dt><a href="#WriteAccessHandler">WriteAccessHandler</a></dt>
<dd><p>This is a parent class for the classes that require
write access to the contracts.
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p></dd>
</dl>

<a name="module_d8xMath"></a>

## d8xMath

* [d8xMath](#module_d8xMath)
    * [~ABK64x64ToFloat(x)](#module_d8xMath..ABK64x64ToFloat) ⇒ <code>number</code>
    * [~dec18ToFloat(x)](#module_d8xMath..dec18ToFloat) ⇒ <code>number</code>
    * [~floatToABK64x64(x)](#module_d8xMath..floatToABK64x64) ⇒ <code>BigNumber</code>
    * [~floatToDec18(x)](#module_d8xMath..floatToDec18) ⇒ <code>BigNumber</code>
    * [~mul64x64(x, y)](#module_d8xMath..mul64x64) ⇒ <code>BigNumber</code>
    * [~div64x64(x, y)](#module_d8xMath..div64x64) ⇒ <code>BigNumber</code>
    * [~calculateLiquidationPriceCollateralBase(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3)](#module_d8xMath..calculateLiquidationPriceCollateralBase) ⇒ <code>number</code>
    * [~calculateLiquidationPriceCollateralQuanto(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3, Sm)](#module_d8xMath..calculateLiquidationPriceCollateralQuanto) ⇒ <code>number</code>
    * [~calculateLiquidationPriceCollateralQuote(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3)](#module_d8xMath..calculateLiquidationPriceCollateralQuote) ⇒ <code>number</code>

<a name="module_d8xMath..ABK64x64ToFloat"></a>

### d8xMath~ABK64x64ToFloat(x) ⇒ <code>number</code>
<p>Convert ABK64x64 bigint-format to float.
Result = x/2^64 if big number, x/2^29 if number</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>x/2^64 in number-format (float)</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>BigNumber</code> \| <code>number</code> | <p>number in ABDK-format or 2^29</p> |

<a name="module_d8xMath..dec18ToFloat"></a>

### d8xMath~dec18ToFloat(x) ⇒ <code>number</code>
**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>x as a float (number)</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>BigNumber</code> | <p>BigNumber in Dec18 format</p> |

<a name="module_d8xMath..floatToABK64x64"></a>

### d8xMath~floatToABK64x64(x) ⇒ <code>BigNumber</code>
<p>Converts x into ABDK64x64 format</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>BigNumber</code> - <p>x^64 in big number format</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | <p>number (float)</p> |

<a name="module_d8xMath..floatToDec18"></a>

### d8xMath~floatToDec18(x) ⇒ <code>BigNumber</code>
**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>BigNumber</code> - <p>x as a BigNumber in Dec18 format</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | <p>number (float)</p> |

<a name="module_d8xMath..mul64x64"></a>

### d8xMath~mul64x64(x, y) ⇒ <code>BigNumber</code>
**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>BigNumber</code> - <p>x * y</p>  

| Param | Type |
| --- | --- |
| x | <code>BigNumber</code> | 
| y | <code>BigNumber</code> | 

<a name="module_d8xMath..div64x64"></a>

### d8xMath~div64x64(x, y) ⇒ <code>BigNumber</code>
**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>BigNumber</code> - <p>x / y</p>  

| Param | Type |
| --- | --- |
| x | <code>BigNumber</code> | 
| y | <code>BigNumber</code> | 

<a name="module_d8xMath..calculateLiquidationPriceCollateralBase"></a>

### d8xMath~calculateLiquidationPriceCollateralBase(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3) ⇒ <code>number</code>
<p>Determine the liquidation price</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>Amount to be deposited to have the given leverage when trading into position pos</p>  

| Param | Type | Description |
| --- | --- | --- |
| LockedInValueQC | <code>number</code> | <p>trader locked in value in quote currency</p> |
| position | <code>number</code> | <p>trader position in base currency</p> |
| cash_cc | <code>number</code> | <p>trader available margin cash in collateral currency</p> |
| maintenance_margin_rate | <code>number</code> | <p>maintenance margin ratio</p> |
| S3 | <code>number</code> | <p>collateral to quote conversion (=S2 if base-collateral, =1 if quuote collateral, = index S3 if quanto)</p> |

<a name="module_d8xMath..calculateLiquidationPriceCollateralQuanto"></a>

### d8xMath~calculateLiquidationPriceCollateralQuanto(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3, Sm) ⇒ <code>number</code>
<p>Determine the liquidation price</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>Amount to be deposited to have the given leverage when trading into position pos</p>  

| Param | Type | Description |
| --- | --- | --- |
| LockedInValueQC | <code>number</code> | <p>trader locked in value in quote currency</p> |
| position | <code>number</code> | <p>trader position in base currency</p> |
| cash_cc | <code>number</code> | <p>trader available margin cash in collateral currency</p> |
| maintenance_margin_rate | <code>number</code> | <p>maintenance margin ratio</p> |
| S3 | <code>number</code> | <p>collateral to quote conversion (=S2 if base-collateral, =1 if quuote collateral, = index S3 if quanto)</p> |
| Sm | <code>number</code> | <p>mark price</p> |

<a name="module_d8xMath..calculateLiquidationPriceCollateralQuote"></a>

### d8xMath~calculateLiquidationPriceCollateralQuote(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3) ⇒ <code>number</code>
<p>Determine the liquidation price</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>Amount to be deposited to have the given leverage when trading into position pos</p>  

| Param | Type | Description |
| --- | --- | --- |
| LockedInValueQC | <code>number</code> | <p>trader locked in value in quote currency</p> |
| position | <code>number</code> | <p>trader position in base currency</p> |
| cash_cc | <code>number</code> | <p>trader available margin cash in collateral currency</p> |
| maintenance_margin_rate | <code>number</code> | <p>maintenance margin ratio</p> |
| S3 | <code>number</code> | <p>collateral to quote conversion (=S2 if base-collateral, =1 if quuote collateral, = index S3 if quanto)</p> |

<a name="module_utils"></a>

## utils

* [utils](#module_utils)
    * [~to4Chars(s)](#module_utils..to4Chars) ⇒ <code>string</code>
    * [~toBytes4(s)](#module_utils..toBytes4) ⇒ <code>Buffer</code>
    * [~fromBytes4(b)](#module_utils..fromBytes4) ⇒ <code>string</code>
    * [~fromBytes4HexString(s)](#module_utils..fromBytes4HexString) ⇒ <code>string</code>

<a name="module_utils..to4Chars"></a>

### utils~to4Chars(s) ⇒ <code>string</code>
**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - <p>String with 4 characters (or characters + null chars)</p>  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | <p>String to shorten/extend to 4 characters</p> |

<a name="module_utils..toBytes4"></a>

### utils~toBytes4(s) ⇒ <code>Buffer</code>
<p>Converts string into 4-character bytes4
uses to4Chars to first convert the string into
4 characters.
Resulting buffer can be used with smart contract to
identify tokens (BTC, USDC, MATIC etc.)</p>

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>Buffer</code> - <p>4-character bytes4.</p>  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | <p>String to encode into bytes4</p> |

<a name="module_utils..fromBytes4"></a>

### utils~fromBytes4(b) ⇒ <code>string</code>
<p>Decodes a buffer encoded with toBytes4 into
a string. The string is the result of to4Chars of the
originally encoded string stripped from null-chars</p>

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - <p>String decoded into to4Chars-type string without null characters</p>  

| Param | Type | Description |
| --- | --- | --- |
| b | <code>Buffer</code> | <p>Correctly encoded bytes4 buffer using toBytes4</p> |

<a name="module_utils..fromBytes4HexString"></a>

### utils~fromBytes4HexString(s) ⇒ <code>string</code>
<p>Decodes the bytes4 encoded string received from the
smart contract as a hex-number in string-format</p>

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - <p>x of to4Chars(x) stripped from null-chars,
where x was originally encoded and
returned by the smart contract as bytes4</p>  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | <p>string representing a hex-number (&quot;0x...&quot;)</p> |

<a name="AccountTrade"></a>

## AccountTrade
<p>Functions to create, submit and cancel orders on the exchange.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p>

**Kind**: global class  

* [AccountTrade](#AccountTrade)
    * [new AccountTrade(config, privateKey)](#new_AccountTrade_new)
    * [.cancelOrder(symbol, orderId)](#AccountTrade+cancelOrder)
    * [.order(order)](#AccountTrade+order) ⇒ <code>string</code>
    * [.queryExchangeFee(poolSymbolName, [brokerAddr])](#AccountTrade+queryExchangeFee) ⇒
    * [.getCurrentTraderVolume(poolSymbolName)](#AccountTrade+getCurrentTraderVolume) ⇒ <code>number</code>

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

<a name="BrokerTool"></a>

## BrokerTool
<p>Functions for brokers to determine fees, deposit lots, and sign-up traders.</p>

**Kind**: global class  

* [BrokerTool](#BrokerTool)
    * [new BrokerTool(config, privateKey)](#new_BrokerTool_new)
    * [.getBrokerInducedFee(poolSymbolName)](#BrokerTool+getBrokerInducedFee) ⇒ <code>number</code>
    * [.getFeeForBrokerDesignation(poolSymbolName, [lots])](#BrokerTool+getFeeForBrokerDesignation) ⇒ <code>number</code>
    * [.getFeeForBrokerVolume(poolSymbolName)](#BrokerTool+getFeeForBrokerVolume) ⇒ <code>number</code>
    * [.getFeeForBrokerStake([brokerAddr])](#BrokerTool+getFeeForBrokerStake) ⇒ <code>number</code>
    * [.determineExchangeFee(order, traderAddr)](#BrokerTool+determineExchangeFee) ⇒ <code>number</code>
    * [.getCurrentBrokerVolume(poolSymbolName)](#BrokerTool+getCurrentBrokerVolume) ⇒ <code>number</code>
    * [.getLotSize(poolSymbolName)](#BrokerTool+getLotSize) ⇒ <code>number</code>
    * [.getBrokerDesignation(poolSymbolName)](#BrokerTool+getBrokerDesignation) ⇒ <code>number</code>
    * [.brokerDepositToDefaultFund(poolSymbolName, lots)](#BrokerTool+brokerDepositToDefaultFund) ⇒ <code>ethers.providers.TransactionResponse</code>
    * [.signOrder(order, traderAddr, feeDecimals, deadline)](#BrokerTool+signOrder) ⇒ <code>Order</code>
    * [.transferOwnership(poolSymbolName, newAddress)](#BrokerTool+transferOwnership) ⇒ <code>ethers.providers.TransactionResponse</code>

<a name="new_BrokerTool_new"></a>

### new BrokerTool(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object.</p> |
| privateKey | <code>string</code> | <p>Private key of a broker.</p> |

<a name="BrokerTool+getBrokerInducedFee"></a>

### brokerTool.getBrokerInducedFee(poolSymbolName) ⇒ <code>number</code>
<p>Determine the exchange fee based on lots, traded volume, and D8X balance of this broker.
This is the final exchange fee paid by the broker.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Exchange fee for this broker, in decimals (i.e. 0.1% is 0.001)</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+getFeeForBrokerDesignation"></a>

### brokerTool.getFeeForBrokerDesignation(poolSymbolName, [lots]) ⇒ <code>number</code>
<p>Determine the exchange fee based on lots purchased by this broker.
The final exchange fee paid by the broker is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on this broker's designation, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| [lots] | <code>number</code> | <p>Optional, designation to use if different from this broker's.</p> |

<a name="BrokerTool+getFeeForBrokerVolume"></a>

### brokerTool.getFeeForBrokerVolume(poolSymbolName) ⇒ <code>number</code>
<p>Determine the exchange fee based on volume traded under this broker.
The final exchange fee paid by the broker is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on a broker's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+getFeeForBrokerStake"></a>

### brokerTool.getFeeForBrokerStake([brokerAddr]) ⇒ <code>number</code>
<p>Determine the exchange fee based on the current D8X balance in a broker's wallet.
The final exchange fee paid by the broker is equal to
maximum(brokerTool.getFeeForBrokerDesignation(symbol, lots),  brokerTool.getFeeForBrokerVolume(symbol), brokerTool.getFeeForBrokerStake)</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on a broker's D8X balance, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| [brokerAddr] | <code>string</code> | <p>Address of the broker in question, if different from the one calling this function.</p> |

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
| order | <code>Order</code> | <p>Order for which to determine the exchange fee. Not necessarily signed by this broker.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader for whom to determine the fee.</p> |

<a name="BrokerTool+getCurrentBrokerVolume"></a>

### brokerTool.getCurrentBrokerVolume(poolSymbolName) ⇒ <code>number</code>
<p>Exponentially weighted EMA of the total trading volume of all trades performed under this broker.
The weights are chosen so that in average this coincides with the 30 day volume.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Current trading volume for this broker, in USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+getLotSize"></a>

### brokerTool.getLotSize(poolSymbolName) ⇒ <code>number</code>
<p>Total amount of collateral currency a broker has to deposit into the default fund to purchase one lot.
This is equivalent to the price of a lot expressed in a given pool's currency (e.g. MATIC, USDC, etc).</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Broker lot size in a given pool's currency, e.g. in MATIC for poolSymbolName MATIC.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+getBrokerDesignation"></a>

### brokerTool.getBrokerDesignation(poolSymbolName) ⇒ <code>number</code>
<p>Provides information on how many lots a broker purchased for a given pool.
This is relevant to determine the broker's fee tier.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Number of lots purchased by this broker.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

<a name="BrokerTool+brokerDepositToDefaultFund"></a>

### brokerTool.brokerDepositToDefaultFund(poolSymbolName, lots) ⇒ <code>ethers.providers.TransactionResponse</code>
<p>Deposit lots to the default fund of a given pool.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>ethers.providers.TransactionResponse</code> - <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| lots | <code>number</code> | <p>Number of lots to deposit into this pool.</p> |

<a name="BrokerTool+signOrder"></a>

### brokerTool.signOrder(order, traderAddr, feeDecimals, deadline) ⇒ <code>Order</code>
<p>Adds this broker's signature to an order so that it can be submitted by an approved trader.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>Order</code> - <p>An order signed by this broker, which can be submitted directly with AccountTrade.order.</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order to sign.</p> |
| traderAddr | <code>string</code> | <p>Address of trader submitting the order.</p> |
| feeDecimals | <code>number</code> | <p>Fee that this broker is approving for the trader.</p> |
| deadline | <code>number</code> | <p>Deadline for the order to be executed.</p> |

<a name="BrokerTool+transferOwnership"></a>

### brokerTool.transferOwnership(poolSymbolName, newAddress) ⇒ <code>ethers.providers.TransactionResponse</code>
<p>Transfer ownership of a broker's status to a new wallet.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>ethers.providers.TransactionResponse</code> - <p>ethers transaction object</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| newAddress | <code>string</code> | <p>The address this broker wants to use from now on.</p> |

<a name="LiquidatorTool"></a>

## LiquidatorTool
<p>Methods to liquidate traders.</p>

**Kind**: global class  

* [LiquidatorTool](#LiquidatorTool)
    * [new LiquidatorTool(config, privateKey)](#new_LiquidatorTool_new)
    * [.liquidateTrader(symbol, traderAddr, [liquidatorAddr])](#LiquidatorTool+liquidateTrader) ⇒ <code>number</code>
    * [.isMaintenanceMarginSafe(symbol, traderAddr)](#LiquidatorTool+isMaintenanceMarginSafe) ⇒ <code>boolean</code>
    * [.countActivePerpAccounts(symbol)](#LiquidatorTool+countActivePerpAccounts) ⇒ <code>number</code>
    * [.getActiveAccountsByChunks(symbol, from, to)](#LiquidatorTool+getActiveAccountsByChunks) ⇒ <code>Array.&lt;string&gt;</code>
    * [.getAllActiveAccounts(symbol)](#LiquidatorTool+getAllActiveAccounts) ⇒ <code>Array.&lt;string&gt;</code>

<a name="new_LiquidatorTool_new"></a>

### new LiquidatorTool(config, privateKey)
<p>Constructs a LiquidatorTool instance for a given configuration and private key.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object.</p> |
| privateKey | <code>string</code> | <p>Private key of account that liquidates.</p> |

<a name="LiquidatorTool+liquidateTrader"></a>

### liquidatorTool.liquidateTrader(symbol, traderAddr, [liquidatorAddr]) ⇒ <code>number</code>
**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>number</code> - <p>Liquidated amount.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader to be liquidated.</p> |
| [liquidatorAddr] | <code>string</code> | <p>Address to be credited if the liquidation succeeds. Defaults to the wallet used to execute the liquidation.</p> |

<a name="LiquidatorTool+isMaintenanceMarginSafe"></a>

### liquidatorTool.isMaintenanceMarginSafe(symbol, traderAddr) ⇒ <code>boolean</code>
<p>Check if a trader is maintenance margin safe - if not, it can be liquidated.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>boolean</code> - <p>True if the trader is maintenance margin safe in the perpetual.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader whose position we want to assess.</p> |

<a name="LiquidatorTool+countActivePerpAccounts"></a>

### liquidatorTool.countActivePerpAccounts(symbol) ⇒ <code>number</code>
<p>Total number of active accounts for this symbol, i.e. accounts with positions that are currently open.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>number</code> - <p>Number of active accounts.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

<a name="LiquidatorTool+getActiveAccountsByChunks"></a>

### liquidatorTool.getActiveAccountsByChunks(symbol, from, to) ⇒ <code>Array.&lt;string&gt;</code>
<p>Get addresses of active accounts by chunks.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of addresses.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| from | <code>number</code> | <p>From which account we start counting (0-indexed).</p> |
| to | <code>number</code> | <p>Until which account we count.</p> |

<a name="LiquidatorTool+getAllActiveAccounts"></a>

### liquidatorTool.getAllActiveAccounts(symbol) ⇒ <code>Array.&lt;string&gt;</code>
<p>Addresses for all the active accounts in this perpetual symbol.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of addresses.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

<a name="LiquidityProviderTool"></a>

## LiquidityProviderTool
<p>Methods to provide liquidity</p>

**Kind**: global class  

* [LiquidityProviderTool](#LiquidityProviderTool)
    * [new LiquidityProviderTool(config, privateKey)](#new_LiquidityProviderTool_new)
    * [.getParticipationValue(poolSymbolName)](#LiquidityProviderTool+getParticipationValue) ⇒
    * [.addLiquidity(poolname, amountCC)](#LiquidityProviderTool+addLiquidity) ⇒
    * [.removeLiquidity(poolSymbolName, amountPoolShares)](#LiquidityProviderTool+removeLiquidity) ⇒

<a name="new_LiquidityProviderTool_new"></a>

### new LiquidityProviderTool(config, privateKey)
<p>Constructor</p>


| Param | Description |
| --- | --- |
| config | <p>configuration</p> |
| privateKey | <p>private key of account that trades</p> |

<a name="LiquidityProviderTool+getParticipationValue"></a>

### liquidityProviderTool.getParticipationValue(poolSymbolName) ⇒
<p>Value of the share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Returns**: <p>Value in poolSymbol-currency (e.g. MATIC, USDC), balabce of share tokens, and share token symbol.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC).</p> |

<a name="LiquidityProviderTool+addLiquidity"></a>

### liquidityProviderTool.addLiquidity(poolname, amountCC) ⇒
<p>Add liquidity to the PnL participant fund. The address gets pool shares in return.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Returns**: <p>Transaction object</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolname | <code>string</code> | <p>Name of pool symbol (e.g. MATIC)</p> |
| amountCC | <code>number</code> | <p>Amount in pool-collateral currency</p> |

<a name="LiquidityProviderTool+removeLiquidity"></a>

### liquidityProviderTool.removeLiquidity(poolSymbolName, amountPoolShares) ⇒
<p>Remove liquidity from the pool.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Name of pool symbol (e.g. MATIC).</p> |
| amountPoolShares | <code>string</code> | <p>Amount in pool-tokens, removes everything if &gt; available amount.</p> |

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

<a name="PerpetualDataHandler"></a>

## PerpetualDataHandler
<p>Parent class for AccountTrade and MarketData that handles
common data and chain operations</p>

**Kind**: global class  

* [PerpetualDataHandler](#PerpetualDataHandler)
    * _instance_
        * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
        * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * _static_
        * [._calculateLiquidationPrice(cleanSymbol, traderState, symbolToPerpStaticInfo)](#PerpetualDataHandler._calculateLiquidationPrice) ⇒
        * [.symbolToPerpetualId(symbol, symbolToPerpStaticInfo)](#PerpetualDataHandler.symbolToPerpetualId) ⇒
        * [.toSmartContractOrder(order, traderAddr, symbolToPerpetualMap)](#PerpetualDataHandler.toSmartContractOrder) ⇒
        * [._orderTypeToFlag(order)](#PerpetualDataHandler._orderTypeToFlag) ⇒
        * [.readSDKConfig(fileLocation)](#PerpetualDataHandler.readSDKConfig) ⇒

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### perpetualDataHandler.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### perpetualDataHandler.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
<a name="PerpetualDataHandler._calculateLiquidationPrice"></a>

### PerpetualDataHandler.\_calculateLiquidationPrice(cleanSymbol, traderState, symbolToPerpStaticInfo) ⇒
<p>Liquidation price</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>liquidation mark-price, corresponding collateral/quote conversion</p>  

| Param | Description |
| --- | --- |
| cleanSymbol | <p>symbol after calling symbolToBytes4Symbol</p> |
| traderState | <p>BigInt array according to smart contract</p> |
| symbolToPerpStaticInfo | <p>mapping symbol-&gt;PerpStaticInfo</p> |

<a name="PerpetualDataHandler.symbolToPerpetualId"></a>

### PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo) ⇒
<p>Finds the perpetual id for a symbol of the form</p>
<base>-<quote>-<collateral>. The function first converts the
token names into bytes4 representation

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>perpetual id or it fails</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol (e.g., BTC-USD-MATIC)</p> |
| symbolToPerpStaticInfo | <p>map that contains the bytes4-symbol to PerpetualStaticInfo including id mapping</p> |

<a name="PerpetualDataHandler.toSmartContractOrder"></a>

### PerpetualDataHandler.toSmartContractOrder(order, traderAddr, symbolToPerpetualMap) ⇒
<p>Transform the convenient form of the order into a smart-contract accepted type of order</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>SmartContractOrder</p>  

| Param | Description |
| --- | --- |
| order | <p>order type</p> |
| traderAddr | <p>address of the trader</p> |
| symbolToPerpetualMap | <p>mapping of symbol to perpetual Id</p> |

<a name="PerpetualDataHandler._orderTypeToFlag"></a>

### PerpetualDataHandler.\_orderTypeToFlag(order) ⇒
<p>Determine the correct order flags based on the order-properties.
Checks for some misspecifications.</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>BigNumber flags</p>  

| Param | Description |
| --- | --- |
| order | <p>order type</p> |

<a name="PerpetualDataHandler.readSDKConfig"></a>

### PerpetualDataHandler.readSDKConfig(fileLocation) ⇒
<p>Read config file into NodeSDKConfig interface</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>NodeSDKConfig</p>  

| Param | Description |
| --- | --- |
| fileLocation | <p>json-file with required variables for config</p> |

<a name="WriteAccessHandler"></a>

## WriteAccessHandler
<p>This is a parent class for the classes that require
write access to the contracts.
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p>

**Kind**: global class  

* [WriteAccessHandler](#WriteAccessHandler)
    * [new WriteAccessHandler(config, privateKey)](#new_WriteAccessHandler_new)
    * [.createProxyInstance()](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒

<a name="new_WriteAccessHandler_new"></a>

### new WriteAccessHandler(config, privateKey)
<p>Constructor</p>


| Param | Description |
| --- | --- |
| config | <p>configuration</p> |
| privateKey | <p>private key of account that trades</p> |

<a name="WriteAccessHandler+createProxyInstance"></a>

### writeAccessHandler.createProxyInstance()
<p>Initialize the AccountTrade-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
<a name="WriteAccessHandler+setAllowance"></a>

### writeAccessHandler.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Returns**: <p>transaction hash</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

