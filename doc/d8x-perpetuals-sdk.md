## Modules

<dl>
<dt><a href="#module_d8xMath">d8xMath</a></dt>
<dd></dd>
<dt><a href="#module_utils">utils</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#AccountTrade">AccountTrade</a> ⇐ <code><a href="#WriteAccessHandler">WriteAccessHandler</a></code></dt>
<dd><p>Functions to create, submit and cancel orders on the exchange.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p></dd>
<dt><a href="#BrokerTool">BrokerTool</a> ⇐ <code><a href="#WriteAccessHandler">WriteAccessHandler</a></code></dt>
<dd><p>Functions for brokers to determine fees, deposit lots, and sign-up traders.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p></dd>
<dt><a href="#LiquidatorTool">LiquidatorTool</a> ⇐ <code><a href="#WriteAccessHandler">WriteAccessHandler</a></code></dt>
<dd><p>Functions to liquidate traders. This class requires a private key
and executes smart-contract interactions that require gas-payments.</p></dd>
<dt><a href="#LiquidityProviderTool">LiquidityProviderTool</a> ⇐ <code><a href="#WriteAccessHandler">WriteAccessHandler</a></code></dt>
<dd><p>Functions to provide liquidity. This class requires a private key and executes
smart-contract interactions that require gas-payments.</p></dd>
<dt><a href="#MarketData">MarketData</a> ⇐ <code><a href="#PerpetualDataHandler">PerpetualDataHandler</a></code></dt>
<dd><p>Functions to access market data (e.g., information on open orders, information on products that can be traded).
This class requires no private key and is blockchain read-only.
No gas required for the queries here.</p></dd>
<dt><a href="#OrderReferrerTool">OrderReferrerTool</a> ⇐ <code><a href="#WriteAccessHandler">WriteAccessHandler</a></code></dt>
<dd><p>Functions to execute existing conditional orders from the limit order book. This class
requires a private key and executes smart-contract interactions that require
gas-payments.</p></dd>
<dt><a href="#PerpetualDataHandler">PerpetualDataHandler</a></dt>
<dd><p>Parent class for MarketData and WriteAccessHandler that handles
common data and chain operations.</p></dd>
<dt><a href="#PerpetualEventHandler">PerpetualEventHandler</a></dt>
<dd><p>This class handles events and stores relevant variables
as member variables. The events change the state of the member variables:
mktData : MarketData relevant market data with current state (e.g. index price)
ordersInPerpetual: Map&lt;number, OrderStruct&gt; all open orders for the given trader
positionInPerpetual: Map&lt;number, MarginAccount&gt; all open positions for the given trader</p>
<p>Get data:</p>
<ul>
<li>getPerpetualData(perp id (string) or symbol) : PerpetualState. This is a reference!</li>
<li>getExchangeInfo() : ExchangeInfo. This is a reference!</li>
<li>getCurrentPositionRisk(perp id (string) or symbol) : MarginAccount. This is a reference!</li>
<li>getOrdersInPerpetualMap : Map&lt;number, OrderStruct&gt;. This is a reference!</li>
<li>getpositionInPerpetualMap : Map&lt;number, MarginAccount&gt;. This is a reference!</li>
</ul>
<p>Construct with a trader address and a marketData object
Initialize to gather all the relevant data.
Send event variables to event handler &quot;on<EventName>&quot; - this updates members</p>
<ul>
<li>[x] onUpdateMarkPrice              : emitted on proxy; updates markprice and index price data</li>
<li>[x] onUpdateUpdateFundingRate      : emitted on proxy; sets funding rate</li>
<li>[x] onExecutionFailed              : emitted on order book; removes an open order</li>
<li>[x] onPerpetualLimitOrderCancelled : emitted on order book; removes an open order</li>
<li>[x] onPerpetualLimitOrderCreated   : emitted on order book; adds an open order to the data</li>
<li>[x] async onUpdateMarginAccount    : emitted on proxy; updates position data and open interest</li>
<li>[x] onTrade                        : emitted on proxy; returns TradeEvent to be displayed</li>
</ul></dd>
<dt><a href="#PriceFeeds">PriceFeeds</a></dt>
<dd><p>This class communicates with the REST API that provides price-data that is
to be submitted to the smart contracts for certain functions such as
trader liquidations, trade executions, change of trader margin amount.</p></dd>
<dt><a href="#TraderInterface">TraderInterface</a> ⇐ <code><a href="#MarketData">MarketData</a></code></dt>
<dd><p>Interface that can be used by front-end that wraps all private functions
so that signatures can be handled in frontend via wallet</p></dd>
<dt><a href="#WriteAccessHandler">WriteAccessHandler</a> ⇐ <code><a href="#PerpetualDataHandler">PerpetualDataHandler</a></code></dt>
<dd><p>This is a parent class for the classes that require
write access to the contracts.
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p></dd>
</dl>

## Members

<dl>
<dt><a href="#CollaterlCCY">CollaterlCCY</a></dt>
<dd><p>struct ClientOrder {
uint24 iPerpetualId; // unique id of the perpetual
int128 fLimitPrice; // order will not execute if realized price is above (buy) or below (sell) this price
uint16 leverageTDR; // leverage, set to 0 if deposit margin and trade separate; format: two-digit integer (e.g., 12.34 -&gt; 1234)
uint32 executionTimestamp; // the order will not be executed before this timestamp, allows TWAP orders
uint32 flags; // Order-flags are specified in OrderFlags.sol
uint32 iDeadline; // order will not be executed after this deadline
address brokerAddr; // can be empty, address of the broker
int128 fTriggerPrice; // trigger price for stop-orders|0. Order can be executed if the mark price is below this price (sell order) or above (buy)
int128 fAmount; // signed amount of base-currency. Will be rounded to lot size
bytes32 parentChildDigest1; // see notice in LimitOrderBook.sol
address traderAddr; // address of the trader
bytes32 parentChildDigest2; // see notice in LimitOrderBook.sol
uint16 brokerFeeTbps; // broker fee in tenth of a basis point
bytes brokerSignature; // signature, can be empty if no brokerAddr provided
//address referrerAddr; &lt;- will be set by LimitOrderBook
//uint64 submittedBlock &lt;- will be set by LimitOrderBook
}</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ExchangeInfo">ExchangeInfo</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PoolState">PoolState</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_d8xMath"></a>

## d8xMath

* [d8xMath](#module_d8xMath)
    * [~ABDK29ToFloat(x)](#module_d8xMath..ABDK29ToFloat) ⇒ <code>number</code>
    * [~ABK64x64ToFloat(x)](#module_d8xMath..ABK64x64ToFloat) ⇒ <code>number</code>
    * [~decNToFloat(x)](#module_d8xMath..decNToFloat) ⇒ <code>number</code>
    * [~dec18ToFloat(x)](#module_d8xMath..dec18ToFloat) ⇒ <code>number</code>
    * [~floatToABK64x64(x)](#module_d8xMath..floatToABK64x64) ⇒ <code>BigNumber</code>
    * [~floatToDec18(x)](#module_d8xMath..floatToDec18) ⇒ <code>BigNumber</code>
    * [~countDecimalsOf(x, precision)](#module_d8xMath..countDecimalsOf) ⇒
    * [~roundToLotString(x, lot, precision)](#module_d8xMath..roundToLotString) ⇒
    * [~mul64x64(x, y)](#module_d8xMath..mul64x64) ⇒ <code>BigNumber</code>
    * [~div64x64(x, y)](#module_d8xMath..div64x64) ⇒ <code>BigNumber</code>
    * [~calculateLiquidationPriceCollateralBase(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3)](#module_d8xMath..calculateLiquidationPriceCollateralBase) ⇒ <code>number</code>
    * [~calculateLiquidationPriceCollateralQuanto(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3, Sm)](#module_d8xMath..calculateLiquidationPriceCollateralQuanto) ⇒ <code>number</code>
    * [~calculateLiquidationPriceCollateralQuote(LockedInValueQC, position, cash_cc, maintenance_margin_rate, S3)](#module_d8xMath..calculateLiquidationPriceCollateralQuote) ⇒ <code>number</code>
    * [~getMarginRequiredForLeveragedTrade(targetLeverage, currentPosition, currentLockedInValue, tradeAmount, markPrice, indexPriceS2, indexPriceS3, tradePrice, feeRate)](#module_d8xMath..getMarginRequiredForLeveragedTrade) ⇒ <code>number</code>
    * [~getNewPositionLeverage(tradeAmount, marginCollateral, currentPosition, currentLockedInValue, price, indexPriceS3, markPrice)](#module_d8xMath..getNewPositionLeverage) ⇒
    * [~getDepositAmountForLvgTrade(pos0, b0, tradeAmnt, targetLvg, price, S3, S2Mark)](#module_d8xMath..getDepositAmountForLvgTrade) ⇒ <code>number</code>

<a name="module_d8xMath..ABDK29ToFloat"></a>

### d8xMath~ABDK29ToFloat(x) ⇒ <code>number</code>
<p>Convert ABK64x64/2^35 bigint-format to float.
Divide by 2^64 to get a float, but it's already &quot;divided&quot; by 2^35,
so there's only 2^29 left</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>x/2^64 in number-format (float)</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>BigNumber</code> \| <code>number</code> | <p>number in ABDK-format/2^35</p> |

<a name="module_d8xMath..ABK64x64ToFloat"></a>

### d8xMath~ABK64x64ToFloat(x) ⇒ <code>number</code>
<p>Convert ABK64x64 bigint-format to float.
Result = x/2^64 if big number, x/2^29 if number</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>x/2^64 in number-format (float)</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>BigNumber</code> \| <code>number</code> | <p>number in ABDK-format or 2^29</p> |

<a name="module_d8xMath..decNToFloat"></a>

### d8xMath~decNToFloat(x) ⇒ <code>number</code>
**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>x as a float (number)</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>BigNumber</code> | <p>BigNumber in Dec-N format</p> |

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

<a name="module_d8xMath..countDecimalsOf"></a>

### d8xMath~countDecimalsOf(x, precision) ⇒
<p>9 are rounded up regardless of precision, e.g, 0.1899000 at precision 6 results in 3</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <p>number of decimals</p>  

| Param |
| --- |
| x | 
| precision | 

<a name="module_d8xMath..roundToLotString"></a>

### d8xMath~roundToLotString(x, lot, precision) ⇒
<p>Round a number to a given lot size and return a string formated
to for this lot-size</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <p>formated number string</p>  

| Param | Default | Description |
| --- | --- | --- |
| x |  | <p>number to round</p> |
| lot |  | <p>lot size (could be 'uneven' such as 0.019999999 instead of 0.02)</p> |
| precision | <code>7</code> | <p>optional lot size precision (e.g. if 0.01999 should be 0.02 then precision could be 5)</p> |

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

<a name="module_d8xMath..getMarginRequiredForLeveragedTrade"></a>

### d8xMath~getMarginRequiredForLeveragedTrade(targetLeverage, currentPosition, currentLockedInValue, tradeAmount, markPrice, indexPriceS2, indexPriceS3, tradePrice, feeRate) ⇒ <code>number</code>
**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>Total collateral amount needed for the new position to have he desired leverage.</p>  

| Param | Description |
| --- | --- |
| targetLeverage | <p>Leverage of the resulting position. It must be positive unless the resulting position is closed.</p> |
| currentPosition | <p>Current position size, in base currency, signed.</p> |
| currentLockedInValue | <p>Current locked in value, average entry price times position size, in quote currency.</p> |
| tradeAmount | <p>Trade amount, in base currency, signed.</p> |
| markPrice | <p>Mark price, positive.</p> |
| indexPriceS2 | <p>Index price, positive.</p> |
| indexPriceS3 | <p>Collateral index price, positive.</p> |
| tradePrice | <p>Expected price to trade tradeAmount.</p> |
| feeRate |  |

<a name="module_d8xMath..getNewPositionLeverage"></a>

### d8xMath~getNewPositionLeverage(tradeAmount, marginCollateral, currentPosition, currentLockedInValue, price, indexPriceS3, markPrice) ⇒
<p>Compute the leverage resulting from a trade</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <p>Leverage of the resulting position</p>  

| Param | Description |
| --- | --- |
| tradeAmount | <p>Amount to trade, in base currency, signed</p> |
| marginCollateral | <p>Amount of cash in the margin account, in collateral currency</p> |
| currentPosition | <p>Position size before the trade</p> |
| currentLockedInValue | <p>Locked-in value before the trade</p> |
| price | <p>Price charged to trade tradeAmount</p> |
| indexPriceS3 | <p>Spot price of the collateral currency when the trade happens</p> |
| markPrice | <p>Mark price of the index when the trade happens</p> |

<a name="module_d8xMath..getDepositAmountForLvgTrade"></a>

### d8xMath~getDepositAmountForLvgTrade(pos0, b0, tradeAmnt, targetLvg, price, S3, S2Mark) ⇒ <code>number</code>
<p>Determine amount to be deposited into margin account so that the given leverage
is obtained when trading a position pos (trade amount = position)
Does NOT include fees
Smart contract equivalent: calcMarginForTargetLeverage(..., _ignorePosBalance = false &amp; balance = b0)</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>number</code> - <p>Amount to be deposited to have the given leverage when trading into position pos before fees</p>  

| Param | Type | Description |
| --- | --- | --- |
| pos0 | <code>number</code> | <p>current position</p> |
| b0 | <code>number</code> | <p>current balance</p> |
| tradeAmnt | <code>number</code> | <p>amount to trade</p> |
| targetLvg | <code>number</code> | <p>target leverage</p> |
| price | <code>number</code> | <p>price to trade amount 'tradeAmnt'</p> |
| S3 | <code>number</code> | <p>collateral to quote conversion (=S2 if base-collateral, =1 if quote collateral, = index S3 if quanto)</p> |
| S2Mark | <code>number</code> | <p>mark price</p> |

<a name="module_utils"></a>

## utils

* [utils](#module_utils)
    * [~to4Chars(s)](#module_utils..to4Chars) ⇒ <code>string</code>
    * [~toBytes4(s)](#module_utils..toBytes4) ⇒ <code>Buffer</code>
    * [~fromBytes4(b)](#module_utils..fromBytes4) ⇒ <code>string</code>
    * [~fromBytes4HexString(s)](#module_utils..fromBytes4HexString) ⇒ <code>string</code>
    * [~contractSymbolToSymbol(s, mapping)](#module_utils..contractSymbolToSymbol) ⇒ <code>string</code>
    * [~symbolToContractSymbol(s, mapping)](#module_utils..symbolToContractSymbol) ⇒ <code>Buffer</code>
    * [~symbol4BToLongSymbol(s, mapping)](#module_utils..symbol4BToLongSymbol) ⇒ <code>string</code>

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

<a name="module_utils..contractSymbolToSymbol"></a>

### utils~contractSymbolToSymbol(s, mapping) ⇒ <code>string</code>
**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - <p>User friendly currency symbol, e.g. &quot;MATIC&quot;</p>  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | <p>String representing a hex-number (&quot;0x...&quot;)</p> |
| mapping | <code>Object</code> | <p>List of symbol and clean symbol pairs, e.g. [{symbol: &quot;MATIC&quot;, cleanSymbol: &quot;MATC&quot;}, ...]</p> |

<a name="module_utils..symbolToContractSymbol"></a>

### utils~symbolToContractSymbol(s, mapping) ⇒ <code>Buffer</code>
**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>Buffer</code> - <p>Buffer that can be used with smart contract to identify tokens</p>  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | <p>User friendly currency symbol, e.g. &quot;MATIC&quot;</p> |
| mapping | <code>Object</code> | <p>List of symbol and clean symbol pairs, e.g. [{symbol: &quot;MATIC&quot;, cleanSymbol: &quot;MATC&quot;}, ...]</p> |

<a name="module_utils..symbol4BToLongSymbol"></a>

### utils~symbol4BToLongSymbol(s, mapping) ⇒ <code>string</code>
<p>Converts symbol or symbol combination into long format</p>

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - <p>long format e.g. MATIC. if not found the element is &quot;&quot;</p>  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | <p>symbol, e.g., USDC-MATC-USDC, MATC, USDC, ...</p> |
| mapping | <code>Object</code> | <p>list of symbol and clean symbol pairs, e.g. [{symbol: &quot;MATIC&quot;, cleanSymbol: &quot;MATC&quot;}, ...]</p> |

<a name="AccountTrade"></a>

## AccountTrade ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
<p>Functions to create, submit and cancel orders on the exchange.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

* [AccountTrade](#AccountTrade) ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
    * [new AccountTrade(config, privateKey)](#new_AccountTrade_new)
    * [.cancelOrder(symbol, orderId)](#AccountTrade+cancelOrder) ⇒ <code>ContractTransaction</code>
    * [.order(order)](#AccountTrade+order) ⇒ <code>ContractTransaction</code>
    * [.queryExchangeFee(poolSymbolName, [brokerAddr])](#AccountTrade+queryExchangeFee) ⇒
    * [.getCurrentTraderVolume(poolSymbolName)](#AccountTrade+getCurrentTraderVolume) ⇒ <code>number</code>
    * [.getOrderIds(symbol)](#AccountTrade+getOrderIds) ⇒ <code>Array.&lt;string&gt;</code>
    * [.addCollateral(symbol, amount)](#AccountTrade+addCollateral)
    * [.removeCollateral(symbol, amount)](#AccountTrade+removeCollateral)
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_AccountTrade_new"></a>

### new AccountTrade(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of account that trades.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // AccountTrade (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  // Create a proxy instance to access the blockchain
  await accTrade.createProxyInstance();
}
main();
```
<a name="AccountTrade+cancelOrder"></a>

### accountTrade.cancelOrder(symbol, orderId) ⇒ <code>ContractTransaction</code>
<p>Cancels an existing order on the exchange.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>ContractTransaction</code> - <p>Contract Transaction (containing events).</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be cancelled.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
async function main() {
   console.log(AccountTrade);
   // setup (authentication required, PK is an environment variable with a private key)
   const config = PerpetualDataHandler.readSDKConfig("testnet");
   const pk: string = <string>process.env.PK;
   let accTrade = new AccountTrade(config, pk);
   await accTrade.createProxyInstance();
   // cancel order
   let cancelTransaction = accTrade.cancelOrder("MATIC-USD-MATIC",
       "0x4639061a58dcf34f4c9c703f49f1cb00d6a4fba490d62c0eb4a4fb06e1c76c19")
   console.log(cancelTransaction);
 }
 main();
```
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
import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
async function main() {
   console.log(AccountTrade);
   // setup (authentication required, PK is an environment variable with a private key)
   const config = PerpetualDataHandler.readSDKConfig("testnet");
   const pk: string = <string>process.env.PK;
   let accTrade = new AccountTrade(config, pk);
   await accTrade.createProxyInstance();
   // set allowance
   await accTrade.setAllowance("MATIC");
   // set an order
   let order: Order = {
       symbol: "MATIC-USD-MATIC",
       side: "BUY",
       type: "MARKET",
       quantity: 100,
       leverage: 2,
       executionTimestamp: Date.now()/1000,
   };
   let orderTransaction = await accTrade.order(order);
   console.log(orderTransaction);
 }
 main();
```
**Example**  
```js
import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
async function main() {
   console.log(AccountTrade);
   // setup (authentication required, PK is an environment variable with a private key)
   const config = PerpetualDataHandler.readSDKConfig("testnet");
   const pk: string = <string>process.env.PK;
   let accTrade = new AccountTrade(config, pk);
   await accTrade.createProxyInstance();
   // set allowance
   await accTrade.setAllowance("MATIC");
   // set an order
  let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "LIMIT",
      limitPrice: 1,
      quantity: 5,
      leverage: 2,
      executionTimestamp: Date.now() / 1000,
      deadline: Date.now() / 1000 + 8*60*60, // order expires 8 hours from now
   };
   let orderTransaction = await accTrade.order(order);
   console.log(orderTransaction);
 }
 main();
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

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // query exchange fee
  let fees = await accTrade.queryExchangeFee("MATIC");
  console.log(fees);
}
main();
```
<a name="AccountTrade+getCurrentTraderVolume"></a>

### accountTrade.getCurrentTraderVolume(poolSymbolName) ⇒ <code>number</code>
<p>Exponentially weighted EMA of the total USD trading volume of all trades performed by this trader.
The weights are chosen so that in average this coincides with the 30 day volume.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>number</code> - <p>Current trading volume for this trader, in USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // query 30 day volume
  let vol = await accTrade.getCurrentTraderVolume("MATIC");
  console.log(vol);
}
main();
```
<a name="AccountTrade+getOrderIds"></a>

### accountTrade.getOrderIds(symbol) ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of Ids for all the orders currently open by this trader.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // get order IDs
  let orderIds = await accTrade.getOrderIds("MATIC-USD-MATIC");
  console.log(orderIds);
}
main();
```
<a name="AccountTrade+addCollateral"></a>

### accountTrade.addCollateral(symbol, amount)
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| amount | <code>number</code> | <p>How much collateral to add, in units of collateral currency, e.g. MATIC</p> |

<a name="AccountTrade+removeCollateral"></a>

### accountTrade.removeCollateral(symbol, amount)
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| amount | <code>number</code> | <p>How much collateral to remove, in units of collateral currency, e.g. MATIC</p> |

<a name="WriteAccessHandler+createProxyInstance"></a>

### accountTrade.createProxyInstance(provider)
<p>Initialize the writeAccessHandler-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>createProxyInstance</code>](#WriteAccessHandler+createProxyInstance)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="WriteAccessHandler+setAllowance"></a>

### accountTrade.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>setAllowance</code>](#WriteAccessHandler+setAllowance)  
**Returns**: <p>ContractTransaction</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

<a name="WriteAccessHandler+getAddress"></a>

### accountTrade.getAddress() ⇒ <code>string</code>
<p>Address corresponding to the private key used to instantiate this class.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getAddress</code>](#WriteAccessHandler+getAddress)  
**Returns**: <code>string</code> - <p>Address of this wallet.</p>  
<a name="WriteAccessHandler+swapForMockToken"></a>

### accountTrade.swapForMockToken(symbol, amountToPay) ⇒
<p>Converts a given amount of chain native currency (test MATIC)
into a mock token used for trading on testnet, with a rate of 1:100_000</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>swapForMockToken</code>](#WriteAccessHandler+swapForMockToken)  
**Returns**: <p>Transaction object</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Pool margin token e.g. MATIC</p> |
| amountToPay | <p>Amount in chain currency, e.g. &quot;0.1&quot; for 0.1 MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### accountTrade.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### accountTrade.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### accountTrade.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### accountTrade.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### accountTrade.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### accountTrade.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### accountTrade.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### accountTrade.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### accountTrade.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### accountTrade.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### accountTrade.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### accountTrade.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### accountTrade.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="BrokerTool"></a>

## BrokerTool ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
<p>Functions for brokers to determine fees, deposit lots, and sign-up traders.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

* [BrokerTool](#BrokerTool) ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
    * [new BrokerTool(config, privateKey)](#new_BrokerTool_new)
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
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_BrokerTool_new"></a>

### new BrokerTool(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of a broker.</p> |

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
<a name="WriteAccessHandler+createProxyInstance"></a>

### brokerTool.createProxyInstance(provider)
<p>Initialize the writeAccessHandler-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>createProxyInstance</code>](#WriteAccessHandler+createProxyInstance)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="WriteAccessHandler+setAllowance"></a>

### brokerTool.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>setAllowance</code>](#WriteAccessHandler+setAllowance)  
**Returns**: <p>ContractTransaction</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

<a name="WriteAccessHandler+getAddress"></a>

### brokerTool.getAddress() ⇒ <code>string</code>
<p>Address corresponding to the private key used to instantiate this class.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getAddress</code>](#WriteAccessHandler+getAddress)  
**Returns**: <code>string</code> - <p>Address of this wallet.</p>  
<a name="WriteAccessHandler+swapForMockToken"></a>

### brokerTool.swapForMockToken(symbol, amountToPay) ⇒
<p>Converts a given amount of chain native currency (test MATIC)
into a mock token used for trading on testnet, with a rate of 1:100_000</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>swapForMockToken</code>](#WriteAccessHandler+swapForMockToken)  
**Returns**: <p>Transaction object</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Pool margin token e.g. MATIC</p> |
| amountToPay | <p>Amount in chain currency, e.g. &quot;0.1&quot; for 0.1 MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### brokerTool.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### brokerTool.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### brokerTool.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### brokerTool.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### brokerTool.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### brokerTool.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### brokerTool.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### brokerTool.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### brokerTool.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### brokerTool.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### brokerTool.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### brokerTool.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### brokerTool.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="LiquidatorTool"></a>

## LiquidatorTool ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
<p>Functions to liquidate traders. This class requires a private key
and executes smart-contract interactions that require gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

* [LiquidatorTool](#LiquidatorTool) ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
    * [new LiquidatorTool(config, privateKey)](#new_LiquidatorTool_new)
    * [.liquidateTrader(symbol, traderAddr, [liquidatorAddr], priceFeedData)](#LiquidatorTool+liquidateTrader) ⇒
    * [.isMaintenanceMarginSafe(symbol, traderAddr, indexPrices)](#LiquidatorTool+isMaintenanceMarginSafe) ⇒ <code>boolean</code>
    * [.countActivePerpAccounts(symbol)](#LiquidatorTool+countActivePerpAccounts) ⇒ <code>number</code>
    * [.getActiveAccountsByChunks(symbol, from, to)](#LiquidatorTool+getActiveAccountsByChunks) ⇒ <code>Array.&lt;string&gt;</code>
    * [.getAllActiveAccounts(symbol)](#LiquidatorTool+getAllActiveAccounts) ⇒ <code>Array.&lt;string&gt;</code>
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_LiquidatorTool_new"></a>

### new LiquidatorTool(config, privateKey)
<p>Constructs a LiquidatorTool instance for a given configuration and private key.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of account that liquidates.</p> |

**Example**  
```js
import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidatorTool);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // LiquidatorTool (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let lqudtrTool = new LiquidatorTool(config, pk);
  // Create a proxy instance to access the blockchain
  await lqudtrTool.createProxyInstance();
}
main();
```
<a name="LiquidatorTool+liquidateTrader"></a>

### liquidatorTool.liquidateTrader(symbol, traderAddr, [liquidatorAddr], priceFeedData) ⇒
<p>Liquidate a trader.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader to be liquidated.</p> |
| [liquidatorAddr] | <code>string</code> | <p>Address to be credited if the liquidation succeeds.</p> |
| priceFeedData | <code>PriceFeedSubmission</code> | <p>optional. VAA and timestamps for oracle. If not provided will query from REST API. Defaults to the wallet used to execute the liquidation.</p> |

**Example**  
```js
import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidatorTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtrTool = new LiquidatorTool(config, pk);
  await lqudtrTool.createProxyInstance();
  // liquidate trader
  let liqAmount = await lqudtrTool.liquidateTrader("ETH-USD-MATIC",
      "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
  console.log(liqAmount);
}
main();
```
<a name="LiquidatorTool+isMaintenanceMarginSafe"></a>

### liquidatorTool.isMaintenanceMarginSafe(symbol, traderAddr, indexPrices) ⇒ <code>boolean</code>
<p>Check if the collateral of a trader is above the maintenance margin (&quot;maintenance margin safe&quot;).
If not, the position can be liquidated.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>boolean</code> - <p>True if the trader is maintenance margin safe in the perpetual.
False means that the trader's position can be liquidated.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader whose position you want to assess.</p> |
| indexPrices | <code>Array.&lt;number&gt;</code> | <p>optional, index price S2/S3 for which we test</p> |

**Example**  
```js
import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidatorTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtrTool = new LiquidatorTool(config, pk);
  await lqudtrTool.createProxyInstance();
  // check if trader can be liquidated
  let safe = await lqudtrTool.isMaintenanceMarginSafe("ETH-USD-MATIC",
      "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
  console.log(safe);
}
main();
```
<a name="LiquidatorTool+countActivePerpAccounts"></a>

### liquidatorTool.countActivePerpAccounts(symbol) ⇒ <code>number</code>
<p>Total number of active accounts for this symbol, i.e. accounts with positions that are currently open.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>number</code> - <p>Number of active accounts.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidatorTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtrTool = new LiquidatorTool(config, pk);
  await lqudtrTool.createProxyInstance();
  // get number of active accounts
  let accounts = await lqudtrTool.countActivePerpAccounts("ETH-USD-MATIC");
  console.log(accounts);
}
main();
```
<a name="LiquidatorTool+getActiveAccountsByChunks"></a>

### liquidatorTool.getActiveAccountsByChunks(symbol, from, to) ⇒ <code>Array.&lt;string&gt;</code>
<p>Get addresses of active accounts by chunks.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of addresses at locations 'from', 'from'+1 ,..., 'to'-1.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| from | <code>number</code> | <p>From which account we start counting (0-indexed).</p> |
| to | <code>number</code> | <p>Until which account we count, non inclusive.</p> |

**Example**  
```js
import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidatorTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtrTool = new LiquidatorTool(config, pk);
  await lqudtrTool.createProxyInstance();
  // get all active accounts in chunks
  let accounts = await lqudtrTool.getActiveAccountsByChunks("ETH-USD-MATIC", 0, 4);
  console.log(accounts);
}
main();
```
<a name="LiquidatorTool+getAllActiveAccounts"></a>

### liquidatorTool.getAllActiveAccounts(symbol) ⇒ <code>Array.&lt;string&gt;</code>
<p>Addresses for all the active accounts in this perpetual symbol.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of addresses.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidatorTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let lqudtrTool = new LiquidatorTool(config, pk);
  await lqudtrTool.createProxyInstance();
  // get all active accounts
  let accounts = await lqudtrTool.getAllActiveAccounts("ETH-USD-MATIC");
  console.log(accounts);
}
main();
```
<a name="WriteAccessHandler+createProxyInstance"></a>

### liquidatorTool.createProxyInstance(provider)
<p>Initialize the writeAccessHandler-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>createProxyInstance</code>](#WriteAccessHandler+createProxyInstance)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="WriteAccessHandler+setAllowance"></a>

### liquidatorTool.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>setAllowance</code>](#WriteAccessHandler+setAllowance)  
**Returns**: <p>ContractTransaction</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

<a name="WriteAccessHandler+getAddress"></a>

### liquidatorTool.getAddress() ⇒ <code>string</code>
<p>Address corresponding to the private key used to instantiate this class.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getAddress</code>](#WriteAccessHandler+getAddress)  
**Returns**: <code>string</code> - <p>Address of this wallet.</p>  
<a name="WriteAccessHandler+swapForMockToken"></a>

### liquidatorTool.swapForMockToken(symbol, amountToPay) ⇒
<p>Converts a given amount of chain native currency (test MATIC)
into a mock token used for trading on testnet, with a rate of 1:100_000</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>swapForMockToken</code>](#WriteAccessHandler+swapForMockToken)  
**Returns**: <p>Transaction object</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Pool margin token e.g. MATIC</p> |
| amountToPay | <p>Amount in chain currency, e.g. &quot;0.1&quot; for 0.1 MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### liquidatorTool.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### liquidatorTool.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### liquidatorTool.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### liquidatorTool.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### liquidatorTool.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### liquidatorTool.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### liquidatorTool.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### liquidatorTool.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### liquidatorTool.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### liquidatorTool.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### liquidatorTool.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### liquidatorTool.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### liquidatorTool.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="LiquidityProviderTool"></a>

## LiquidityProviderTool ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
<p>Functions to provide liquidity. This class requires a private key and executes
smart-contract interactions that require gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

* [LiquidityProviderTool](#LiquidityProviderTool) ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
    * [new LiquidityProviderTool(config, privateKey)](#new_LiquidityProviderTool_new)
    * [.addLiquidity(poolSymbolName, amountCC)](#LiquidityProviderTool+addLiquidity) ⇒
    * [.initiateLiquidityWithdrawal(poolSymbolName, amountPoolShares)](#LiquidityProviderTool+initiateLiquidityWithdrawal) ⇒
    * [.executeLiquidityWithdrawal(poolSymbolName)](#LiquidityProviderTool+executeLiquidityWithdrawal) ⇒
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

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
<a name="WriteAccessHandler+createProxyInstance"></a>

### liquidityProviderTool.createProxyInstance(provider)
<p>Initialize the writeAccessHandler-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>createProxyInstance</code>](#WriteAccessHandler+createProxyInstance)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="WriteAccessHandler+setAllowance"></a>

### liquidityProviderTool.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>setAllowance</code>](#WriteAccessHandler+setAllowance)  
**Returns**: <p>ContractTransaction</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

<a name="WriteAccessHandler+getAddress"></a>

### liquidityProviderTool.getAddress() ⇒ <code>string</code>
<p>Address corresponding to the private key used to instantiate this class.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getAddress</code>](#WriteAccessHandler+getAddress)  
**Returns**: <code>string</code> - <p>Address of this wallet.</p>  
<a name="WriteAccessHandler+swapForMockToken"></a>

### liquidityProviderTool.swapForMockToken(symbol, amountToPay) ⇒
<p>Converts a given amount of chain native currency (test MATIC)
into a mock token used for trading on testnet, with a rate of 1:100_000</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>swapForMockToken</code>](#WriteAccessHandler+swapForMockToken)  
**Returns**: <p>Transaction object</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Pool margin token e.g. MATIC</p> |
| amountToPay | <p>Amount in chain currency, e.g. &quot;0.1&quot; for 0.1 MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### liquidityProviderTool.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### liquidityProviderTool.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### liquidityProviderTool.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### liquidityProviderTool.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### liquidityProviderTool.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### liquidityProviderTool.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### liquidityProviderTool.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### liquidityProviderTool.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### liquidityProviderTool.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### liquidityProviderTool.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### liquidityProviderTool.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### liquidityProviderTool.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### liquidityProviderTool.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="MarketData"></a>

## MarketData ⇐ [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)
<p>Functions to access market data (e.g., information on open orders, information on products that can be traded).
This class requires no private key and is blockchain read-only.
No gas required for the queries here.</p>

**Kind**: global class  
**Extends**: [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  

* [MarketData](#MarketData) ⇐ [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)
    * [new MarketData(config)](#new_MarketData_new)
    * _instance_
        * [.createProxyInstance(provider)](#MarketData+createProxyInstance)
        * [.getProxyAddress()](#MarketData+getProxyAddress) ⇒
        * [.smartContractOrderToOrder(smOrder)](#MarketData+smartContractOrderToOrder) ⇒
        * [.getReadOnlyProxyInstance()](#MarketData+getReadOnlyProxyInstance) ⇒
        * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ [<code>ExchangeInfo</code>](#ExchangeInfo)
        * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
        * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>MarginAccount</code>
        * [.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo)](#MarketData+positionRiskOnTrade) ⇒ <code>MarginAccount</code>
        * [.positionRiskOnCollateralAction(traderAddr, deltaCollateral, currentPositionRisk)](#MarketData+positionRiskOnCollateralAction) ⇒ <code>MarginAccount</code>
        * [.getWalletBalance(address, symbol)](#MarketData+getWalletBalance) ⇒
        * [.getPoolShareTokenBalance(address, symbolOrId)](#MarketData+getPoolShareTokenBalance)
        * [._getPoolShareTokenBalanceFromId(address, poolId)](#MarketData+_getPoolShareTokenBalanceFromId) ⇒
        * [.getShareTokenPrice(symbolOrId)](#MarketData+getShareTokenPrice) ⇒
        * [.getParticipationValue(address, symbolOrId)](#MarketData+getParticipationValue) ⇒
        * [.maxOrderSizeForTrader(side, positionRisk)](#MarketData+maxOrderSizeForTrader) ⇒
        * [.maxSignedPosition(side, symbol)](#MarketData+maxSignedPosition) ⇒
        * [.getOraclePrice(base, quote)](#MarketData+getOraclePrice) ⇒ <code>number</code>
        * [.getMarkPrice(symbol)](#MarketData+getMarkPrice) ⇒
        * [.getPerpetualPrice(symbol, quantity)](#MarketData+getPerpetualPrice) ⇒
        * [.getPerpetualState(symbol, indexPrices)](#MarketData+getPerpetualState) ⇒
        * [.getPerpetualStaticInfo(symbol)](#MarketData+getPerpetualStaticInfo) ⇒
        * [.getPerpetualMidPrice(symbol)](#MarketData+getPerpetualMidPrice) ⇒ <code>number</code>
        * [.getAvailableMargin(traderAddr, symbol, indexPrices)](#MarketData+getAvailableMargin) ⇒
        * [.getTraderLoyalityScore(traderAddr, brokerAddr)](#MarketData+getTraderLoyalityScore) ⇒
        * [.isMarketClosed(symbol)](#MarketData+isMarketClosed) ⇒
        * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
        * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
        * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
        * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
        * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
        * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
        * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
        * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
        * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
        * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
        * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
        * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
        * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒
    * _static_
        * [._getAllIndexPrices(_symbolToPerpStaticInfo, _priceFeedGetter)](#MarketData._getAllIndexPrices) ⇒
        * [._queryMidPrices(_proxyContract, _nestedPerpetualIDs, _symbolToPerpStaticInfo, _perpetualIdToSymbol, _idxPriceMap)](#MarketData._queryMidPrices) ⇒

<a name="new_MarketData_new"></a>

### new MarketData(config)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // MarketData (read only, no authentication needed)
  let mktData = new MarketData(config);
  // Create a proxy instance to access the blockchain
  await mktData.createProxyInstance();
}
main();
```
<a name="MarketData+createProxyInstance"></a>

### marketData.createProxyInstance(provider)
<p>Initialize the marketData-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="MarketData+getProxyAddress"></a>

### marketData.getProxyAddress() ⇒
<p>Get the proxy address</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Address of the perpetual proxy contract</p>  
<a name="MarketData+smartContractOrderToOrder"></a>

### marketData.smartContractOrderToOrder(smOrder) ⇒
<p>Convert the smart contract output of an order into a convenient format of type &quot;Order&quot;</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>more convenient format of order, type &quot;Order&quot;</p>  

| Param | Description |
| --- | --- |
| smOrder | <p>SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event</p> |

<a name="MarketData+getReadOnlyProxyInstance"></a>

### marketData.getReadOnlyProxyInstance() ⇒
<p>Get contract instance. Useful for event listening.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>read-only proxy instance</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get contract instance
  let proxy = await mktData.getReadOnlyProxyInstance();
  console.log(proxy);
}
main();
```
<a name="MarketData+exchangeInfo"></a>

### marketData.exchangeInfo() ⇒ [<code>ExchangeInfo</code>](#ExchangeInfo)
<p>Information about the products traded in the exchange.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: [<code>ExchangeInfo</code>](#ExchangeInfo) - <p>Array of static data for all the pools and perpetuals in the system.</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get exchange info
  let info = await mktData.exchangeInfo();
  console.log(info);
}
main();
```
<a name="MarketData+openOrders"></a>

### marketData.openOrders(traderAddr, symbol) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
<p>All open orders for a trader-address and a symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code> - <p>Array of open orders and corresponding order-ids.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the open orders.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get all open orders for a trader/symbol
  let opOrder = await mktData.openOrders("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "ETH-USD-MATIC");
  console.log(opOrder);
}
main();
```
<a name="MarketData+positionRisk"></a>

### marketData.positionRisk(traderAddr, symbol) ⇒ <code>MarginAccount</code>
<p>Information about the position open by a given trader in a given perpetual contract.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk of trader.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC. Can also be the perpetual id as string</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get position risk info
  let posRisk = await mktData.positionRisk("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "ETH-USD-MATIC");
  console.log(posRisk);
}
main();
```
<a name="MarketData+positionRiskOnTrade"></a>

### marketData.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if a given order is executed.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after trade</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| order | <p>Order to be submitted</p> |
| account | <p>Position risk before trade</p> |
| indexPriceInfo | <p>Index prices and market status (open/closed)</p> |

<a name="MarketData+positionRiskOnCollateralAction"></a>

### marketData.positionRiskOnCollateralAction(traderAddr, deltaCollateral, currentPositionRisk) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if given amount of collateral is added/removed from the account.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| deltaCollateral | <p>Amount of collateral to add or remove (signed)</p> |
| currentPositionRisk | <p>Position risk before</p> |

<a name="MarketData+getWalletBalance"></a>

### marketData.getWalletBalance(address, symbol) ⇒
<p>Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Balance</p>  

| Param | Description |
| --- | --- |
| address | <p>Address to check</p> |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

<a name="MarketData+getPoolShareTokenBalance"></a>

### marketData.getPoolShareTokenBalance(address, symbolOrId)
<p>Get the address' balance of the pool share token</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Description |
| --- | --- |
| address | <p>address of the liquidity provider</p> |
| symbolOrId | <p>Symbol of the form ETH-USD-MATIC, or MATIC (collateral only), or Pool-Id</p> |

<a name="MarketData+_getPoolShareTokenBalanceFromId"></a>

### marketData.\_getPoolShareTokenBalanceFromId(address, poolId) ⇒
<p>Query the pool share token holdings of address</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>pool share token balance of address</p>  

| Param | Description |
| --- | --- |
| address | <p>address of token holder</p> |
| poolId | <p>pool id</p> |

<a name="MarketData+getShareTokenPrice"></a>

### marketData.getShareTokenPrice(symbolOrId) ⇒
<p>Value of pool token in collateral currency</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>current pool share token price in collateral currency</p>  

| Param | Description |
| --- | --- |
| symbolOrId | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

<a name="MarketData+getParticipationValue"></a>

### marketData.getParticipationValue(address, symbolOrId) ⇒
<p>Value of the pool share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>the value (in collateral tokens) of the pool share, #share tokens, shareTokenAddress</p>  

| Param | Description |
| --- | --- |
| address | <p>address of liquidity provider</p> |
| symbolOrId | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get value of pool share token
  let shareToken = await md.getParticipationValue(myaddress, "MATIC");
  console.log(shareToken);
}
main();
```
<a name="MarketData+maxOrderSizeForTrader"></a>

### marketData.maxOrderSizeForTrader(side, positionRisk) ⇒
<p>Gets the maximal order size to open positions (increase size),
considering the existing position, state of the perpetual
Ignores users wallet balance.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Maximal trade size, not signed</p>  

| Param | Description |
| --- | --- |
| side | <p>BUY or SELL</p> |
| positionRisk | <p>Current position risk (as seen in positionRisk)</p> |

<a name="MarketData+maxSignedPosition"></a>

### marketData.maxSignedPosition(side, symbol) ⇒
**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>signed maximal position size in base currency</p>  

| Param | Description |
| --- | --- |
| side | <p>BUY_SIDE or SELL_SIDE</p> |
| symbol | <p>of the form ETH-USD-MATIC.</p> |

<a name="MarketData+getOraclePrice"></a>

### marketData.getOraclePrice(base, quote) ⇒ <code>number</code>
<p>Uses the Oracle(s) in the exchange to get the latest price of a given index in a given currency, if a route exists.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>Price of index in given currency.</p>  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>string</code> | <p>Index name, e.g. ETH.</p> |
| quote | <code>string</code> | <p>Quote currency, e.g. USD.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let price = await mktData.getOraclePrice("ETH", "USD");
  console.log(price);
}
main();
```
<a name="MarketData+getMarkPrice"></a>

### marketData.getMarkPrice(symbol) ⇒
<p>Get the current mark price</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>mark price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get mark price
  let price = await mktData.getMarkPrice("ETH-USD-MATIC");
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualPrice"></a>

### marketData.getPerpetualPrice(symbol, quantity) ⇒
<p>get the current price for a given quantity</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>price (number)</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |
| quantity | <p>quantity to be traded, negative if short</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual price
  let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualState"></a>

### marketData.getPerpetualState(symbol, indexPrices) ⇒
<p>Query recent perpetual state from blockchain</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>PerpetualState reference</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |
| indexPrices | <p>S2 and S3 prices/isMarketOpen if not provided fetch via REST API</p> |

<a name="MarketData+getPerpetualStaticInfo"></a>

### marketData.getPerpetualStaticInfo(symbol) ⇒
<p>Query perpetual static info.
This information is queried once at createProxyInstance-time and remains static after that.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>PerpetualStaticInfo copy.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="MarketData+getPerpetualMidPrice"></a>

### marketData.getPerpetualMidPrice(symbol) ⇒ <code>number</code>
<p>get the current mid-price for a perpetual</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual mid price
  let midPrice = await mktData.getPerpetualMidPrice("ETH-USD-MATIC");
  console.log(midPrice);
}
main();
```
<a name="MarketData+getAvailableMargin"></a>

### marketData.getAvailableMargin(traderAddr, symbol, indexPrices) ⇒
<p>Query the available margin conditional on the given (or current) index prices
Result is in collateral currency</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>available margin in collateral currency</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>address of the trader</p> |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |
| indexPrices | <p>optional index prices, will otherwise fetch from REST API</p> |

<a name="MarketData+getTraderLoyalityScore"></a>

### marketData.getTraderLoyalityScore(traderAddr, brokerAddr) ⇒
<p>Calculate a type of exchange loyality score based on trader volume</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>a loyality score (4 worst, 1 best)</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>address of the trader</p> |
| brokerAddr | <p>address of the trader's broker or undefined</p> |

<a name="MarketData+isMarketClosed"></a>

### marketData.isMarketClosed(symbol) ⇒
<p>Get market open/closed status</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>True if the market is closed</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Perpetual symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### marketData.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### marketData.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### marketData.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### marketData.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### marketData.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### marketData.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### marketData.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### marketData.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### marketData.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### marketData.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### marketData.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### marketData.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### marketData.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="MarketData._getAllIndexPrices"></a>

### MarketData.\_getAllIndexPrices(_symbolToPerpStaticInfo, _priceFeedGetter) ⇒
<p>Get all off-chain prices</p>

**Kind**: static method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>mapping of symbol-pair (e.g. BTC-USD) to price/isMarketClosed</p>  

| Param | Description |
| --- | --- |
| _symbolToPerpStaticInfo | <p>mapping: PerpetualStaticInfo for each perpetual</p> |
| _priceFeedGetter | <p>priceFeed class from which we can get offchain price data</p> |

<a name="MarketData._queryMidPrices"></a>

### MarketData.\_queryMidPrices(_proxyContract, _nestedPerpetualIDs, _symbolToPerpStaticInfo, _perpetualIdToSymbol, _idxPriceMap) ⇒
<p>Collect all mid-prices</p>

**Kind**: static method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>perpetual symbol to mid-prices mapping</p>  

| Param | Description |
| --- | --- |
| _proxyContract | <p>contract instance</p> |
| _nestedPerpetualIDs | <p>contains all perpetual ids for each pool</p> |
| _symbolToPerpStaticInfo | <p>maps symbol to static info</p> |
| _perpetualIdToSymbol | <p>maps perpetual id to symbol of the form BTC-USD-MATIC</p> |
| _idxPriceMap | <p>symbol to price/market closed</p> |

<a name="OrderReferrerTool"></a>

## OrderReferrerTool ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
<p>Functions to execute existing conditional orders from the limit order book. This class
requires a private key and executes smart-contract interactions that require
gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

* [OrderReferrerTool](#OrderReferrerTool) ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
    * [new OrderReferrerTool(config, privateKey)](#new_OrderReferrerTool_new)
    * [.executeOrder(symbol, orderId, [referrerAddr], [nonce], [submission])](#OrderReferrerTool+executeOrder) ⇒
    * [.getAllOpenOrders(symbol)](#OrderReferrerTool+getAllOpenOrders) ⇒
    * [.numberOfOpenOrders(symbol)](#OrderReferrerTool+numberOfOpenOrders) ⇒ <code>number</code>
    * [.getOrderById(symbol, digest)](#OrderReferrerTool+getOrderById) ⇒
    * [.pollLimitOrders(symbol, numElements, [startAfter])](#OrderReferrerTool+pollLimitOrders) ⇒
    * [.isTradeable(order, indexPrices)](#OrderReferrerTool+isTradeable) ⇒
    * [.isTradeableBatch(orders, indexPrice)](#OrderReferrerTool+isTradeableBatch) ⇒
    * [._isTradeable(order, tradePrice, markPrice, blockTimestamp, symbolToPerpInfoMap)](#OrderReferrerTool+_isTradeable) ⇒
    * [.smartContractOrderToOrder(scOrder)](#OrderReferrerTool+smartContractOrderToOrder) ⇒
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_OrderReferrerTool_new"></a>

### new OrderReferrerTool(config, privateKey)
<p>Constructor.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of the wallet that executes the conditional orders.</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // load configuration for testnet
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  // OrderReferrerTool (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  // Create a proxy instance to access the blockchain
  await orderTool.createProxyInstance();
}
main();
```
<a name="OrderReferrerTool+executeOrder"></a>

### orderReferrerTool.executeOrder(symbol, orderId, [referrerAddr], [nonce], [submission]) ⇒
<p>Executes an order by symbol and ID. This action interacts with the blockchain and incurs gas costs.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be executed.</p> |
| [referrerAddr] | <code>string</code> | <p>optional address of the wallet to be credited for executing the order, if different from the one submitting this transaction.</p> |
| [nonce] | <code>number</code> | <p>optional nonce</p> |
| [submission] | <code>PriceFeedSubmission</code> | <p>optional signed prices obtained via PriceFeeds::fetchLatestFeedPriceInfoForPerpetual</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler, Order } from "@d8x/perpetuals-sdk";
async function main() {
  console.log(OrderReferrerTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  const symbol = "ETH-USD-MATIC";
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get some open orders
  const maxOrdersToGet = 5;
  let [orders, ids]: [Order[], string[]] = await orderTool.pollLimitOrders(symbol, maxOrdersToGet);
  console.log(`Got ${ids.length} orders`);
  for (let k = 0; k < ids.length; k++) {
    // check whether order meets conditions
    let doExecute = await orderTool.isTradeable(orders[k]);
    if (doExecute) {
      // execute
      let tx = await orderTool.executeOrder(symbol, ids[k]);
      console.log(`Sent order id ${ids[k]} for execution, tx hash = ${tx.hash}`);
    }
  }
}
main();
```
<a name="OrderReferrerTool+getAllOpenOrders"></a>

### orderReferrerTool.getAllOpenOrders(symbol) ⇒
<p>All the orders in the order book for a given symbol that are currently open.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>Array with all open orders and their IDs.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let openOrders = await orderTool.getAllOpenOrders("ETH-USD-MATIC");
  console.log(openOrders);
}
main();
```
<a name="OrderReferrerTool+numberOfOpenOrders"></a>

### orderReferrerTool.numberOfOpenOrders(symbol) ⇒ <code>number</code>
<p>Total number of limit orders for this symbol, excluding those that have been cancelled/removed.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <code>number</code> - <p>Number of open orders.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let numberOfOrders = await orderTool.numberOfOpenOrders("ETH-USD-MATIC");
  console.log(numberOfOrders);
}
main();
```
<a name="OrderReferrerTool+getOrderById"></a>

### orderReferrerTool.getOrderById(symbol, digest) ⇒
<p>Get order from the digest (=id)</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>order or undefined</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of order book, e.g. ETH-USD-MATIC</p> |
| digest | <p>digest of the order (=order ID)</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get order by ID
  let myorder = await orderTool.getOrderById("MATIC-USD-MATIC",
      "0x0091a1d878491479afd09448966c1403e9d8753122e25260d3b2b9688d946eae");
  console.log(myorder);
}
main();
```
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

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let activeOrders = await orderTool.pollLimitOrders("ETH-USD-MATIC", 2);
  console.log(activeOrders);
}
main();
```
<a name="OrderReferrerTool+isTradeable"></a>

### orderReferrerTool.isTradeable(order, indexPrices) ⇒
<p>Check if a conditional order can be executed</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>true if order can be executed for the current state of the perpetuals</p>  

| Param | Description |
| --- | --- |
| order | <p>order structure</p> |
| indexPrices | <p>pair of index prices S2 and S3. S3 set to zero if not required. If undefined the function will fetch the latest prices from the REST API</p> |

**Example**  
```js
import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderReferrerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderReferrerTool(config, pk);
  await orderTool.createProxyInstance();
  // check if tradeable
  let openOrders = await orderTool.getAllOpenOrders("MATIC-USD-MATIC");
  let check = await orderTool.isTradeable(openOrders[0][0]);
  console.log(check);
}
main();
```
<a name="OrderReferrerTool+isTradeableBatch"></a>

### orderReferrerTool.isTradeableBatch(orders, indexPrice) ⇒
<p>Check for a batch of orders on the same perpetual whether they can be traded</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>array of tradeable boolean</p>  

| Param | Description |
| --- | --- |
| orders | <p>orders belonging to 1 perpetual</p> |
| indexPrice | <p>S2,S3-index prices for the given perpetual. Will fetch prices from REST API if not defined.</p> |

<a name="OrderReferrerTool+_isTradeable"></a>

### orderReferrerTool.\_isTradeable(order, tradePrice, markPrice, blockTimestamp, symbolToPerpInfoMap) ⇒
<p>Can the order be executed?</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>true if trading conditions met, false otherwise</p>  

| Param | Description |
| --- | --- |
| order | <p>order struct</p> |
| tradePrice | <p>&quot;preview&quot; price of this order</p> |
| markPrice | <p>current mark price</p> |
| blockTimestamp | <p>last observed block timestamp (hence already in past)</p> |
| symbolToPerpInfoMap | <p>metadata</p> |

<a name="OrderReferrerTool+smartContractOrderToOrder"></a>

### orderReferrerTool.smartContractOrderToOrder(scOrder) ⇒
<p>Wrapper of static method to use after mappings have been loaded into memory.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Returns**: <p>A user-friendly order struct.</p>  

| Param | Description |
| --- | --- |
| scOrder | <p>Perpetual order as received in the proxy events.</p> |

<a name="WriteAccessHandler+createProxyInstance"></a>

### orderReferrerTool.createProxyInstance(provider)
<p>Initialize the writeAccessHandler-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>createProxyInstance</code>](#WriteAccessHandler+createProxyInstance)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="WriteAccessHandler+setAllowance"></a>

### orderReferrerTool.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>setAllowance</code>](#WriteAccessHandler+setAllowance)  
**Returns**: <p>ContractTransaction</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

<a name="WriteAccessHandler+getAddress"></a>

### orderReferrerTool.getAddress() ⇒ <code>string</code>
<p>Address corresponding to the private key used to instantiate this class.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getAddress</code>](#WriteAccessHandler+getAddress)  
**Returns**: <code>string</code> - <p>Address of this wallet.</p>  
<a name="WriteAccessHandler+swapForMockToken"></a>

### orderReferrerTool.swapForMockToken(symbol, amountToPay) ⇒
<p>Converts a given amount of chain native currency (test MATIC)
into a mock token used for trading on testnet, with a rate of 1:100_000</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>swapForMockToken</code>](#WriteAccessHandler+swapForMockToken)  
**Returns**: <p>Transaction object</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Pool margin token e.g. MATIC</p> |
| amountToPay | <p>Amount in chain currency, e.g. &quot;0.1&quot; for 0.1 MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### orderReferrerTool.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### orderReferrerTool.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### orderReferrerTool.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### orderReferrerTool.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### orderReferrerTool.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### orderReferrerTool.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### orderReferrerTool.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### orderReferrerTool.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### orderReferrerTool.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### orderReferrerTool.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### orderReferrerTool.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### orderReferrerTool.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### orderReferrerTool.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>OrderReferrerTool</code>](#OrderReferrerTool)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="PerpetualDataHandler"></a>

## PerpetualDataHandler
<p>Parent class for MarketData and WriteAccessHandler that handles
common data and chain operations.</p>

**Kind**: global class  

* [PerpetualDataHandler](#PerpetualDataHandler)
    * _instance_
        * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
        * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
        * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
        * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
        * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
        * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
        * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
        * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
        * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
        * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
        * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
        * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
        * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒
    * _static_
        * [.getPerpetualStaticInfo(_proxyContract, nestedPerpetualIDs, symbolList)](#PerpetualDataHandler.getPerpetualStaticInfo) ⇒
        * [.nestedIDsToChunks(chunkSize, nestedIDs)](#PerpetualDataHandler.nestedIDsToChunks) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
        * [._calculateLiquidationPrice(symbol, traderState, S2, symbolToPerpStaticInfo)](#PerpetualDataHandler._calculateLiquidationPrice) ⇒
        * [.symbolToPerpetualId(symbol, symbolToPerpStaticInfo)](#PerpetualDataHandler.symbolToPerpetualId) ⇒
        * [.toSmartContractOrder(order, traderAddr, symbolToPerpetualMap)](#PerpetualDataHandler.toSmartContractOrder) ⇒
        * [.fromSmartContratOrderToClientOrder(scOrder, parentChildIds)](#PerpetualDataHandler.fromSmartContratOrderToClientOrder) ⇒
        * [.toClientOrder(order, parentChildIds)](#PerpetualDataHandler.toClientOrder) ⇒
        * [.fromClientOrder(obOrder)](#PerpetualDataHandler.fromClientOrder) ⇒
        * [._orderTypeToFlag(order)](#PerpetualDataHandler._orderTypeToFlag) ⇒
        * [.readSDKConfig(configNameOrfileLocation, version)](#PerpetualDataHandler.readSDKConfig) ⇒
        * [.getConfigByName(name, version)](#PerpetualDataHandler.getConfigByName) ⇒
        * [.getConfigByLocation(filename, version)](#PerpetualDataHandler.getConfigByLocation) ⇒
        * [.getConfigByChainId(chainId, version)](#PerpetualDataHandler.getConfigByChainId) ⇒
        * [._getABIFromContract(contract, functionName)](#PerpetualDataHandler._getABIFromContract) ⇒
        * [.checkOrder(order, traderAccount, perpStaticInfo)](#PerpetualDataHandler.checkOrder)

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
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### perpetualDataHandler.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### perpetualDataHandler.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### perpetualDataHandler.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### perpetualDataHandler.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### perpetualDataHandler.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### perpetualDataHandler.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### perpetualDataHandler.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### perpetualDataHandler.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### perpetualDataHandler.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### perpetualDataHandler.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### perpetualDataHandler.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="PerpetualDataHandler.getPerpetualStaticInfo"></a>

### PerpetualDataHandler.getPerpetualStaticInfo(_proxyContract, nestedPerpetualIDs, symbolList) ⇒
<p>Collect all perpetuals static info</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>array with PerpetualStaticInfo for each perpetual</p>  

| Param | Type | Description |
| --- | --- | --- |
| _proxyContract | <code>ethers.Contract</code> | <p>perpetuals contract with getter</p> |
| nestedPerpetualIDs | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | <p>perpetual id-array for each pool</p> |
| symbolList | <code>Map.&lt;string, string&gt;</code> | <p>mapping of symbols to convert long-format &lt;-&gt; blockchain-format</p> |

<a name="PerpetualDataHandler.nestedIDsToChunks"></a>

### PerpetualDataHandler.nestedIDsToChunks(chunkSize, nestedIDs) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
<p>Breaks up an array of nested arrays into chunks of a specified size.</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - <p>An array of subarrays, each containing <code>chunkSize</code> or fewer elements from <code>nestedIDs</code>.</p>  

| Param | Type | Description |
| --- | --- | --- |
| chunkSize | <code>number</code> | <p>The size of each chunk.</p> |
| nestedIDs | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | <p>The array of nested arrays to chunk.</p> |

<a name="PerpetualDataHandler._calculateLiquidationPrice"></a>

### PerpetualDataHandler.\_calculateLiquidationPrice(symbol, traderState, S2, symbolToPerpStaticInfo) ⇒
<p>Liquidation price</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>liquidation mark-price, corresponding collateral/quote conversion</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form BTC-USD-MATIC</p> |
| traderState | <p>BigInt array according to smart contract</p> |
| S2 | <p>number, index price S2</p> |
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
| symbol | <p>symbol (e.g., BTC-USD-MATC)</p> |
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

<a name="PerpetualDataHandler.fromSmartContratOrderToClientOrder"></a>

### PerpetualDataHandler.fromSmartContratOrderToClientOrder(scOrder, parentChildIds) ⇒
<p>Converts a smart contract order to a client order</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>Client order that can be submitted to the corresponding LOB</p>  

| Param | Description |
| --- | --- |
| scOrder | <p>Smart contract order</p> |
| parentChildIds | <p>Optional parent-child dependency</p> |

<a name="PerpetualDataHandler.toClientOrder"></a>

### PerpetualDataHandler.toClientOrder(order, parentChildIds) ⇒
<p>Converts a user-friendly order to a client order</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>Client order that can be submitted to the corresponding LOB</p>  

| Param | Description |
| --- | --- |
| order | <p>Order</p> |
| parentChildIds | <p>Optional parent-child dependency</p> |

<a name="PerpetualDataHandler.fromClientOrder"></a>

### PerpetualDataHandler.fromClientOrder(obOrder) ⇒
<p>Converts an order as stored in the LOB smart contract into a user-friendly order type</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>User friendly order struct</p>  

| Param | Description |
| --- | --- |
| obOrder | <p>Order-book contract order type</p> |

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

### PerpetualDataHandler.readSDKConfig(configNameOrfileLocation, version) ⇒
<p>Get NodeSDKConfig from a chain ID, known config name, or custom file location..</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>NodeSDKConfig</p>  

| Param | Description |
| --- | --- |
| configNameOrfileLocation | <p>Name of a known default config, or chain ID, or json-file with required variables for config</p> |
| version | <p>Config version number. Defaults to highest version if name or chain ID are not unique</p> |

<a name="PerpetualDataHandler.getConfigByName"></a>

### PerpetualDataHandler.getConfigByName(name, version) ⇒
<p>Get a NodeSDKConfig from its name</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>NodeSDKConfig</p>  

| Param | Description |
| --- | --- |
| name | <p>Name of the known config</p> |
| version | <p>Version of the config. Defaults to highest available.</p> |

<a name="PerpetualDataHandler.getConfigByLocation"></a>

### PerpetualDataHandler.getConfigByLocation(filename, version) ⇒
<p>Get a NodeSDKConfig from a json file.</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>NodeSDKConfig</p>  

| Param | Description |
| --- | --- |
| filename | <p>Location of the file</p> |
| version | <p>Version of the config. Defaults to highest available.</p> |

<a name="PerpetualDataHandler.getConfigByChainId"></a>

### PerpetualDataHandler.getConfigByChainId(chainId, version) ⇒
<p>Get a NodeSDKConfig from its chain Id</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>NodeSDKConfig</p>  

| Param | Description |
| --- | --- |
| chainId | <p>Chain Id</p> |
| version | <p>Version of the config. Defaults to highest available.</p> |

<a name="PerpetualDataHandler._getABIFromContract"></a>

### PerpetualDataHandler.\_getABIFromContract(contract, functionName) ⇒
<p>Get the ABI of a function in a given contract</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>Function ABI as a single JSON string</p>  

| Param | Description |
| --- | --- |
| contract | <p>A contract instance, e.g. this.proxyContract</p> |
| functionName | <p>Name of the function whose ABI we want</p> |

<a name="PerpetualDataHandler.checkOrder"></a>

### PerpetualDataHandler.checkOrder(order, traderAccount, perpStaticInfo)
<p>Performs basic validity checks on a given order</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  

| Param | Description |
| --- | --- |
| order | <p>Order struct</p> |
| traderAccount | <p>Trader account</p> |
| perpStaticInfo | <p>Symbol to perpetual info map</p> |

<a name="PerpetualEventHandler"></a>

## PerpetualEventHandler
<p>This class handles events and stores relevant variables
as member variables. The events change the state of the member variables:
mktData : MarketData relevant market data with current state (e.g. index price)
ordersInPerpetual: Map&lt;number, OrderStruct&gt; all open orders for the given trader
positionInPerpetual: Map&lt;number, MarginAccount&gt; all open positions for the given trader</p>
<p>Get data:</p>
<ul>
<li>getPerpetualData(perp id (string) or symbol) : PerpetualState. This is a reference!</li>
<li>getExchangeInfo() : ExchangeInfo. This is a reference!</li>
<li>getCurrentPositionRisk(perp id (string) or symbol) : MarginAccount. This is a reference!</li>
<li>getOrdersInPerpetualMap : Map&lt;number, OrderStruct&gt;. This is a reference!</li>
<li>getpositionInPerpetualMap : Map&lt;number, MarginAccount&gt;. This is a reference!</li>
</ul>
<p>Construct with a trader address and a marketData object
Initialize to gather all the relevant data.
Send event variables to event handler &quot;on<EventName>&quot; - this updates members</p>
<ul>
<li>[x] onUpdateMarkPrice              : emitted on proxy; updates markprice and index price data</li>
<li>[x] onUpdateUpdateFundingRate      : emitted on proxy; sets funding rate</li>
<li>[x] onExecutionFailed              : emitted on order book; removes an open order</li>
<li>[x] onPerpetualLimitOrderCancelled : emitted on order book; removes an open order</li>
<li>[x] onPerpetualLimitOrderCreated   : emitted on order book; adds an open order to the data</li>
<li>[x] async onUpdateMarginAccount    : emitted on proxy; updates position data and open interest</li>
<li>[x] onTrade                        : emitted on proxy; returns TradeEvent to be displayed</li>
</ul>

**Kind**: global class  

* [PerpetualEventHandler](#PerpetualEventHandler)
    * _instance_
        * [.initialize()](#PerpetualEventHandler+initialize)
        * [.getExchangeInfo()](#PerpetualEventHandler+getExchangeInfo) ⇒
        * [.getOrdersInPerpetualMap()](#PerpetualEventHandler+getOrdersInPerpetualMap) ⇒
        * [.getpositionInPerpetualMap()](#PerpetualEventHandler+getpositionInPerpetualMap) ⇒
        * [.getPerpetualData(perpetualIdOrSymbol)](#PerpetualEventHandler+getPerpetualData) ⇒
        * [.getCurrentPositionRisk(perpetualIdOrSymbol)](#PerpetualEventHandler+getCurrentPositionRisk) ⇒
        * [.updatePrices(perpetualIdOrSymbol)](#PerpetualEventHandler+updatePrices)
        * [.onUpdateMarkPrice(perpetualId, fMarkPricePremium, fSpotIndexPrice)](#PerpetualEventHandler+onUpdateMarkPrice) ⇒
        * [.onUpdateUpdateFundingRate(fFundingRate)](#PerpetualEventHandler+onUpdateUpdateFundingRate)
        * [.onExecutionFailed(perpetualId, trader, digest, reason)](#PerpetualEventHandler+onExecutionFailed)
        * [.onPerpetualLimitOrderCancelled(orderId)](#PerpetualEventHandler+onPerpetualLimitOrderCancelled)
        * [.onPerpetualLimitOrderCreated(perpetualId, trader, referrerAddr, brokerAddr, Order, digest)](#PerpetualEventHandler+onPerpetualLimitOrderCreated)
        * [.onUpdateMarginAccount(perpetualId, trader, positionId, fPositionBC, fCashCC, fLockedInValueQC, fFundingPaymentCC, fOpenInterestBC)](#PerpetualEventHandler+onUpdateMarginAccount)
        * [.onTrade(perpetualId, trader, positionId, order, orderDigest, newPositionSizeBC, price)](#PerpetualEventHandler+onTrade) ⇒
    * _static_
        * [.findOrderForId(orderId, orderMap)](#PerpetualEventHandler.findOrderForId) ⇒
        * [.deleteOrder(orderStructs, orderId)](#PerpetualEventHandler.deleteOrder) ⇒
        * [.ConvertUpdateMarkPrice(fMarkPricePremium, fSpotIndexPrice)](#PerpetualEventHandler.ConvertUpdateMarkPrice) ⇒

<a name="PerpetualEventHandler+initialize"></a>

### perpetualEventHandler.initialize()
<p>Call this async function to initialize the
market data</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
<a name="PerpetualEventHandler+getExchangeInfo"></a>

### perpetualEventHandler.getExchangeInfo() ⇒
<p>Get the current exchange info</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>exchange info</p>  
<a name="PerpetualEventHandler+getOrdersInPerpetualMap"></a>

### perpetualEventHandler.getOrdersInPerpetualMap() ⇒
<p>getOrdersInPerpetualMap</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>this.ordersInPerpetual</p>  
<a name="PerpetualEventHandler+getpositionInPerpetualMap"></a>

### perpetualEventHandler.getpositionInPerpetualMap() ⇒
<p>getpositionInPerpetualMap</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>this.positionInPerpetual</p>  
<a name="PerpetualEventHandler+getPerpetualData"></a>

### perpetualEventHandler.getPerpetualData(perpetualIdOrSymbol) ⇒
<p>Get the data for a perpetual with a given index</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>perpetual data for this idx</p>  

| Param | Description |
| --- | --- |
| perpetualIdOrSymbol | <p>perpetual idx as string or symbol for which we want the data</p> |

<a name="PerpetualEventHandler+getCurrentPositionRisk"></a>

### perpetualEventHandler.getCurrentPositionRisk(perpetualIdOrSymbol) ⇒
<p>Get the trader's current position risk (margin account data)</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>undefined if no position or margin account (='position risk')</p>  

| Param | Description |
| --- | --- |
| perpetualIdOrSymbol | <p>perpetual id as string ('100003') or symbol ('BTC-USD-MATIC')</p> |

<a name="PerpetualEventHandler+updatePrices"></a>

### perpetualEventHandler.updatePrices(perpetualIdOrSymbol)
<p>Update the following prices:</p>
<ul>
<li>index price</li>
<li>collateral price</li>
<li>mid-price</li>
</ul>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  

| Param | Description |
| --- | --- |
| perpetualIdOrSymbol | <p>perpetual id as string ('100003') or symbol ('BTC-USD-MATIC')</p> |

<a name="PerpetualEventHandler+onUpdateMarkPrice"></a>

### perpetualEventHandler.onUpdateMarkPrice(perpetualId, fMarkPricePremium, fSpotIndexPrice) ⇒
<p>Handle the event UpdateMarkPrice and update relevant
data</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>void</p>  

| Param | Description |
| --- | --- |
| perpetualId | <p>perpetual Id</p> |
| fMarkPricePremium | <p>premium rate in ABDK format</p> |
| fSpotIndexPrice | <p>spot index price in ABDK format</p> |

<a name="PerpetualEventHandler+onUpdateUpdateFundingRate"></a>

### perpetualEventHandler.onUpdateUpdateFundingRate(fFundingRate)
<p>Handle the event UpdateFundingRate and update relevant
data
UpdateFundingRate(uint24 indexed perpetualId, int128 fFundingRate)</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  

| Param | Description |
| --- | --- |
| fFundingRate | <p>funding rate in ABDK format</p> |

<a name="PerpetualEventHandler+onExecutionFailed"></a>

### perpetualEventHandler.onExecutionFailed(perpetualId, trader, digest, reason)
<p>event ExecutionFailed(
uint24 indexed perpetualId,
address indexed trader,
bytes32 digest,
string reason
);</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  

| Param | Description |
| --- | --- |
| perpetualId | <p>id of the perpetual</p> |
| trader | <p>address of the trader</p> |
| digest | <p>digest of the order/cancel order</p> |
| reason | <p>reason why the execution failed</p> |

<a name="PerpetualEventHandler+onPerpetualLimitOrderCancelled"></a>

### perpetualEventHandler.onPerpetualLimitOrderCancelled(orderId)
<p>Event emitted by perpetual proxy
event PerpetualLimitOrderCancelled(bytes32 indexed orderHash);</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  

| Param | Description |
| --- | --- |
| orderId | <p>string order id/digest</p> |

<a name="PerpetualEventHandler+onPerpetualLimitOrderCreated"></a>

### perpetualEventHandler.onPerpetualLimitOrderCreated(perpetualId, trader, referrerAddr, brokerAddr, Order, digest)
<p>event PerpetualLimitOrderCreated(
uint24 indexed perpetualId,
address indexed trader,
address referrerAddr,
address brokerAddr,
Order order,
bytes32 digest
)</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  

| Param | Description |
| --- | --- |
| perpetualId | <p>id of the perpetual</p> |
| trader | <p>address of the trader</p> |
| referrerAddr | <p>address of the referrer</p> |
| brokerAddr | <p>address of the broker</p> |
| Order | <p>order struct</p> |
| digest | <p>order id</p> |

<a name="PerpetualEventHandler+onUpdateMarginAccount"></a>

### perpetualEventHandler.onUpdateMarginAccount(perpetualId, trader, positionId, fPositionBC, fCashCC, fLockedInValueQC, fFundingPaymentCC, fOpenInterestBC)
<p>This function is async -&gt; queries the margin account</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  

| Param | Description |
| --- | --- |
| perpetualId | <p>id of the perpetual</p> |
| trader | <p>trader address</p> |
| positionId | <p>position id</p> |
| fPositionBC | <p>position size in base currency</p> |
| fCashCC | <p>margin collateral in margin account</p> |
| fLockedInValueQC | <p>pos*average opening price</p> |
| fFundingPaymentCC | <p>funding payment made</p> |
| fOpenInterestBC | <p>open interest</p> |

<a name="PerpetualEventHandler+onTrade"></a>

### perpetualEventHandler.onTrade(perpetualId, trader, positionId, order, orderDigest, newPositionSizeBC, price) ⇒
**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>trade event data in regular number format</p>  

| Param | Description |
| --- | --- |
| perpetualId | <p>perpetual id</p> |
| trader | <p>trader address</p> |
| positionId | <p>position id</p> |
| order | <p>order struct</p> |
| orderDigest | <p>order id</p> |
| newPositionSizeBC | <p>new pos size in base currency ABDK</p> |
| price | <p>price in ABDK format</p> |

<a name="PerpetualEventHandler.findOrderForId"></a>

### PerpetualEventHandler.findOrderForId(orderId, orderMap) ⇒
<p>static function to find the number of the  OrderStruct with given orderId</p>

**Kind**: static method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>id of perpetual that contains order with id = orderId or undefined</p>  

| Param | Description |
| --- | --- |
| orderId | <p>id/digest of order</p> |
| orderMap | <p>mapping for perpetualId-&gt;OrderStruct</p> |

<a name="PerpetualEventHandler.deleteOrder"></a>

### PerpetualEventHandler.deleteOrder(orderStructs, orderId) ⇒
<p>Delete the order with given id from the class member data</p>

**Kind**: static method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>void</p>  

| Param | Description |
| --- | --- |
| orderStructs | <p>array of order struct as stored for the trader and a given perpetual</p> |
| orderId | <p>digest/order id</p> |

<a name="PerpetualEventHandler.ConvertUpdateMarkPrice"></a>

### PerpetualEventHandler.ConvertUpdateMarkPrice(fMarkPricePremium, fSpotIndexPrice) ⇒
<p>UpdateMarkPrice(
uint24 indexed perpetualId,
int128 fMarkPricePremium,
int128 fSpotIndexPrice
)</p>

**Kind**: static method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  
**Returns**: <p>mark price and spot index in float</p>  

| Param | Description |
| --- | --- |
| fMarkPricePremium | <p>premium rate in ABDK format</p> |
| fSpotIndexPrice | <p>spot index price in ABDK format</p> |

<a name="PriceFeeds"></a>

## PriceFeeds
<p>This class communicates with the REST API that provides price-data that is
to be submitted to the smart contracts for certain functions such as
trader liquidations, trade executions, change of trader margin amount.</p>

**Kind**: global class  

* [PriceFeeds](#PriceFeeds)
    * _instance_
        * [.initializeTriangulations(symbols)](#PriceFeeds+initializeTriangulations)
        * [.fetchFeedPriceInfoAndIndicesForPerpetual(symbol)](#PriceFeeds+fetchFeedPriceInfoAndIndicesForPerpetual) ⇒
        * [.fetchPrices()](#PriceFeeds+fetchPrices) ⇒
        * [.fetchPricesForPerpetual(symbol)](#PriceFeeds+fetchPricesForPerpetual) ⇒
        * [.fetchFeedPrices(symbols)](#PriceFeeds+fetchFeedPrices) ⇒
        * [.fetchAllFeedPrices()](#PriceFeeds+fetchAllFeedPrices) ⇒
        * [.fetchLatestFeedPriceInfoForPerpetual(symbol)](#PriceFeeds+fetchLatestFeedPriceInfoForPerpetual) ⇒
        * [.calculateTriangulatedPricesFromFeedInfo(symbols, feeds)](#PriceFeeds+calculateTriangulatedPricesFromFeedInfo) ⇒
        * [.triangulatePricesFromFeedPrices(symbols, feeds)](#PriceFeeds+triangulatePricesFromFeedPrices) ⇒
        * [.fetchVAAQuery(query)](#PriceFeeds+fetchVAAQuery) ⇒
        * [.fetchPriceQuery(query)](#PriceFeeds+fetchPriceQuery) ⇒
    * _static_
        * [._selectConfig(configs, network)](#PriceFeeds._selectConfig) ⇒
        * [._constructFeedInfo(config)](#PriceFeeds._constructFeedInfo) ⇒

<a name="PriceFeeds+initializeTriangulations"></a>

### priceFeeds.initializeTriangulations(symbols)
<p>Pre-processing of triangulations for symbols, given the price feeds</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  

| Param | Description |
| --- | --- |
| symbols | <p>set of symbols we want to triangulate from price feeds</p> |

<a name="PriceFeeds+fetchFeedPriceInfoAndIndicesForPerpetual"></a>

### priceFeeds.fetchFeedPriceInfoAndIndicesForPerpetual(symbol) ⇒
<p>Get required information to be able to submit a blockchain transaction with price-update
such as trade execution, liquidation</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>PriceFeedSubmission, index prices, market closed information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of perpetual, e.g., BTC-USD-MATIC</p> |

<a name="PriceFeeds+fetchPrices"></a>

### priceFeeds.fetchPrices() ⇒
<p>Get all prices/isMarketClosed for the provided symbols via
&quot;latest_price_feeds&quot; and triangulation. Triangulation must be defined in config, unless
it is a direct price feed.</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>map of feed-price symbol to price/isMarketClosed</p>  
<a name="PriceFeeds+fetchPricesForPerpetual"></a>

### priceFeeds.fetchPricesForPerpetual(symbol) ⇒
<p>Get index prices and market closed information for the given perpetual</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>Index prices and market closed information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol such as ETH-USD-MATIC</p> |

<a name="PriceFeeds+fetchFeedPrices"></a>

### priceFeeds.fetchFeedPrices(symbols) ⇒
<p>Fetch the provided feed prices and bool whether market is closed or open</p>
<ul>
<li>requires the feeds to be defined in priceFeedConfig.json</li>
<li>if undefined, all feeds are queried</li>
</ul>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>mapping symbol-&gt; [price, isMarketClosed]</p>  

| Param | Description |
| --- | --- |
| symbols | <p>array of feed-price symbols (e.g., [btc-usd, eth-usd]) or undefined</p> |

<a name="PriceFeeds+fetchAllFeedPrices"></a>

### priceFeeds.fetchAllFeedPrices() ⇒
<p>Get all configured feed prices via &quot;latest_price_feeds&quot;</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>map of feed-price symbol to price/isMarketClosed</p>  
<a name="PriceFeeds+fetchLatestFeedPriceInfoForPerpetual"></a>

### priceFeeds.fetchLatestFeedPriceInfoForPerpetual(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PriceFeeds+calculateTriangulatedPricesFromFeedInfo"></a>

### priceFeeds.calculateTriangulatedPricesFromFeedInfo(symbols, feeds) ⇒
<p>Extract pair-prices from underlying price feeds via triangulation
The function either needs a direct price feed or a defined triangulation to succesfully
return a triangulated price</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>array of prices with same order as symbols</p>  

| Param | Description |
| --- | --- |
| symbols | <p>array of pairs for which we want prices, e.g., [BTC-USDC, ETH-USD]</p> |
| feeds | <p>data obtained via fetchLatestFeedPriceInfo or fetchLatestFeedPrices</p> |

<a name="PriceFeeds+triangulatePricesFromFeedPrices"></a>

### priceFeeds.triangulatePricesFromFeedPrices(symbols, feeds) ⇒
<p>Extract pair-prices from underlying price feeds via triangulation
The function either needs a direct price feed or a defined triangulation to succesfully
return a triangulated price</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>array of prices with same order as symbols</p>  

| Param | Description |
| --- | --- |
| symbols | <p>array of pairs for which we want prices, e.g., [BTC-USDC, ETH-USD]</p> |
| feeds | <p>data obtained via fetchLatestFeedPriceInfo or fetchLatestFeedPrices</p> |

<a name="PriceFeeds+fetchVAAQuery"></a>

### priceFeeds.fetchVAAQuery(query) ⇒
<p>Queries the REST endpoint and returns parsed VAA price data</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>vaa and price info</p>  

| Param | Description |
| --- | --- |
| query | <p>query price-info from endpoint</p> |

<a name="PriceFeeds+fetchPriceQuery"></a>

### priceFeeds.fetchPriceQuery(query) ⇒
<p>Queries the REST endpoint and returns parsed price data</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>vaa and price info</p>  

| Param | Description |
| --- | --- |
| query | <p>query price-info from endpoint</p> |

<a name="PriceFeeds._selectConfig"></a>

### PriceFeeds.\_selectConfig(configs, network) ⇒
<p>Searches for configuration for given network</p>

**Kind**: static method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>selected configuration</p>  

| Param | Description |
| --- | --- |
| configs | <p>pricefeed configuration from json</p> |
| network | <p>e.g. testnet</p> |

<a name="PriceFeeds._constructFeedInfo"></a>

### PriceFeeds.\_constructFeedInfo(config) ⇒
<p>Wraps configuration into convenient data-structure</p>

**Kind**: static method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>feedInfo-map and endPoints-array</p>  

| Param | Description |
| --- | --- |
| config | <p>configuration for the selected network</p> |

<a name="TraderInterface"></a>

## TraderInterface ⇐ [<code>MarketData</code>](#MarketData)
<p>Interface that can be used by front-end that wraps all private functions
so that signatures can be handled in frontend via wallet</p>

**Kind**: global class  
**Extends**: [<code>MarketData</code>](#MarketData)  

* [TraderInterface](#TraderInterface) ⇐ [<code>MarketData</code>](#MarketData)
    * [new TraderInterface(config)](#new_TraderInterface_new)
    * [.queryExchangeFee(poolSymbolName, traderAddr, brokerAddr)](#TraderInterface+queryExchangeFee) ⇒
    * [.getCurrentTraderVolume(poolSymbolName, traderAddr)](#TraderInterface+getCurrentTraderVolume) ⇒
    * [.cancelOrderDigest(symbol, orderId)](#TraderInterface+cancelOrderDigest) ⇒
    * [.getOrderBookAddress(symbol)](#TraderInterface+getOrderBookAddress) ⇒
    * [.createSmartContractOrder(order, traderAddr)](#TraderInterface+createSmartContractOrder) ⇒
    * [.orderDigest(scOrder)](#TraderInterface+orderDigest) ⇒
    * [.getProxyABI(method)](#TraderInterface+getProxyABI) ⇒
    * [.getOrderBookABI(symbol, method)](#TraderInterface+getOrderBookABI) ⇒
    * [.createProxyInstance(provider)](#MarketData+createProxyInstance)
    * [.getProxyAddress()](#MarketData+getProxyAddress) ⇒
    * [.smartContractOrderToOrder(smOrder)](#MarketData+smartContractOrderToOrder) ⇒
    * [.getReadOnlyProxyInstance()](#MarketData+getReadOnlyProxyInstance) ⇒
    * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ [<code>ExchangeInfo</code>](#ExchangeInfo)
    * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
    * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>MarginAccount</code>
    * [.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo)](#MarketData+positionRiskOnTrade) ⇒ <code>MarginAccount</code>
    * [.positionRiskOnCollateralAction(traderAddr, deltaCollateral, currentPositionRisk)](#MarketData+positionRiskOnCollateralAction) ⇒ <code>MarginAccount</code>
    * [.getWalletBalance(address, symbol)](#MarketData+getWalletBalance) ⇒
    * [.getPoolShareTokenBalance(address, symbolOrId)](#MarketData+getPoolShareTokenBalance)
    * [._getPoolShareTokenBalanceFromId(address, poolId)](#MarketData+_getPoolShareTokenBalanceFromId) ⇒
    * [.getShareTokenPrice(symbolOrId)](#MarketData+getShareTokenPrice) ⇒
    * [.getParticipationValue(address, symbolOrId)](#MarketData+getParticipationValue) ⇒
    * [.maxOrderSizeForTrader(side, positionRisk)](#MarketData+maxOrderSizeForTrader) ⇒
    * [.maxSignedPosition(side, symbol)](#MarketData+maxSignedPosition) ⇒
    * [.getOraclePrice(base, quote)](#MarketData+getOraclePrice) ⇒ <code>number</code>
    * [.getMarkPrice(symbol)](#MarketData+getMarkPrice) ⇒
    * [.getPerpetualPrice(symbol, quantity)](#MarketData+getPerpetualPrice) ⇒
    * [.getPerpetualState(symbol, indexPrices)](#MarketData+getPerpetualState) ⇒
    * [.getPerpetualStaticInfo(symbol)](#MarketData+getPerpetualStaticInfo) ⇒
    * [.getPerpetualMidPrice(symbol)](#MarketData+getPerpetualMidPrice) ⇒ <code>number</code>
    * [.getAvailableMargin(traderAddr, symbol, indexPrices)](#MarketData+getAvailableMargin) ⇒
    * [.getTraderLoyalityScore(traderAddr, brokerAddr)](#MarketData+getTraderLoyalityScore) ⇒
    * [.isMarketClosed(symbol)](#MarketData+isMarketClosed) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_TraderInterface_new"></a>

### new TraderInterface(config)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |

<a name="TraderInterface+queryExchangeFee"></a>

### traderInterface.queryExchangeFee(poolSymbolName, traderAddr, brokerAddr) ⇒
<p>Get the fee that is charged to the trader for a given broker (can be ZERO-address),
without broker fee</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>fee (in decimals) that is charged by exchange (without broker)</p>  

| Param | Description |
| --- | --- |
| poolSymbolName | <p>pool currency (e.g. MATIC)</p> |
| traderAddr | <p>address of trader</p> |
| brokerAddr | <p>address of broker</p> |

<a name="TraderInterface+getCurrentTraderVolume"></a>

### traderInterface.getCurrentTraderVolume(poolSymbolName, traderAddr) ⇒
**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>volume in USD</p>  

| Param | Description |
| --- | --- |
| poolSymbolName | <p>pool symbol, e.g. MATIC</p> |
| traderAddr | <p>address of the trader</p> |

<a name="TraderInterface+cancelOrderDigest"></a>

### traderInterface.cancelOrderDigest(symbol, orderId) ⇒
<p>Get digest to cancel an order. Digest needs to be signed and submitted via
orderBookContract.cancelOrder(orderId, signature);</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>tuple of digest which the trader needs to sign and address of order book contract</p>  

| Param |
| --- |
| symbol | 
| orderId | 

<a name="TraderInterface+getOrderBookAddress"></a>

### traderInterface.getOrderBookAddress(symbol) ⇒
<p>Get the order book address for a perpetual</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>order book address for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol (e.g. MATIC-USD-MATIC)</p> |

<a name="TraderInterface+createSmartContractOrder"></a>

### traderInterface.createSmartContractOrder(order, traderAddr) ⇒
<p>createSmartContractOrder from user-friendly order</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>Smart contract type order struct</p>  

| Param | Description |
| --- | --- |
| order | <p>order struct</p> |
| traderAddr | <p>address of trader</p> |

<a name="TraderInterface+orderDigest"></a>

### traderInterface.orderDigest(scOrder) ⇒
<p>Create smart contract order and digest that the trader signs.
await orderBookContract.postOrder(scOrder, signature, { gasLimit: gasLimit });
Order must contain broker fee and broker address if there is supposed to be a broker.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>digest that the trader has to sign</p>  

| Param | Description |
| --- | --- |
| scOrder | <p>smart contract order struct (get from order via createSCOrder)</p> |

<a name="TraderInterface+getProxyABI"></a>

### traderInterface.getProxyABI(method) ⇒
<p>Get the ABI of a method in the proxy contract</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>ABI as a single string</p>  

| Param | Description |
| --- | --- |
| method | <p>Name of the method</p> |

<a name="TraderInterface+getOrderBookABI"></a>

### traderInterface.getOrderBookABI(symbol, method) ⇒
<p>Get the ABI of a method in the Limit Order Book contract corresponding to a given symbol.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>ABI as a single string</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form MATIC-USD-MATIC</p> |
| method | <p>Name of the method</p> |

<a name="MarketData+createProxyInstance"></a>

### traderInterface.createProxyInstance(provider)
<p>Initialize the marketData-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>createProxyInstance</code>](#MarketData+createProxyInstance)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="MarketData+getProxyAddress"></a>

### traderInterface.getProxyAddress() ⇒
<p>Get the proxy address</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getProxyAddress</code>](#MarketData+getProxyAddress)  
**Returns**: <p>Address of the perpetual proxy contract</p>  
<a name="MarketData+smartContractOrderToOrder"></a>

### traderInterface.smartContractOrderToOrder(smOrder) ⇒
<p>Convert the smart contract output of an order into a convenient format of type &quot;Order&quot;</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>smartContractOrderToOrder</code>](#MarketData+smartContractOrderToOrder)  
**Returns**: <p>more convenient format of order, type &quot;Order&quot;</p>  

| Param | Description |
| --- | --- |
| smOrder | <p>SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event</p> |

<a name="MarketData+getReadOnlyProxyInstance"></a>

### traderInterface.getReadOnlyProxyInstance() ⇒
<p>Get contract instance. Useful for event listening.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getReadOnlyProxyInstance</code>](#MarketData+getReadOnlyProxyInstance)  
**Returns**: <p>read-only proxy instance</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get contract instance
  let proxy = await mktData.getReadOnlyProxyInstance();
  console.log(proxy);
}
main();
```
<a name="MarketData+exchangeInfo"></a>

### traderInterface.exchangeInfo() ⇒ [<code>ExchangeInfo</code>](#ExchangeInfo)
<p>Information about the products traded in the exchange.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>exchangeInfo</code>](#MarketData+exchangeInfo)  
**Returns**: [<code>ExchangeInfo</code>](#ExchangeInfo) - <p>Array of static data for all the pools and perpetuals in the system.</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get exchange info
  let info = await mktData.exchangeInfo();
  console.log(info);
}
main();
```
<a name="MarketData+openOrders"></a>

### traderInterface.openOrders(traderAddr, symbol) ⇒ <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code>
<p>All open orders for a trader-address and a symbol.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>openOrders</code>](#MarketData+openOrders)  
**Returns**: <code>Array.&lt;Array.&lt;Order&gt;, Array.&lt;string&gt;&gt;</code> - <p>Array of open orders and corresponding order-ids.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the open orders.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get all open orders for a trader/symbol
  let opOrder = await mktData.openOrders("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "ETH-USD-MATIC");
  console.log(opOrder);
}
main();
```
<a name="MarketData+positionRisk"></a>

### traderInterface.positionRisk(traderAddr, symbol) ⇒ <code>MarginAccount</code>
<p>Information about the position open by a given trader in a given perpetual contract.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>positionRisk</code>](#MarketData+positionRisk)  
**Returns**: <code>MarginAccount</code> - <p>Position risk of trader.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC. Can also be the perpetual id as string</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get position risk info
  let posRisk = await mktData.positionRisk("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "ETH-USD-MATIC");
  console.log(posRisk);
}
main();
```
<a name="MarketData+positionRiskOnTrade"></a>

### traderInterface.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if a given order is executed.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>positionRiskOnTrade</code>](#MarketData+positionRiskOnTrade)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after trade</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| order | <p>Order to be submitted</p> |
| account | <p>Position risk before trade</p> |
| indexPriceInfo | <p>Index prices and market status (open/closed)</p> |

<a name="MarketData+positionRiskOnCollateralAction"></a>

### traderInterface.positionRiskOnCollateralAction(traderAddr, deltaCollateral, currentPositionRisk) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if given amount of collateral is added/removed from the account.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>positionRiskOnCollateralAction</code>](#MarketData+positionRiskOnCollateralAction)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| deltaCollateral | <p>Amount of collateral to add or remove (signed)</p> |
| currentPositionRisk | <p>Position risk before</p> |

<a name="MarketData+getWalletBalance"></a>

### traderInterface.getWalletBalance(address, symbol) ⇒
<p>Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getWalletBalance</code>](#MarketData+getWalletBalance)  
**Returns**: <p>Balance</p>  

| Param | Description |
| --- | --- |
| address | <p>Address to check</p> |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

<a name="MarketData+getPoolShareTokenBalance"></a>

### traderInterface.getPoolShareTokenBalance(address, symbolOrId)
<p>Get the address' balance of the pool share token</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPoolShareTokenBalance</code>](#MarketData+getPoolShareTokenBalance)  

| Param | Description |
| --- | --- |
| address | <p>address of the liquidity provider</p> |
| symbolOrId | <p>Symbol of the form ETH-USD-MATIC, or MATIC (collateral only), or Pool-Id</p> |

<a name="MarketData+_getPoolShareTokenBalanceFromId"></a>

### traderInterface.\_getPoolShareTokenBalanceFromId(address, poolId) ⇒
<p>Query the pool share token holdings of address</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>\_getPoolShareTokenBalanceFromId</code>](#MarketData+_getPoolShareTokenBalanceFromId)  
**Returns**: <p>pool share token balance of address</p>  

| Param | Description |
| --- | --- |
| address | <p>address of token holder</p> |
| poolId | <p>pool id</p> |

<a name="MarketData+getShareTokenPrice"></a>

### traderInterface.getShareTokenPrice(symbolOrId) ⇒
<p>Value of pool token in collateral currency</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getShareTokenPrice</code>](#MarketData+getShareTokenPrice)  
**Returns**: <p>current pool share token price in collateral currency</p>  

| Param | Description |
| --- | --- |
| symbolOrId | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

<a name="MarketData+getParticipationValue"></a>

### traderInterface.getParticipationValue(address, symbolOrId) ⇒
<p>Value of the pool share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getParticipationValue</code>](#MarketData+getParticipationValue)  
**Returns**: <p>the value (in collateral tokens) of the pool share, #share tokens, shareTokenAddress</p>  

| Param | Description |
| --- | --- |
| address | <p>address of liquidity provider</p> |
| symbolOrId | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get value of pool share token
  let shareToken = await md.getParticipationValue(myaddress, "MATIC");
  console.log(shareToken);
}
main();
```
<a name="MarketData+maxOrderSizeForTrader"></a>

### traderInterface.maxOrderSizeForTrader(side, positionRisk) ⇒
<p>Gets the maximal order size to open positions (increase size),
considering the existing position, state of the perpetual
Ignores users wallet balance.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>maxOrderSizeForTrader</code>](#MarketData+maxOrderSizeForTrader)  
**Returns**: <p>Maximal trade size, not signed</p>  

| Param | Description |
| --- | --- |
| side | <p>BUY or SELL</p> |
| positionRisk | <p>Current position risk (as seen in positionRisk)</p> |

<a name="MarketData+maxSignedPosition"></a>

### traderInterface.maxSignedPosition(side, symbol) ⇒
**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>maxSignedPosition</code>](#MarketData+maxSignedPosition)  
**Returns**: <p>signed maximal position size in base currency</p>  

| Param | Description |
| --- | --- |
| side | <p>BUY_SIDE or SELL_SIDE</p> |
| symbol | <p>of the form ETH-USD-MATIC.</p> |

<a name="MarketData+getOraclePrice"></a>

### traderInterface.getOraclePrice(base, quote) ⇒ <code>number</code>
<p>Uses the Oracle(s) in the exchange to get the latest price of a given index in a given currency, if a route exists.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getOraclePrice</code>](#MarketData+getOraclePrice)  
**Returns**: <code>number</code> - <p>Price of index in given currency.</p>  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>string</code> | <p>Index name, e.g. ETH.</p> |
| quote | <code>string</code> | <p>Quote currency, e.g. USD.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let price = await mktData.getOraclePrice("ETH", "USD");
  console.log(price);
}
main();
```
<a name="MarketData+getMarkPrice"></a>

### traderInterface.getMarkPrice(symbol) ⇒
<p>Get the current mark price</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getMarkPrice</code>](#MarketData+getMarkPrice)  
**Returns**: <p>mark price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get mark price
  let price = await mktData.getMarkPrice("ETH-USD-MATIC");
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualPrice"></a>

### traderInterface.getPerpetualPrice(symbol, quantity) ⇒
<p>get the current price for a given quantity</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualPrice</code>](#MarketData+getPerpetualPrice)  
**Returns**: <p>price (number)</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |
| quantity | <p>quantity to be traded, negative if short</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual price
  let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualState"></a>

### traderInterface.getPerpetualState(symbol, indexPrices) ⇒
<p>Query recent perpetual state from blockchain</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualState</code>](#MarketData+getPerpetualState)  
**Returns**: <p>PerpetualState reference</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |
| indexPrices | <p>S2 and S3 prices/isMarketOpen if not provided fetch via REST API</p> |

<a name="MarketData+getPerpetualStaticInfo"></a>

### traderInterface.getPerpetualStaticInfo(symbol) ⇒
<p>Query perpetual static info.
This information is queried once at createProxyInstance-time and remains static after that.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualStaticInfo</code>](#MarketData+getPerpetualStaticInfo)  
**Returns**: <p>PerpetualStaticInfo copy.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="MarketData+getPerpetualMidPrice"></a>

### traderInterface.getPerpetualMidPrice(symbol) ⇒ <code>number</code>
<p>get the current mid-price for a perpetual</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualMidPrice</code>](#MarketData+getPerpetualMidPrice)  
**Returns**: <code>number</code> - <p>price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("testnet");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual mid price
  let midPrice = await mktData.getPerpetualMidPrice("ETH-USD-MATIC");
  console.log(midPrice);
}
main();
```
<a name="MarketData+getAvailableMargin"></a>

### traderInterface.getAvailableMargin(traderAddr, symbol, indexPrices) ⇒
<p>Query the available margin conditional on the given (or current) index prices
Result is in collateral currency</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getAvailableMargin</code>](#MarketData+getAvailableMargin)  
**Returns**: <p>available margin in collateral currency</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>address of the trader</p> |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |
| indexPrices | <p>optional index prices, will otherwise fetch from REST API</p> |

<a name="MarketData+getTraderLoyalityScore"></a>

### traderInterface.getTraderLoyalityScore(traderAddr, brokerAddr) ⇒
<p>Calculate a type of exchange loyality score based on trader volume</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getTraderLoyalityScore</code>](#MarketData+getTraderLoyalityScore)  
**Returns**: <p>a loyality score (4 worst, 1 best)</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>address of the trader</p> |
| brokerAddr | <p>address of the trader's broker or undefined</p> |

<a name="MarketData+isMarketClosed"></a>

### traderInterface.isMarketClosed(symbol) ⇒
<p>Get market open/closed status</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>isMarketClosed</code>](#MarketData+isMarketClosed)  
**Returns**: <p>True if the market is closed</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Perpetual symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### traderInterface.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### traderInterface.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### traderInterface.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### traderInterface.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### traderInterface.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### traderInterface.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### traderInterface.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### traderInterface.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### traderInterface.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### traderInterface.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### traderInterface.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### traderInterface.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### traderInterface.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="WriteAccessHandler"></a>

## WriteAccessHandler ⇐ [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)
<p>This is a parent class for the classes that require
write access to the contracts.
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  

* [WriteAccessHandler](#WriteAccessHandler) ⇐ [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)
    * [new WriteAccessHandler(config, privateKey)](#new_WriteAccessHandler_new)
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId)
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_WriteAccessHandler_new"></a>

### new WriteAccessHandler(config, privateKey)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>configuration</p> |
| privateKey | <code>string</code> | <p>private key of account that trades</p> |

<a name="WriteAccessHandler+createProxyInstance"></a>

### writeAccessHandler.createProxyInstance(provider)
<p>Initialize the writeAccessHandler-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="WriteAccessHandler+setAllowance"></a>

### writeAccessHandler.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Returns**: <p>ContractTransaction</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

<a name="WriteAccessHandler+getAddress"></a>

### writeAccessHandler.getAddress() ⇒ <code>string</code>
<p>Address corresponding to the private key used to instantiate this class.</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Returns**: <code>string</code> - <p>Address of this wallet.</p>  
<a name="WriteAccessHandler+swapForMockToken"></a>

### writeAccessHandler.swapForMockToken(symbol, amountToPay) ⇒
<p>Converts a given amount of chain native currency (test MATIC)
into a mock token used for trading on testnet, with a rate of 1:100_000</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Returns**: <p>Transaction object</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Pool margin token e.g. MATIC</p> |
| amountToPay | <p>Amount in chain currency, e.g. &quot;0.1&quot; for 0.1 MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### writeAccessHandler.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### writeAccessHandler.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### writeAccessHandler.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### writeAccessHandler.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### writeAccessHandler.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### writeAccessHandler.getSymbolFromPerpId(perpId)
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  

| Param | Description |
| --- | --- |
| perpId | <p>perpetual id</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### writeAccessHandler.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### writeAccessHandler.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### writeAccessHandler.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### writeAccessHandler.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### writeAccessHandler.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### writeAccessHandler.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### writeAccessHandler.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="CollaterlCCY"></a>

## CollaterlCCY
<p>struct ClientOrder {
uint24 iPerpetualId; // unique id of the perpetual
int128 fLimitPrice; // order will not execute if realized price is above (buy) or below (sell) this price
uint16 leverageTDR; // leverage, set to 0 if deposit margin and trade separate; format: two-digit integer (e.g., 12.34 -&gt; 1234)
uint32 executionTimestamp; // the order will not be executed before this timestamp, allows TWAP orders
uint32 flags; // Order-flags are specified in OrderFlags.sol
uint32 iDeadline; // order will not be executed after this deadline
address brokerAddr; // can be empty, address of the broker
int128 fTriggerPrice; // trigger price for stop-orders|0. Order can be executed if the mark price is below this price (sell order) or above (buy)
int128 fAmount; // signed amount of base-currency. Will be rounded to lot size
bytes32 parentChildDigest1; // see notice in LimitOrderBook.sol
address traderAddr; // address of the trader
bytes32 parentChildDigest2; // see notice in LimitOrderBook.sol
uint16 brokerFeeTbps; // broker fee in tenth of a basis point
bytes brokerSignature; // signature, can be empty if no brokerAddr provided
//address referrerAddr; &lt;- will be set by LimitOrderBook
//uint64 submittedBlock &lt;- will be set by LimitOrderBook
}</p>

**Kind**: global variable  
<a name="ExchangeInfo"></a>

## ExchangeInfo : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| pools | [<code>Array.&lt;PoolState&gt;</code>](#PoolState) | <p>Array of state objects for all pools in the exchange.</p> |
| oracleFactoryAddr | <code>string</code> | <p>Address of the oracle factory used by the pools in the exchange.</p> |

<a name="PoolState"></a>

## PoolState : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isRunning | <code>boolean</code> | <p>True if the pool is running.</p> |
| marginTokenAddr | <code>string</code> | <p>Address of the token used by the pool. This is the token used for margin deposits, liquidity provision, and trading fees.</p> |
| poolShareTokenAddr | <code>string</code> | <p>Address of the pool share token. This is the token issued to external liquidity providers.</p> |
| defaultFundCashCC | <code>number</code> | <p>Amount of cash in the default fund of this pool, denominated in margin tokens.</p> |
| pnlParticipantCashCC | <code>number</code> | <p>Amount of cash in the PnL participation pool, i.e. cash deposited by external liquidity providers.</p> |
| totalAMMFundCashCC | <code>number</code> | <p>Amount of cash aggregated across all perpetual AMM funds in this pool.</p> |
| totalTargetAMMFundSizeCC | <code>number</code> | <p>Target AMM funds aggregated across all perpetuals in this pool.</p> |
| brokerCollateralLotSize | <code>number</code> | <p>Price of one lot for brokers who wish to participate in this pool. Denominated in margin tokens.</p> |
| perpetuals | <code>Array.&lt;PerpetualState&gt;</code> | <p>Array of all perpetuals in this pool.</p> |

