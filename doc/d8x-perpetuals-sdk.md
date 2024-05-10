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
<dd><p>Functions for white-label partners to determine fees, deposit lots, and sign-up traders.
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
<dt><a href="#OnChainPxFeed">OnChainPxFeed</a></dt>
<dd><p>OnChainPxFeed: get a price from a chainlink-style oracle</p></dd>
<dt><a href="#OrderExecutorTool">OrderExecutorTool</a> ⇐ <code><a href="#WriteAccessHandler">WriteAccessHandler</a></code></dt>
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
<dt><a href="#ReferralCodeSigner">ReferralCodeSigner</a></dt>
<dd><p>This is a 'standalone' class that deals with signatures
required for referral codes:</p>
<ul>
<li>referrer creates a new referral code for trader (no agency involved)</li>
<li>agency creates a new referral code for a referrer and their trader</li>
<li>trader selects a referral code to trade with</li>
</ul>
<p>Note that since the back-end is chain specific, the referral code is typically bound to
one chain, unless the backend employs code transferrals</p></dd>
<dt><a href="#TraderInterface">TraderInterface</a> ⇐ <code><a href="#MarketData">MarketData</a></code></dt>
<dd><p>Interface that can be used by front-end that wraps all private functions
so that signatures can be handled in frontend via wallet</p></dd>
<dt><a href="#WriteAccessHandler">WriteAccessHandler</a> ⇐ <code><a href="#PerpetualDataHandler">PerpetualDataHandler</a></code></dt>
<dd><p>This is a parent class for the classes that require
write access to the contracts.
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p></dd>
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
    * [~floatToDecN(x, decimals)](#module_d8xMath..floatToDecN) ⇒ <code>BigNumber</code>
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

<a name="module_d8xMath..floatToDecN"></a>

### d8xMath~floatToDecN(x, decimals) ⇒ <code>BigNumber</code>
**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <code>BigNumber</code> - <p>x as a BigNumber in Dec18 format</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | <p>number (float)</p> |
| decimals | <code>number</code> | <p>number of decimals</p> |

<a name="module_d8xMath..countDecimalsOf"></a>

### d8xMath~countDecimalsOf(x, precision) ⇒
<p>9 are rounded up regardless of precision, e.g, 0.1899000 at precision 6 results in 3</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <p>number of decimals</p>  

| Param | Type |
| --- | --- |
| x | <code>number</code> | 
| precision | <code>number</code> | 

<a name="module_d8xMath..roundToLotString"></a>

### d8xMath~roundToLotString(x, lot, precision) ⇒
<p>Round a number to a given lot size and return a string formated
to for this lot-size</p>

**Kind**: inner method of [<code>d8xMath</code>](#module_d8xMath)  
**Returns**: <p>formated number string</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | <p>number to round</p> |
| lot | <code>number</code> |  | <p>lot size (could be 'uneven' such as 0.019999999 instead of 0.02)</p> |
| precision | <code>number</code> | <code>7</code> | <p>optional lot size precision (e.g. if 0.01999 should be 0.02 then precision could be 5)</p> |

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
    * [new AccountTrade(config, signer)](#new_AccountTrade_new)
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
    * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
    * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
    * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
    * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_AccountTrade_new"></a>

### new AccountTrade(config, signer)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| signer | <code>string</code> \| <code>Signer</code> | <p>Private key or ethers Signer of the account</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(AccountTrade);
  // load configuration for Polygon zkEVM Tesnet
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
   const config = PerpetualDataHandler.readSDKConfig("cardona");
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
   const config = PerpetualDataHandler.readSDKConfig("cardona");
   const pk: string = <string>process.env.PK;
   const accTrade = new AccountTrade(config, pk);
   await accTrade.createProxyInstance();
   // set allowance
   await accTrade.setAllowance("MATIC");
   // set an order
   const order: Order = {
       symbol: "MATIC-USD-MATIC",
       side: "BUY",
       type: "MARKET",
       quantity: 100,
       leverage: 2,
       executionTimestamp: Date.now()/1000,
   };
   const orderTransaction = await accTrade.order(order);
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';

async function main() {
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // add collateral to margin account
  const tx = await accTrade.addCollateral("MATIC-USD-MATIC", 10.9);
  console.log(orderIds);
}

main();
```
<a name="AccountTrade+removeCollateral"></a>

### accountTrade.removeCollateral(symbol, amount)
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| amount | <code>number</code> | <p>How much collateral to remove, in units of collateral currency, e.g. MATIC</p> |

**Example**  
```js
import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';

async function main() {
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  // remove collateral from margin account
  const tx = await accTrade.removeCollateral("MATIC-USD-MATIC", 3.14);
  console.log(orderIds);
}

main();
```
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

<a name="PerpetualDataHandler+getPerpetuals"></a>

### accountTrade.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### accountTrade.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### accountTrade.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### accountTrade.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### accountTrade.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### accountTrade.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

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
<p>Functions for white-label partners to determine fees, deposit lots, and sign-up traders.
This class requires a private key and executes smart-contract interactions that
require gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

* [BrokerTool](#BrokerTool) ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
    * [new BrokerTool(config, privateKey, signer)](#new_BrokerTool_new)
    * [.getBrokerInducedFee(poolSymbolName)](#BrokerTool+getBrokerInducedFee) ⇒ <code>number</code>
    * [.getFeeForBrokerDesignation(poolSymbolName, [lots])](#BrokerTool+getFeeForBrokerDesignation) ⇒ <code>number</code>
    * [.getFeeForBrokerVolume(poolSymbolName)](#BrokerTool+getFeeForBrokerVolume) ⇒ <code>number</code>
    * [.getFeeForBrokerStake([brokerAddr])](#BrokerTool+getFeeForBrokerStake) ⇒ <code>number</code>
    * [.determineExchangeFee(order, traderAddr)](#BrokerTool+determineExchangeFee) ⇒ <code>number</code>
    * [.getCurrentBrokerVolume(poolSymbolName)](#BrokerTool+getCurrentBrokerVolume) ⇒ <code>number</code>
    * [.getLotSize(poolSymbolName)](#BrokerTool+getLotSize) ⇒ <code>number</code>
    * [.getBrokerDesignation(poolSymbolName)](#BrokerTool+getBrokerDesignation) ⇒ <code>number</code>
    * [.depositBrokerLots(poolSymbolName, lots)](#BrokerTool+depositBrokerLots) ⇒ <code>ContractTransaction</code>
    * [.signOrder(order, traderAddr)](#BrokerTool+signOrder) ⇒ <code>Order</code>
    * [.signSCOrder(scOrder, traderAddr)](#BrokerTool+signSCOrder) ⇒ <code>string</code>
    * [.transferOwnership(poolSymbolName, newAddress)](#BrokerTool+transferOwnership) ⇒ <code>ContractTransaction</code>
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
    * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
    * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
    * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_BrokerTool_new"></a>

### new BrokerTool(config, privateKey, signer)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of a white-label partner.</p> |
| signer | <code>Signer</code> | <p>Signer (ignored if a private key is provided)</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // load configuration for Polygon zkEVM (testnet)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
<p>Determine the exchange fee based on lots, traded volume, and D8X balance of this white-label partner.
This is the final exchange fee that this white-label partner can offer to traders that trade through him.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Exchange fee for this white-label partner, in decimals (i.e. 0.1% is 0.001)</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get white-label partner induced fee
  let brokFee = await brokTool.getBrokerInducedFee("MATIC");
  console.log(brokFee);
}
main();
```
<a name="BrokerTool+getFeeForBrokerDesignation"></a>

### brokerTool.getFeeForBrokerDesignation(poolSymbolName, [lots]) ⇒ <code>number</code>
<p>Determine the exchange fee based on lots purchased by this white-label partner.
The final exchange fee that this white-label partner can offer to traders that trade through him is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on this white-label partner's designation, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| [lots] | <code>number</code> | <p>Optional, designation to use if different from this white-label partner's.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get white-label partner fee induced by lots
  let brokFeeLots = await brokTool.getFeeForBrokerDesignation("MATIC");
  console.log(brokFeeLots);
}
main();
```
<a name="BrokerTool+getFeeForBrokerVolume"></a>

### brokerTool.getFeeForBrokerVolume(poolSymbolName) ⇒ <code>number</code>
<p>Determine the exchange fee based on volume traded under this white-label partner.
The final exchange fee that this white-label partner can offer to traders that trade through him is equal to
maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on a white-label partner's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get white-label partner fee induced by volume
  let brokFeeVol = await brokTool.getFeeForBrokerVolume("MATIC");
  console.log(brokFeeVol);
}
main();
```
<a name="BrokerTool+getFeeForBrokerStake"></a>

### brokerTool.getFeeForBrokerStake([brokerAddr]) ⇒ <code>number</code>
<p>Determine the exchange fee based on the current D8X balance in a white-label partner's wallet.
The final exchange fee that this white-label partner can offer to traders that trade through him is equal to
maximum(brokerTool.getFeeForBrokerDesignation(symbol, lots),  brokerTool.getFeeForBrokerVolume(symbol), brokerTool.getFeeForBrokerStake)</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Fee based solely on a white-label partner's D8X balance, in decimals (i.e. 0.1% is 0.001).</p>  

| Param | Type | Description |
| --- | --- | --- |
| [brokerAddr] | <code>string</code> | <p>Address of the white-label partner in question, if different from the one calling this function.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get white-label partner fee induced by staked d8x
  let brokFeeStake = await brokTool.getFeeForBrokerStake("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
  console.log(brokFeeStake);
}
main();
```
<a name="BrokerTool+determineExchangeFee"></a>

### brokerTool.determineExchangeFee(order, traderAddr) ⇒ <code>number</code>
<p>Determine exchange fee based on an order and a trader.
This is the fee charged by the exchange only, excluding the white-label partner fee,
and it takes into account whether the order given here has been signed by a white-label partner or not.
Use this, for instance, to verify that the fee to be charged for a given order is as expected,
before and after signing it with brokerTool.signOrder.
This fee is equal or lower than the white-label partner induced fee, provided the order is properly signed.</p>

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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
<p>Exponentially weighted EMA of the total trading volume of all trades performed under this white-label partner.
The weights are chosen so that in average this coincides with the 30 day volume.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Current trading volume for this white-label partner, in USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get 30 day volume for white-label partner
  let brokVolume = await brokTool.getCurrentBrokerVolume("MATIC");
  console.log(brokVolume);
}
main();
```
<a name="BrokerTool+getLotSize"></a>

### brokerTool.getLotSize(poolSymbolName) ⇒ <code>number</code>
<p>Total amount of collateral currency a white-label partner has to deposit into the default fund to purchase one lot.
This is equivalent to the price of a lot expressed in a given pool's currency (e.g. MATIC, USDC, etc).</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>White-label partner lot size in a given pool's currency, e.g. in MATIC for poolSymbolName MATIC.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
<p>Provides information on how many lots a white-label partner purchased for a given pool.
This is relevant to determine the white-label partner's fee tier.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>number</code> - <p>Number of lots purchased by this white-label partner.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // get white-label partner designation
  let brokDesignation = await brokTool.getBrokerDesignation("MATIC");
  console.log(brokDesignation);
}
main();
```
<a name="BrokerTool+depositBrokerLots"></a>

### brokerTool.depositBrokerLots(poolSymbolName, lots) ⇒ <code>ContractTransaction</code>
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let brokTool = new BrokerTool(config, pk);
  await brokTool.createProxyInstance();
  // deposit to perpetuals
  await brokTool.setAllowance("MATIC");
  let respDeposit = await brokTool.depositBrokerLots("MATIC",1);
  console.log(respDeposit);
}
main();
```
<a name="BrokerTool+signOrder"></a>

### brokerTool.signOrder(order, traderAddr) ⇒ <code>Order</code>
<p>Adds this white-label partner's signature to a user-friendly order. An order signed by a white-label partner is considered
to be routed through this white-label partner and benefits from the white-label partner's fee conditions.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>Order</code> - <p>An order signed by this white-label partner, which can be submitted directly with AccountTrade.order.</p>  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>Order</code> | <p>Order to sign. It must contain valid white-label partner fee, white-label partner address, and order deadline.</p> |
| traderAddr | <code>string</code> | <p>Address of trader submitting the order.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
<a name="BrokerTool+signSCOrder"></a>

### brokerTool.signSCOrder(scOrder, traderAddr) ⇒ <code>string</code>
<p>Generates a white-label partner's signature of a smart-contract ready order. An order signed by a white-label partner is considered
to be routed through this white-label partner and benefits from the white-label partner's fee conditions.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>string</code> - <p>Signature of order.</p>  

| Param | Type | Description |
| --- | --- | --- |
| scOrder | <code>SmartContractOrder</code> | <p>Order to sign. It must contain valid white-label partner fee, white-label partner address, and order deadline.</p> |
| traderAddr | <code>string</code> | <p>Address of trader submitting the order.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  const brokTool = new BrokerTool(config, pk);
  const traderAPI = new TraderInterface(config);
  await brokTool.createProxyInstance();
  await traderAPI.createProxyInstance();
  // sign order
  const order = {symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 1,
      executionTimestamp: Date.now()/1000
   };
  const scOrder = await traderAPI.createSmartContractOrder(order, "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B")
  const signature = await brokTool.signSCOrder(order, "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
       0.0001, 1669723339);
  console.log(signature);
}
main();
```
<a name="BrokerTool+transferOwnership"></a>

### brokerTool.transferOwnership(poolSymbolName, newAddress) ⇒ <code>ContractTransaction</code>
<p>Transfer ownership of a white-label partner's status to a new wallet. This function transfers the values related to
(i) trading volume and (ii) deposited lots to newAddress. The white-label partner needs in addition to manually transfer
his D8X holdings to newAddress. Until this transfer is completed, the white-label partner will not have his current designation reflected at newAddress.</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Returns**: <code>ContractTransaction</code> - <p>ethers transaction object</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbolName | <code>string</code> | <p>Pool symbol name (e.g. MATIC, USDC, etc).</p> |
| newAddress | <code>string</code> | <p>The address this white-label partner wants to use from now on.</p> |

**Example**  
```js
import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(BrokerTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

<a name="PerpetualDataHandler+getPerpetuals"></a>

### brokerTool.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### brokerTool.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### brokerTool.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### brokerTool.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### brokerTool.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### brokerTool.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>BrokerTool</code>](#BrokerTool)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

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
    * [new LiquidatorTool(config, signer)](#new_LiquidatorTool_new)
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
    * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
    * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
    * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
    * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_LiquidatorTool_new"></a>

### new LiquidatorTool(config, signer)
<p>Constructs a LiquidatorTool instance for a given configuration and private key.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| signer | <code>string</code> \| <code>Signer</code> | <p>Private key or ethers Signer of the account</p> |

**Example**  
```js
import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidatorTool);
  // load configuration for Polygon zkEVM (tesnet)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

<a name="PerpetualDataHandler+getPerpetuals"></a>

### liquidatorTool.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### liquidatorTool.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### liquidatorTool.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### liquidatorTool.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### liquidatorTool.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### liquidatorTool.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

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
    * [new LiquidityProviderTool(config, signer)](#new_LiquidityProviderTool_new)
    * [.addLiquidity(poolSymbolName, amountCC)](#LiquidityProviderTool+addLiquidity) ⇒
    * [.initiateLiquidityWithdrawal(poolSymbolName, amountPoolShares)](#LiquidityProviderTool+initiateLiquidityWithdrawal) ⇒
    * [.executeLiquidityWithdrawal(poolSymbolName)](#LiquidityProviderTool+executeLiquidityWithdrawal) ⇒
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
    * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
    * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
    * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_LiquidityProviderTool_new"></a>

### new LiquidityProviderTool(config, signer)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| signer | <code>string</code> \| <code>Signer</code> | <p>Private key or ethers Signer of the account</p> |

**Example**  
```js
import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(LiquidityProviderTool);
  // load configuration for Polygon zkEVM (testnet)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

<a name="PerpetualDataHandler+getPerpetuals"></a>

### liquidityProviderTool.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### liquidityProviderTool.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### liquidityProviderTool.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### liquidityProviderTool.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### liquidityProviderTool.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### liquidityProviderTool.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>LiquidityProviderTool</code>](#LiquidityProviderTool)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

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
    * [.createProxyInstance(providerOrMarketData)](#MarketData+createProxyInstance)
    * [.getProxyAddress()](#MarketData+getProxyAddress) ⇒ <code>string</code>
    * [.getTriangulations()](#MarketData+getTriangulations) ⇒
    * [.smartContractOrderToOrder(smOrder)](#MarketData+smartContractOrderToOrder) ⇒ <code>Order</code>
    * [.getReadOnlyProxyInstance()](#MarketData+getReadOnlyProxyInstance) ⇒ <code>Contract</code>
    * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ <code>ExchangeInfo</code>
    * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒
    * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>Array.&lt;MarginAccount&gt;</code>
    * [.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo)](#MarketData+positionRiskOnTrade) ⇒
    * [.positionRiskOnCollateralAction(deltaCollateral, account)](#MarketData+positionRiskOnCollateralAction) ⇒ <code>MarginAccount</code>
    * [.getWalletBalance(address, symbol)](#MarketData+getWalletBalance) ⇒
    * [.getPoolShareTokenBalance(address, symbolOrId)](#MarketData+getPoolShareTokenBalance) ⇒ <code>number</code>
    * [.getShareTokenPrice(symbolOrId)](#MarketData+getShareTokenPrice) ⇒ <code>number</code>
    * [.getParticipationValue(address, symbolOrId)](#MarketData+getParticipationValue) ⇒
    * [.maxOrderSizeForTrader(traderAddr, symbol)](#MarketData+maxOrderSizeForTrader) ⇒
    * [.maxSignedPosition(side, symbol)](#MarketData+maxSignedPosition) ⇒ <code>number</code>
    * [.getOraclePrice(base, quote)](#MarketData+getOraclePrice) ⇒ <code>number</code>
    * [.getOrderStatus(symbol, orderId, overrides)](#MarketData+getOrderStatus) ⇒
    * [.getOrdersStatus(symbol, orderId)](#MarketData+getOrdersStatus) ⇒
    * [.getMarkPrice(symbol)](#MarketData+getMarkPrice) ⇒ <code>number</code>
    * [.getPerpetualPrice(symbol, quantity)](#MarketData+getPerpetualPrice) ⇒ <code>number</code>
    * [.getPerpetualState(symbol)](#MarketData+getPerpetualState) ⇒ <code>PerpetualState</code>
    * [.getPoolState(poolSymbol)](#MarketData+getPoolState) ⇒ <code>PoolState</code>
    * [.getPerpetualStaticInfo(symbol)](#MarketData+getPerpetualStaticInfo) ⇒ <code>PerpetualStaticInfo</code>
    * [.getPerpetualMidPrice(symbol)](#MarketData+getPerpetualMidPrice) ⇒ <code>number</code>
    * [.getAvailableMargin(traderAddr, symbol, indexPrices)](#MarketData+getAvailableMargin) ⇒
    * [.getTraderLoyalityScore(traderAddr)](#MarketData+getTraderLoyalityScore) ⇒ <code>number</code>
    * [.isMarketClosed(symbol)](#MarketData+isMarketClosed) ⇒ <code>boolean</code>
    * [.getPriceInUSD(symbol)](#MarketData+getPriceInUSD) ⇒ <code>Map.&lt;string, number&gt;</code>
    * [.fetchPricesForPerpetual(symbol)](#MarketData+fetchPricesForPerpetual) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
    * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
    * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
    * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

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
  // load configuration for Polygon zkEVM (testnet)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  // MarketData (read only, no authentication needed)
  let mktData = new MarketData(config);
  // Create a proxy instance to access the blockchain
  await mktData.createProxyInstance();
}
main();
```
<a name="MarketData+createProxyInstance"></a>

### marketData.createProxyInstance(providerOrMarketData)
<p>Initialize the marketData-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  

| Param | Description |
| --- | --- |
| providerOrMarketData | <p>optional provider or existing market data instance</p> |

<a name="MarketData+getProxyAddress"></a>

### marketData.getProxyAddress() ⇒ <code>string</code>
<p>Get the proxy address</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>string</code> - <p>Address of the perpetual proxy contract</p>  
<a name="MarketData+getTriangulations"></a>

### marketData.getTriangulations() ⇒
<p>Get the pre-computed triangulations</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Triangulations</p>  
<a name="MarketData+smartContractOrderToOrder"></a>

### marketData.smartContractOrderToOrder(smOrder) ⇒ <code>Order</code>
<p>Convert the smart contract output of an order into a convenient format of type &quot;Order&quot;</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Order</code> - <p>more convenient format of order, type &quot;Order&quot;</p>  

| Param | Type | Description |
| --- | --- | --- |
| smOrder | <code>SmartContractOrder</code> | <p>SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event</p> |

<a name="MarketData+getReadOnlyProxyInstance"></a>

### marketData.getReadOnlyProxyInstance() ⇒ <code>Contract</code>
<p>Get contract instance. Useful for event listening.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Contract</code> - <p>read-only proxy instance</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get contract instance
  let proxy = await mktData.getReadOnlyProxyInstance();
  console.log(proxy);
}
main();
```
<a name="MarketData+exchangeInfo"></a>

### marketData.exchangeInfo() ⇒ <code>ExchangeInfo</code>
<p>Information about the products traded in the exchange.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>ExchangeInfo</code> - <p>Array of static data for all the pools and perpetuals in the system.</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get exchange info
  let info = await mktData.exchangeInfo();
  console.log(info);
}
main();
```
<a name="MarketData+openOrders"></a>

### marketData.openOrders(traderAddr, symbol) ⇒
<p>All open orders for a trader-address and a symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>For each perpetual an array of open orders and corresponding order-ids.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the open orders.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC or a pool symbol, or undefined. If a poolSymbol is provided, the response includes orders in all perpetuals of the given pool. If no symbol is provided, the response includes orders from all perpetuals in all pools.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

### marketData.positionRisk(traderAddr, symbol) ⇒ <code>Array.&lt;MarginAccount&gt;</code>
<p>Information about the position open by a given trader in a given perpetual contract, or
for all perpetuals in a pool</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Array.&lt;MarginAccount&gt;</code> - <p>Array of position risks of trader.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC, or pool symbol (&quot;MATIC&quot;) to get all positions in a given pool, or no symbol to get all positions in all pools.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

### marketData.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo) ⇒
<p>Estimates what the position risk will be if a given order is executed.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Position risk after trade, including order cost and maximal trade sizes for position</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| order | <p>Order to be submitted</p> |
| account | <p>Position risk before trade. Defaults to current position if not given.</p> |
| indexPriceInfo | <p>Index prices and market status (open/closed). Defaults to current market status if not given.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const mktData = new MarketData(config);
  await mktData.createProxyInstance();
  const order: Order = {
       symbol: "MATIC-USD-MATIC",
       side: "BUY",
       type: "MARKET",
       quantity: 100,
       leverage: 2,
       executionTimestamp: Date.now()/1000,
   };
  // Get position risk conditional on this order being executed
  const posRisk = await mktData.positionRiskOnTrade("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", order);
  console.log(posRisk);
}
main();
```
<a name="MarketData+positionRiskOnCollateralAction"></a>

### marketData.positionRiskOnCollateralAction(deltaCollateral, account) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if given amount of collateral is added/removed from the account.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after collateral has been added/removed</p>  

| Param | Type | Description |
| --- | --- | --- |
| deltaCollateral | <code>number</code> | <p>Amount of collateral to add or remove (signed)</p> |
| account | <code>MarginAccount</code> | <p>Position risk before collateral is added or removed</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get position risk conditional on removing 3.14 MATIC
  const traderAddr = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";
  const curPos = await mktData.positionRisk("traderAddr", "BTC-USD-MATIC");
  const posRisk = await mktData.positionRiskOnCollateralAction(-3.14, curPos);
  console.log(posRisk);
}
main();
```
<a name="MarketData+getWalletBalance"></a>

### marketData.getWalletBalance(address, symbol) ⇒
<p>Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Perpetual's collateral token balance of the given address.</p>  

| Param | Description |
| --- | --- |
| address | <p>Address to check</p> |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get MATIC balance of address
  let marginTokenBalance = await md.getWalletBalance(myaddress, "BTC-USD-MATIC");
  console.log(marginTokenBalance);
}
main();
```
<a name="MarketData+getPoolShareTokenBalance"></a>

### marketData.getPoolShareTokenBalance(address, symbolOrId) ⇒ <code>number</code>
<p>Get the address' balance of the pool share token</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>Pool share token balance of the given address (e.g. dMATIC balance)</p>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | <p>address of the liquidity provider</p> |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>Symbol of the form ETH-USD-MATIC, or MATIC (collateral only), or Pool-Id</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get dMATIC balance of address
  let shareTokenBalance = await md.getPoolShareTokenBalance(myaddress, "MATIC");
  console.log(shareTokenBalance);
}
main();
```
<a name="MarketData+getShareTokenPrice"></a>

### marketData.getShareTokenPrice(symbolOrId) ⇒ <code>number</code>
<p>Value of pool token in collateral currency</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>current pool share token price in collateral currency</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get price of 1 dMATIC in MATIC
  let shareTokenPrice = await md.getShareTokenPrice(myaddress, "MATIC");
  console.log(shareTokenPrice);
}
main();
```
<a name="MarketData+getParticipationValue"></a>

### marketData.getParticipationValue(address, symbolOrId) ⇒
<p>Value of the pool share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>the value (in collateral tokens) of the pool share, #share tokens, shareTokenAddress</p>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | <p>address of liquidity provider</p> |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get value of pool share token
  let shareToken = await md.getParticipationValue(myaddress, "MATIC");
  console.log(shareToken);
}
main();
```
<a name="MarketData+maxOrderSizeForTrader"></a>

### marketData.maxOrderSizeForTrader(traderAddr, symbol) ⇒
<p>Gets the maximal order sizes to open positions (increase size), both long and short,
considering the existing position, state of the perpetual
Accounts for user's wallet balance.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Maximal trade sizes</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of trader</p> |
| symbol | <code>symbol</code> | <p>Symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // max order sizes
  let shareToken = await md.maxOrderSizeForTrader(myaddress, "BTC-USD-MATIC");
  console.log(shareToken); // {buy: 314, sell: 415}
}
main();
```
<a name="MarketData+maxSignedPosition"></a>

### marketData.maxSignedPosition(side, symbol) ⇒ <code>number</code>
<p>Perpetual-wide maximal signed position size in perpetual.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>signed maximal position size in base currency</p>  

| Param | Type | Description |
| --- | --- | --- |
| side |  | <p>BUY_SIDE or SELL_SIDE</p> |
| symbol | <code>string</code> | <p>of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let maxLongPos = await mktData.maxSignedPosition(BUY_SIDE, "BTC-USD-MATIC");
  console.log(maxLongPos);
}
main();
```
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let price = await mktData.getOraclePrice("ETH", "USD");
  console.log(price);
}
main();
```
<a name="MarketData+getOrderStatus"></a>

### marketData.getOrderStatus(symbol, orderId, overrides) ⇒
<p>Get the status of an order given a symbol and order Id</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Order status (cancelled = 0, executed = 1, open = 2,  unkown = 3)</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |
| orderId | <p>Order Id</p> |
| overrides |  |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get order stauts
  let status = await mktData.getOrderStatus("ETH-USD-MATIC", "0xmyOrderId");
  console.log(status);
}
main();
```
<a name="MarketData+getOrdersStatus"></a>

### marketData.getOrdersStatus(symbol, orderId) ⇒
<p>Get the status of an array of orders given a symbol and their Ids</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Array of order status</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |
| orderId | <p>Array of order Ids</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get order stauts
  let status = await mktData.getOrdersStatus("ETH-USD-MATIC", ["0xmyOrderId1", "0xmyOrderId2"]);
  console.log(status);
}
main();
```
<a name="MarketData+getMarkPrice"></a>

### marketData.getMarkPrice(symbol) ⇒ <code>number</code>
<p>Get the current mark price</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>mark price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get mark price
  let price = await mktData.getMarkPrice("ETH-USD-MATIC");
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualPrice"></a>

### marketData.getPerpetualPrice(symbol, quantity) ⇒ <code>number</code>
<p>get the current price for a given quantity</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>price</p>  

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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual price
  let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualState"></a>

### marketData.getPerpetualState(symbol) ⇒ <code>PerpetualState</code>
<p>Query recent perpetual state from blockchain</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>PerpetualState</code> - <p>PerpetualState copy</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="MarketData+getPoolState"></a>

### marketData.getPoolState(poolSymbol) ⇒ <code>PoolState</code>
<p>Query recent pool state from blockchain, not including perpetual states</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>PoolState</code> - <p>PoolState copy</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbol | <code>string</code> | <p>symbol of the form USDC</p> |

<a name="MarketData+getPerpetualStaticInfo"></a>

### marketData.getPerpetualStaticInfo(symbol) ⇒ <code>PerpetualStaticInfo</code>
<p>Query perpetual static info.
This information is queried once at createProxyInstance-time, and remains static after that.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>PerpetualStaticInfo</code> - <p>Perpetual static info copy.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol</p> |

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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>address of the trader</p> |
| symbol | <code>string</code> | <p>perpetual symbol of the form BTC-USD-MATIC</p> |
| indexPrices |  | <p>optional index prices, will otherwise fetch from REST API</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get available margin
  let mgn = await mktData.getAvailableMargin("0xmyAddress", "ETH-USD-MATIC");
  console.log(mgn);
}
main();
```
<a name="MarketData+getTraderLoyalityScore"></a>

### marketData.getTraderLoyalityScore(traderAddr) ⇒ <code>number</code>
<p>Calculate a type of exchange loyality score based on trader volume</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>number</code> - <p>a loyality score (4 worst, 1 best)</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>address of the trader</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get scpre
  let s = await mktData.getTraderLoyalityScore("0xmyAddress");
  console.log(s);
}
main();
```
<a name="MarketData+isMarketClosed"></a>

### marketData.isMarketClosed(symbol) ⇒ <code>boolean</code>
<p>Get market open/closed status</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>boolean</code> - <p>True if the market is closed</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // is market closed?
  let s = await mktData.isMarketClosed("ETH-USD-MATIC");
  console.log(s);
}
main();
```
<a name="MarketData+getPriceInUSD"></a>

### marketData.getPriceInUSD(symbol) ⇒ <code>Map.&lt;string, number&gt;</code>
<p>Get the latest on-chain price of a perpetual base index in USD.</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <code>Map.&lt;string, number&gt;</code> - <p>Price of the base index in USD, e.g. for ETH-USDC-MATIC, it returns the value of ETH-USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USDC-MATIC. If a pool symbol is used, it returns an array of all the USD prices of the indices in the pool. If no argument is provided, it returns all prices of all the indices in the pools of the exchange.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // is market closed?
  let px = await mktData.getPriceInUSD("ETH-USDC-USDC");
  console.log(px); // {'ETH-USD' -> 1800}
}
main();
```
<a name="MarketData+fetchPricesForPerpetual"></a>

### marketData.fetchPricesForPerpetual(symbol) ⇒
<p>Fetch latest off-chain index and collateral prices</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Returns**: <p>Prices and market-closed information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Perpetual symbol of the form BTC-USDc-USDC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### marketData.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetuals"></a>

### marketData.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### marketData.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### marketData.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### marketData.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### marketData.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### marketData.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### marketData.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>MarketData</code>](#MarketData)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="OnChainPxFeed"></a>

## OnChainPxFeed
<p>OnChainPxFeed: get a price from a chainlink-style oracle</p>

**Kind**: global class  
<a name="OrderExecutorTool"></a>

## OrderExecutorTool ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
<p>Functions to execute existing conditional orders from the limit order book. This class
requires a private key and executes smart-contract interactions that require
gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>WriteAccessHandler</code>](#WriteAccessHandler)  

* [OrderExecutorTool](#OrderExecutorTool) ⇐ [<code>WriteAccessHandler</code>](#WriteAccessHandler)
    * [new OrderExecutorTool(config, signer)](#new_OrderExecutorTool_new)
    * [.executeOrder(symbol, orderId, executorAddr, nonce, [submission])](#OrderExecutorTool+executeOrder) ⇒
    * [.executeOrders(symbol, orderIds, executorAddr, nonce, [submission])](#OrderExecutorTool+executeOrders) ⇒
    * [.getAllOpenOrders(symbol)](#OrderExecutorTool+getAllOpenOrders) ⇒
    * [.numberOfOpenOrders(symbol)](#OrderExecutorTool+numberOfOpenOrders) ⇒ <code>number</code>
    * [.getOrderById(symbol, digest)](#OrderExecutorTool+getOrderById) ⇒
    * [.pollLimitOrders(symbol, numElements, [startAfter])](#OrderExecutorTool+pollLimitOrders) ⇒
    * [.isTradeable(order, indexPrices)](#OrderExecutorTool+isTradeable) ⇒
    * [.isTradeableBatch(orders, indexPrice)](#OrderExecutorTool+isTradeableBatch) ⇒
    * [.smartContractOrderToOrder(scOrder)](#OrderExecutorTool+smartContractOrderToOrder) ⇒
    * [.getTransactionCount(blockTag)](#OrderExecutorTool+getTransactionCount) ⇒
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
    * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
    * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
    * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_OrderExecutorTool_new"></a>

### new OrderExecutorTool(config, signer)
<p>Constructor.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |
| signer | <code>string</code> \| <code>Signer</code> | <p>Private key or ethers Signer of the account</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderExecutorTool);
  // load configuration for Polygon zkEVM (testnet)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  // OrderExecutorTool (authentication required, PK is an environment variable with a private key)
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderExecutorTool(config, pk);
  // Create a proxy instance to access the blockchain
  await orderTool.createProxyInstance();
}
main();
```
<a name="OrderExecutorTool+executeOrder"></a>

### orderExecutorTool.executeOrder(symbol, orderId, executorAddr, nonce, [submission]) ⇒
<p>Executes an order by symbol and ID. This action interacts with the blockchain and incurs gas costs.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderId | <code>string</code> | <p>ID of the order to be executed.</p> |
| executorAddr | <code>string</code> | <p>optional address of the wallet to be credited for executing the order, if different from the one submitting this transaction.</p> |
| nonce | <code>number</code> | <p>optional nonce</p> |
| [submission] | <code>PriceFeedSubmission</code> | <p>optional signed prices obtained via PriceFeeds::fetchLatestFeedPriceInfoForPerpetual</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler, Order } from "@d8x/perpetuals-sdk";
async function main() {
  console.log(OrderExecutorTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  const symbol = "ETH-USD-MATIC";
  let orderTool = new OrderExecutorTool(config, pk);
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
<a name="OrderExecutorTool+executeOrders"></a>

### orderExecutorTool.executeOrders(symbol, orderIds, executorAddr, nonce, [submission]) ⇒
<p>Executes a list of orders of the symbol. This action interacts with the blockchain and incurs gas costs.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| orderIds | <code>Array.&lt;string&gt;</code> | <p>IDs of the orders to be executed.</p> |
| executorAddr | <code>string</code> | <p>optional address of the wallet to be credited for executing the order, if different from the one submitting this transaction.</p> |
| nonce | <code>number</code> | <p>optional nonce</p> |
| [submission] | <code>PriceFeedSubmission</code> | <p>optional signed prices obtained via PriceFeeds::fetchLatestFeedPriceInfoForPerpetual</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler, Order } from "@d8x/perpetuals-sdk";
async function main() {
  console.log(OrderExecutorTool);
  // Setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  const symbol = "ETH-USD-MATIC";
  let orderTool = new OrderExecutorTool(config, pk);
  await orderTool.createProxyInstance();
  // get some open orders
  const maxOrdersToGet = 5;
  let [orders, ids]: [Order[], string[]] = await orderTool.pollLimitOrders(symbol, maxOrdersToGet);
  console.log(`Got ${ids.length} orders`);
  // execute
  let tx = await orderTool.executeOrders(symbol, ids);
  console.log(`Sent order ids ${ids.join(", ")} for execution, tx hash = ${tx.hash}`);
}
main();
```
<a name="OrderExecutorTool+getAllOpenOrders"></a>

### orderExecutorTool.getAllOpenOrders(symbol) ⇒
<p>All the orders in the order book for a given symbol that are currently open.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>Array with all open orders and their IDs.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderExecutorTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderExecutorTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let openOrders = await orderTool.getAllOpenOrders("ETH-USD-MATIC");
  console.log(openOrders);
}
main();
```
<a name="OrderExecutorTool+numberOfOpenOrders"></a>

### orderExecutorTool.numberOfOpenOrders(symbol) ⇒ <code>number</code>
<p>Total number of limit orders for this symbol, excluding those that have been cancelled/removed.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <code>number</code> - <p>Number of open orders.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderExecutorTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderExecutorTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let numberOfOrders = await orderTool.numberOfOpenOrders("ETH-USD-MATIC");
  console.log(numberOfOrders);
}
main();
```
<a name="OrderExecutorTool+getOrderById"></a>

### orderExecutorTool.getOrderById(symbol, digest) ⇒
<p>Get order from the digest (=id)</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>order or undefined</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of order book, e.g. ETH-USD-MATIC</p> |
| digest | <p>digest of the order (=order ID)</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderExecutorTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderExecutorTool(config, pk);
  await orderTool.createProxyInstance();
  // get order by ID
  let myorder = await orderTool.getOrderById("MATIC-USD-MATIC",
      "0x0091a1d878491479afd09448966c1403e9d8753122e25260d3b2b9688d946eae");
  console.log(myorder);
}
main();
```
<a name="OrderExecutorTool+pollLimitOrders"></a>

### orderExecutorTool.pollLimitOrders(symbol, numElements, [startAfter]) ⇒
<p>Get a list of active conditional orders in the order book.
This a read-only action and does not incur in gas costs.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>Array of orders and corresponding order IDs</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| numElements | <code>number</code> | <p>Maximum number of orders to poll.</p> |
| [startAfter] | <code>string</code> | <p>Optional order ID from where to start polling. Defaults to the first order.</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderExecutorTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderExecutorTool(config, pk);
  await orderTool.createProxyInstance();
  // get all open orders
  let activeOrders = await orderTool.pollLimitOrders("ETH-USD-MATIC", 2);
  console.log(activeOrders);
}
main();
```
<a name="OrderExecutorTool+isTradeable"></a>

### orderExecutorTool.isTradeable(order, indexPrices) ⇒
<p>Check if a conditional order can be executed</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>true if order can be executed for the current state of the perpetuals</p>  

| Param | Description |
| --- | --- |
| order | <p>order structure</p> |
| indexPrices | <p>pair of index prices S2 and S3. S3 set to zero if not required. If undefined the function will fetch the latest prices from the REST API</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderExecutorTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderExecutorTool(config, pk);
  await orderTool.createProxyInstance();
  // check if tradeable
  let openOrders = await orderTool.getAllOpenOrders("MATIC-USD-MATIC");
  let check = await orderTool.isTradeable(openOrders[0][0]);
  console.log(check);
}
main();
```
<a name="OrderExecutorTool+isTradeableBatch"></a>

### orderExecutorTool.isTradeableBatch(orders, indexPrice) ⇒
<p>Check for a batch of orders on the same perpetual whether they can be traded</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>array of tradeable boolean</p>  

| Param | Description |
| --- | --- |
| orders | <p>orders belonging to 1 perpetual</p> |
| indexPrice | <p>S2,S3-index prices for the given perpetual. Will fetch prices from REST API if not defined.</p> |

**Example**  
```js
import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(OrderExecutorTool);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const pk: string = <string>process.env.PK;
  let orderTool = new OrderExecutorTool(config, pk);
  await orderTool.createProxyInstance();
  // check if tradeable
  let openOrders = await orderTool.getAllOpenOrders("MATIC-USD-MATIC");
  let check = await orderTool.isTradeableBatch(
      [openOrders[0][0], openOrders[0][1]],
      [openOrders[1][0], openOrders[1][1]]
    );
  console.log(check);
}
main();
```
<a name="OrderExecutorTool+smartContractOrderToOrder"></a>

### orderExecutorTool.smartContractOrderToOrder(scOrder) ⇒
<p>Wrapper of static method to use after mappings have been loaded into memory.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>A user-friendly order struct.</p>  

| Param | Description |
| --- | --- |
| scOrder | <p>Perpetual order as received in the proxy events.</p> |

<a name="OrderExecutorTool+getTransactionCount"></a>

### orderExecutorTool.getTransactionCount(blockTag) ⇒
<p>Gets the current transaction count for the connected signer</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Returns**: <p>The nonce for the next transaction</p>  

| Param |
| --- |
| blockTag | 

<a name="WriteAccessHandler+createProxyInstance"></a>

### orderExecutorTool.createProxyInstance(provider)
<p>Initialize the writeAccessHandler-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>createProxyInstance</code>](#WriteAccessHandler+createProxyInstance)  

| Param | Description |
| --- | --- |
| provider | <p>optional provider</p> |

<a name="WriteAccessHandler+setAllowance"></a>

### orderExecutorTool.setAllowance(symbol, amount) ⇒
<p>Set allowance for ar margin token (e.g., MATIC, ETH, USDC)</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>setAllowance</code>](#WriteAccessHandler+setAllowance)  
**Returns**: <p>ContractTransaction</p>  

| Param | Description |
| --- | --- |
| symbol | <p>token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)</p> |
| amount | <p>optional, amount to approve if not 'infinity'</p> |

<a name="WriteAccessHandler+getAddress"></a>

### orderExecutorTool.getAddress() ⇒ <code>string</code>
<p>Address corresponding to the private key used to instantiate this class.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getAddress</code>](#WriteAccessHandler+getAddress)  
**Returns**: <code>string</code> - <p>Address of this wallet.</p>  
<a name="WriteAccessHandler+swapForMockToken"></a>

### orderExecutorTool.swapForMockToken(symbol, amountToPay) ⇒
<p>Converts a given amount of chain native currency (test MATIC)
into a mock token used for trading on testnet, with a rate of 1:100_000</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>swapForMockToken</code>](#WriteAccessHandler+swapForMockToken)  
**Returns**: <p>Transaction object</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Pool margin token e.g. MATIC</p> |
| amountToPay | <p>Amount in chain currency, e.g. &quot;0.1&quot; for 0.1 MATIC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### orderExecutorTool.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetuals"></a>

### orderExecutorTool.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### orderExecutorTool.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+_fillSymbolMaps"></a>

### orderExecutorTool.\_fillSymbolMaps()
<p>Called when initializing. This function fills this.symbolToTokenAddrMap,
and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>\_fillSymbolMaps</code>](#PerpetualDataHandler+_fillSymbolMaps)  
<a name="PerpetualDataHandler+getSymbolFromPoolId"></a>

### orderExecutorTool.getSymbolFromPoolId(poolId) ⇒ <code>symbol</code>
<p>Get pool symbol given a pool Id.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getSymbolFromPoolId</code>](#PerpetualDataHandler+getSymbolFromPoolId)  
**Returns**: <code>symbol</code> - <p>Pool symbol, e.g. &quot;USDC&quot;.</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolId | <code>number</code> | <p>Pool Id.</p> |

<a name="PerpetualDataHandler+getPoolIdFromSymbol"></a>

### orderExecutorTool.getPoolIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get pool Id given a pool symbol. Pool IDs start at 1.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getPoolIdFromSymbol</code>](#PerpetualDataHandler+getPoolIdFromSymbol)  
**Returns**: <code>number</code> - <p>Pool Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Pool symbol.</p> |

<a name="PerpetualDataHandler+getPerpIdFromSymbol"></a>

### orderExecutorTool.getPerpIdFromSymbol(symbol) ⇒ <code>number</code>
<p>Get perpetual Id given a perpetual symbol.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getPerpIdFromSymbol</code>](#PerpetualDataHandler+getPerpIdFromSymbol)  
**Returns**: <code>number</code> - <p>Perpetual Id.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol, e.g. &quot;BTC-USD-MATIC&quot;.</p> |

<a name="PerpetualDataHandler+getSymbolFromPerpId"></a>

### orderExecutorTool.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### orderExecutorTool.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

<a name="PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual"></a>

### orderExecutorTool.fetchPriceSubmissionInfoForPerpetual(symbol) ⇒
<p>Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
triangulated prices for the indices S2 and S3</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>fetchPriceSubmissionInfoForPerpetual</code>](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual)  
**Returns**: <p>PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.</p>  

| Param | Description |
| --- | --- |
| symbol | <p>pool symbol of the form &quot;ETH-USD-MATIC&quot;</p> |

<a name="PerpetualDataHandler+getIndexSymbols"></a>

### orderExecutorTool.getIndexSymbols(symbol) ⇒
<p>Get the symbols required as indices for the given perpetual</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getIndexSymbols</code>](#PerpetualDataHandler+getIndexSymbols)  
**Returns**: <p>name of underlying index prices, e.g. [&quot;MATIC-USD&quot;, &quot;&quot;]</p>  

| Param | Description |
| --- | --- |
| symbol | <p>of the form ETH-USD-MATIC, specifying the perpetual</p> |

<a name="PerpetualDataHandler+fetchLatestFeedPriceInfo"></a>

### orderExecutorTool.fetchLatestFeedPriceInfo(symbol) ⇒
<p>Get the latest prices for a given perpetual from the offchain oracle
networks</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>fetchLatestFeedPriceInfo</code>](#PerpetualDataHandler+fetchLatestFeedPriceInfo)  
**Returns**: <p>array of price feed updates that can be submitted to the smart contract
and corresponding price information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol of the form BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPriceIds"></a>

### orderExecutorTool.getPriceIds(symbol) ⇒
<p>Get list of required pyth price source IDs for given perpetual</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getPriceIds</code>](#PerpetualDataHandler+getPriceIds)  
**Returns**: <p>list of required pyth price sources for this perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>perpetual symbol, e.g., BTC-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetualSymbolsInPool"></a>

### orderExecutorTool.getPerpetualSymbolsInPool(poolSymbol) ⇒
<p>Get perpetual symbols for a given pool</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getPerpetualSymbolsInPool</code>](#PerpetualDataHandler+getPerpetualSymbolsInPool)  
**Returns**: <p>array of perpetual symbols in this pool</p>  

| Param | Description |
| --- | --- |
| poolSymbol | <p>pool symbol such as &quot;MATIC&quot;</p> |

<a name="PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol"></a>

### orderExecutorTool.getPoolStaticInfoIndexFromSymbol(symbol) ⇒
<p>Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getPoolStaticInfoIndexFromSymbol</code>](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol)  
**Returns**: <p>Pool index</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### orderExecutorTool.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### orderExecutorTool.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### orderExecutorTool.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>OrderExecutorTool</code>](#OrderExecutorTool)  
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
    * [new PerpetualDataHandler(config)](#new_PerpetualDataHandler_new)
    * _instance_
        * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
        * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
        * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
        * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
        * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
        * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
        * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
        * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
        * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
        * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
        * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
        * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
        * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
        * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
        * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
        * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
        * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
        * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒
    * _static_
        * [.getPerpetualStaticInfo(_proxyContract, nestedPerpetualIDs, symbolList)](#PerpetualDataHandler.getPerpetualStaticInfo) ⇒
        * [.nestedIDsToChunks(chunkSize, nestedIDs)](#PerpetualDataHandler.nestedIDsToChunks) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
        * [._getLiquidityPools(ids, _proxyContract, _symbolList, overrides)](#PerpetualDataHandler._getLiquidityPools) ⇒
        * [._getPerpetuals(ids, _proxyContract, _symbolList, overrides)](#PerpetualDataHandler._getPerpetuals) ⇒
        * [.getMarginAccount(traderAddr, symbol, symbolToPerpStaticInfo, _proxyContract, _pxS2S3, overrides)](#PerpetualDataHandler.getMarginAccount) ⇒
        * [.getMarginAccounts(traderAddrs, symbols, symbolToPerpStaticInfo, _multicall, _proxyContract, _pxS2S3s, overrides)](#PerpetualDataHandler.getMarginAccounts) ⇒
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
        * [.getAvailableConfigs()](#PerpetualDataHandler.getAvailableConfigs) ⇒
        * [._getABIFromContract(contract, functionName)](#PerpetualDataHandler._getABIFromContract) ⇒
        * [.checkOrder(order, traderAccount, perpStaticInfo)](#PerpetualDataHandler.checkOrder)
        * [.fromClientOrderToTypeSafeOrder(order)](#PerpetualDataHandler.fromClientOrderToTypeSafeOrder) ⇒

<a name="new_PerpetualDataHandler_new"></a>

### new PerpetualDataHandler(config)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler.readSDKConfig.</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### perpetualDataHandler.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetuals"></a>

### perpetualDataHandler.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### perpetualDataHandler.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### perpetualDataHandler.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### perpetualDataHandler.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### perpetualDataHandler.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### perpetualDataHandler.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

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

<a name="PerpetualDataHandler._getLiquidityPools"></a>

### PerpetualDataHandler.\_getLiquidityPools(ids, _proxyContract, _symbolList, overrides) ⇒
<p>Query perpetuals</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| _proxyContract | <p>proxy contract instance</p> |
| _symbolList | <p>symbol mappings to convert the bytes encoded symbol name to string</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler._getPerpetuals"></a>

### PerpetualDataHandler.\_getPerpetuals(ids, _proxyContract, _symbolList, overrides) ⇒
<p>Query perpetuals</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| _proxyContract | <p>proxy contract instance</p> |
| _symbolList | <p>symbol mappings to convert the bytes encoded symbol name to string</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler.getMarginAccount"></a>

### PerpetualDataHandler.getMarginAccount(traderAddr, symbol, symbolToPerpStaticInfo, _proxyContract, _pxS2S3, overrides) ⇒
<p>Get trader state from the blockchain and parse into a human-readable margin account</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>A Margin account</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Trader address</p> |
| symbol | <p>Perpetual symbol</p> |
| symbolToPerpStaticInfo | <p>Symbol to perp static info mapping</p> |
| _proxyContract | <p>Proxy contract instance</p> |
| _pxS2S3 | <p>Prices [S2, S3]</p> |
| overrides | <p>Optional overrides for eth_call</p> |

<a name="PerpetualDataHandler.getMarginAccounts"></a>

### PerpetualDataHandler.getMarginAccounts(traderAddrs, symbols, symbolToPerpStaticInfo, _multicall, _proxyContract, _pxS2S3s, overrides) ⇒
<p>Get trader states from the blockchain and parse into a list of human-readable margin accounts</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>List of margin accounts</p>  

| Param | Description |
| --- | --- |
| traderAddrs | <p>List of trader addresses</p> |
| symbols | <p>List of symbols</p> |
| symbolToPerpStaticInfo | <p>Symbol to perp static info mapping</p> |
| _multicall | <p>Multicall3 contract instance</p> |
| _proxyContract | <p>Proxy contract instance</p> |
| _pxS2S3s | <p>List of price pairs, [[S2, S3] (1st perp), [S2, S3] (2nd perp), ... ]</p> |
| overrides | <p>Optional eth_call overrides</p> |

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

<a name="PerpetualDataHandler.getAvailableConfigs"></a>

### PerpetualDataHandler.getAvailableConfigs() ⇒
<p>Get available configurations in a Set.
You can use the output to determine the config file that you get
via 'let config = PerpetualDataHandler.readSDKConfig(196);'</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>set of chain-ids and name separated by ;</p>  
**Example**  
```js
import { PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  const configs = PerpetualDataHandler.getAvailableConfigs();
  console.log(configs);
  // output of the form:
  // Set(2) { '1101; zkevm', `196; xlayer'}
}
main();
```
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

<a name="PerpetualDataHandler.fromClientOrderToTypeSafeOrder"></a>

### PerpetualDataHandler.fromClientOrderToTypeSafeOrder(order) ⇒
<p>Converts a client order (with BigNumberish types) to a type-safe order (with number/bigint types)</p>

**Kind**: static method of [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  
**Returns**: <p>Order that can be submitted to the corresponding LOB via ethers v6 or viem</p>  

| Param | Description |
| --- | --- |
| order | <p>Client order</p> |

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
        * [.onPerpetualLimitOrderCreated(perpetualId, trader, executorAddr, brokerAddr, Order, digest)](#PerpetualEventHandler+onPerpetualLimitOrderCreated)
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

### perpetualEventHandler.onPerpetualLimitOrderCreated(perpetualId, trader, executorAddr, brokerAddr, Order, digest)
<p>event PerpetualLimitOrderCreated(
uint24 indexed perpetualId,
address indexed trader,
address executorAddr,
address brokerAddr,
Order order,
bytes32 digest
)</p>

**Kind**: instance method of [<code>PerpetualEventHandler</code>](#PerpetualEventHandler)  

| Param | Description |
| --- | --- |
| perpetualId | <p>id of the perpetual</p> |
| trader | <p>address of the trader</p> |
| executorAddr | <p>address of the executor</p> |
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
        * [.getTriangulations()](#PriceFeeds+getTriangulations) ⇒
        * [.setTriangulations()](#PriceFeeds+setTriangulations)
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

<a name="PriceFeeds+getTriangulations"></a>

### priceFeeds.getTriangulations() ⇒
<p>Returns computed triangulation map</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
**Returns**: <p>Triangulation map</p>  
<a name="PriceFeeds+setTriangulations"></a>

### priceFeeds.setTriangulations()
<p>Set pre-computed triangulation map</p>

**Kind**: instance method of [<code>PriceFeeds</code>](#PriceFeeds)  
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
<li>if symbols undefined, all feeds are queried</li>
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

<a name="ReferralCodeSigner"></a>

## ReferralCodeSigner
<p>This is a 'standalone' class that deals with signatures
required for referral codes:</p>
<ul>
<li>referrer creates a new referral code for trader (no agency involved)</li>
<li>agency creates a new referral code for a referrer and their trader</li>
<li>trader selects a referral code to trade with</li>
</ul>
<p>Note that since the back-end is chain specific, the referral code is typically bound to
one chain, unless the backend employs code transferrals</p>

**Kind**: global class  

* [ReferralCodeSigner](#ReferralCodeSigner)
    * [.getSignatureForNewReferral(rc, signingFun)](#ReferralCodeSigner.getSignatureForNewReferral) ⇒
    * [.getSignatureForNewCode(rc, signingFun)](#ReferralCodeSigner.getSignatureForNewCode) ⇒
    * [._referralCodeNewCodePayloadToMessage(rc)](#ReferralCodeSigner._referralCodeNewCodePayloadToMessage) ⇒
    * [._codeSelectionPayloadToMessage(rc)](#ReferralCodeSigner._codeSelectionPayloadToMessage) ⇒
    * [.checkNewCodeSignature(rc)](#ReferralCodeSigner.checkNewCodeSignature) ⇒

<a name="ReferralCodeSigner.getSignatureForNewReferral"></a>

### ReferralCodeSigner.getSignatureForNewReferral(rc, signingFun) ⇒
<p>New agency/broker to agency referral
rc.PassOnPercTDF must be in 100*percentage unit</p>

**Kind**: static method of [<code>ReferralCodeSigner</code>](#ReferralCodeSigner)  
**Returns**: <p>signature</p>  

| Param | Description |
| --- | --- |
| rc | <p>payload to sign</p> |
| signingFun | <p>signing function</p> |

<a name="ReferralCodeSigner.getSignatureForNewCode"></a>

### ReferralCodeSigner.getSignatureForNewCode(rc, signingFun) ⇒
<p>New code
rc.PassOnPercTDF must be in 100*percentage unit</p>

**Kind**: static method of [<code>ReferralCodeSigner</code>](#ReferralCodeSigner)  
**Returns**: <p>signature string</p>  

| Param | Description |
| --- | --- |
| rc | <p>APIReferralCodePayload without signature</p> |
| signingFun | <p>function that signs</p> |

<a name="ReferralCodeSigner._referralCodeNewCodePayloadToMessage"></a>

### ReferralCodeSigner.\_referralCodeNewCodePayloadToMessage(rc) ⇒
<p>Create digest for referralCodePayload that is to be signed</p>

**Kind**: static method of [<code>ReferralCodeSigner</code>](#ReferralCodeSigner)  
**Returns**: <p>the hex-string to be signed</p>  

| Param | Description |
| --- | --- |
| rc | <p>payload</p> |

<a name="ReferralCodeSigner._codeSelectionPayloadToMessage"></a>

### ReferralCodeSigner.\_codeSelectionPayloadToMessage(rc) ⇒
<p>Create digest for APIReferralCodeSelectionPayload that is to be signed</p>

**Kind**: static method of [<code>ReferralCodeSigner</code>](#ReferralCodeSigner)  
**Returns**: <p>the hex-string to be signed</p>  

| Param | Description |
| --- | --- |
| rc | <p>payload</p> |

<a name="ReferralCodeSigner.checkNewCodeSignature"></a>

### ReferralCodeSigner.checkNewCodeSignature(rc) ⇒
<p>Check whether signature is correct on payload:</p>
<ul>
<li>the referrer always signs</li>
<li>if the agency is not an agency for this referrer, the backend will reject</li>
</ul>

**Kind**: static method of [<code>ReferralCodeSigner</code>](#ReferralCodeSigner)  
**Returns**: <p>true if correctly signed, false otherwise</p>  

| Param | Description |
| --- | --- |
| rc | <p>referralcode payload with a signature</p> |

<a name="TraderInterface"></a>

## TraderInterface ⇐ [<code>MarketData</code>](#MarketData)
<p>Interface that can be used by front-end that wraps all private functions
so that signatures can be handled in frontend via wallet</p>

**Kind**: global class  
**Extends**: [<code>MarketData</code>](#MarketData)  

* [TraderInterface](#TraderInterface) ⇐ [<code>MarketData</code>](#MarketData)
    * [new TraderInterface(config)](#new_TraderInterface_new)
    * _instance_
        * [.queryExchangeFee(poolSymbolName, traderAddr, brokerAddr)](#TraderInterface+queryExchangeFee) ⇒
        * [.getCurrentTraderVolume(poolSymbolName, traderAddr)](#TraderInterface+getCurrentTraderVolume) ⇒
        * [.cancelOrderDigest(symbol, orderId)](#TraderInterface+cancelOrderDigest) ⇒
        * [.getOrderBookAddress(symbol)](#TraderInterface+getOrderBookAddress) ⇒
        * [.createSmartContractOrder(order, traderAddr)](#TraderInterface+createSmartContractOrder) ⇒
        * [.orderDigest(scOrder)](#TraderInterface+orderDigest) ⇒
        * [.getProxyABI(method)](#TraderInterface+getProxyABI) ⇒
        * [.getOrderBookABI(symbol, method)](#TraderInterface+getOrderBookABI) ⇒
        * [.addLiquidity(signer, poolSymbolName, amountCC)](#TraderInterface+addLiquidity) ⇒
        * [.initiateLiquidityWithdrawal(signer, poolSymbolName, amountPoolShares)](#TraderInterface+initiateLiquidityWithdrawal) ⇒
        * [.executeLiquidityWithdrawal(signer, poolSymbolName)](#TraderInterface+executeLiquidityWithdrawal) ⇒
        * [.createProxyInstance(providerOrMarketData)](#MarketData+createProxyInstance)
        * [.getProxyAddress()](#MarketData+getProxyAddress) ⇒ <code>string</code>
        * [.getTriangulations()](#MarketData+getTriangulations) ⇒
        * [.smartContractOrderToOrder(smOrder)](#MarketData+smartContractOrderToOrder) ⇒ <code>Order</code>
        * [.getReadOnlyProxyInstance()](#MarketData+getReadOnlyProxyInstance) ⇒ <code>Contract</code>
        * [.exchangeInfo()](#MarketData+exchangeInfo) ⇒ <code>ExchangeInfo</code>
        * [.openOrders(traderAddr, symbol)](#MarketData+openOrders) ⇒
        * [.positionRisk(traderAddr, symbol)](#MarketData+positionRisk) ⇒ <code>Array.&lt;MarginAccount&gt;</code>
        * [.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo)](#MarketData+positionRiskOnTrade) ⇒
        * [.positionRiskOnCollateralAction(deltaCollateral, account)](#MarketData+positionRiskOnCollateralAction) ⇒ <code>MarginAccount</code>
        * [.getWalletBalance(address, symbol)](#MarketData+getWalletBalance) ⇒
        * [.getPoolShareTokenBalance(address, symbolOrId)](#MarketData+getPoolShareTokenBalance) ⇒ <code>number</code>
        * [.getShareTokenPrice(symbolOrId)](#MarketData+getShareTokenPrice) ⇒ <code>number</code>
        * [.getParticipationValue(address, symbolOrId)](#MarketData+getParticipationValue) ⇒
        * [.maxOrderSizeForTrader(traderAddr, symbol)](#MarketData+maxOrderSizeForTrader) ⇒
        * [.maxSignedPosition(side, symbol)](#MarketData+maxSignedPosition) ⇒ <code>number</code>
        * [.getOraclePrice(base, quote)](#MarketData+getOraclePrice) ⇒ <code>number</code>
        * [.getOrderStatus(symbol, orderId, overrides)](#MarketData+getOrderStatus) ⇒
        * [.getOrdersStatus(symbol, orderId)](#MarketData+getOrdersStatus) ⇒
        * [.getMarkPrice(symbol)](#MarketData+getMarkPrice) ⇒ <code>number</code>
        * [.getPerpetualPrice(symbol, quantity)](#MarketData+getPerpetualPrice) ⇒ <code>number</code>
        * [.getPerpetualState(symbol)](#MarketData+getPerpetualState) ⇒ <code>PerpetualState</code>
        * [.getPoolState(poolSymbol)](#MarketData+getPoolState) ⇒ <code>PoolState</code>
        * [.getPerpetualStaticInfo(symbol)](#MarketData+getPerpetualStaticInfo) ⇒ <code>PerpetualStaticInfo</code>
        * [.getPerpetualMidPrice(symbol)](#MarketData+getPerpetualMidPrice) ⇒ <code>number</code>
        * [.getAvailableMargin(traderAddr, symbol, indexPrices)](#MarketData+getAvailableMargin) ⇒
        * [.getTraderLoyalityScore(traderAddr)](#MarketData+getTraderLoyalityScore) ⇒ <code>number</code>
        * [.isMarketClosed(symbol)](#MarketData+isMarketClosed) ⇒ <code>boolean</code>
        * [.getPriceInUSD(symbol)](#MarketData+getPriceInUSD) ⇒ <code>Map.&lt;string, number&gt;</code>
        * [.fetchPricesForPerpetual(symbol)](#MarketData+fetchPricesForPerpetual) ⇒
        * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
        * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
        * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
        * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
        * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
        * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
        * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
        * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
        * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
        * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
        * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
        * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
        * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
        * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
        * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
        * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
        * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
        * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒
    * _static_
        * [.chainOrders(orders, ids)](#TraderInterface.chainOrders) ⇒

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

**Example**  
```js
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(TraderInterface);
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let traderAPI = new TraderInterface(config);
  await traderAPI.createProxyInstance();
  // query exchange fee
  let fees = await traderAPI.queryExchangeFee("MATIC");
  console.log(fees);
}
main();
```
<a name="TraderInterface+getCurrentTraderVolume"></a>

### traderInterface.getCurrentTraderVolume(poolSymbolName, traderAddr) ⇒
**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>volume in USD</p>  

| Param | Description |
| --- | --- |
| poolSymbolName | <p>pool symbol, e.g. MATIC</p> |
| traderAddr | <p>address of the trader</p> |

**Example**  
```js
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(TraderInterface);
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let traderAPI = new TraderInterface(config);
  await traderAPI.createProxyInstance();
  // query volume
  let vol = await traderAPI.getCurrentTraderVolume("MATIC", "0xmyAddress");
  console.log(vol);
}
main();
```
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

**Example**  
```js
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(TraderInterface);
  const config = PerpetualDataHandler.readSDKConfig("x1");
  let traderAPI = new TraderInterface(config);
  await traderAPI.createProxyInstance();
  // submit order
  let resp = await accTrade.order(order, undefined, { gasLimit: 800_000 });
  await resp.tx.wait();
  // cancel what we just submitted
  let d = await traderAPI.cancelOrderDigest("ETH-USDC-USDC", resp.orderId);
  console.log(d);
}
main();
```
<a name="TraderInterface+getOrderBookAddress"></a>

### traderInterface.getOrderBookAddress(symbol) ⇒
<p>Get the order book address for a perpetual</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>order book address for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol (e.g. MATIC-USD-MATIC)</p> |

**Example**  
```js
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(TraderInterface);
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let traderAPI = new TraderInterface(config);
  await traderAPI.createProxyInstance();
  // get order book address
  let ob = traderAPI.getOrderBookAddress("BTC-USD-MATIC");
  console.log(ob);
}
main();
```
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

<a name="TraderInterface+addLiquidity"></a>

### traderInterface.addLiquidity(signer, poolSymbolName, amountCC) ⇒
<p>Add liquidity to the PnL participant fund via signer. The address gets pool shares in return.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>Transaction object</p>  

| Param | Type | Description |
| --- | --- | --- |
| signer | <code>Signer</code> | <p>Signer that will deposit liquidity</p> |
| poolSymbolName | <code>string</code> | <p>Name of pool symbol (e.g. MATIC)</p> |
| amountCC | <code>number</code> | <p>Amount in pool-collateral currency</p> |

**Example**  
```js
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(TraderInterface);
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const signer = // ethers Signer, e.g. from Metamask
  let traderAPI = new TraderInterface(config);
  await traderAPI.createProxyInstance();
  // add liquidity
  let respAddLiquidity = await traderAPI.addLiquidity(signer, "MATIC", 0.1);
  console.log(respAddLiquidity);
}
main();
```
<a name="TraderInterface+initiateLiquidityWithdrawal"></a>

### traderInterface.initiateLiquidityWithdrawal(signer, poolSymbolName, amountPoolShares) ⇒
<p>Initiates a liquidity withdrawal from the pool
It triggers a time-delayed unlocking of the given number of pool shares.
The amount of pool shares to be unlocked is fixed by this call, but not their value in pool currency.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| signer | <code>Signer</code> | <p>Signer that will initiate liquidity withdrawal</p> |
| poolSymbolName | <code>string</code> | <p>Name of pool symbol (e.g. MATIC).</p> |
| amountPoolShares | <code>string</code> | <p>Amount in pool-shares, removes everything if &gt; available amount.</p> |

**Example**  
```js
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(TraderInterface);
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const signer = // ethers Signer, e.g. from Metamask
  let traderAPI = new TraderInterface(config);
  await traderAPI.createProxyInstance();
  // submit txn
  let tx = await traderAPI.initiateLiquidityWithdrawal(signer, "MATIC", 10.2);
  console.log(tx);
}
main();
```
<a name="TraderInterface+executeLiquidityWithdrawal"></a>

### traderInterface.executeLiquidityWithdrawal(signer, poolSymbolName) ⇒
<p>Withdraws as much liquidity as there is available after a call to initiateLiquidityWithdrawal.
The address loses pool shares in return.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>Transaction object.</p>  

| Param | Type | Description |
| --- | --- | --- |
| signer | <code>Signer</code> | <p>Signer that will execute the liquidity withdrawal</p> |
| poolSymbolName |  |  |

**Example**  
```js
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(TraderInterface);
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const signer = // ethers Signer, e.g. from Metamask
  let traderAPI = new TraderInterface(config);
  await traderAPI.createProxyInstance();
  // submit txn
  let tx = await traderAPI.executeLiquidityWithdrawal(signer, "MATIC");
  console.log(tx);
}
main();
```
<a name="MarketData+createProxyInstance"></a>

### traderInterface.createProxyInstance(providerOrMarketData)
<p>Initialize the marketData-Class with this function
to create instance of D8X perpetual contract and gather information
about perpetual currencies</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>createProxyInstance</code>](#MarketData+createProxyInstance)  

| Param | Description |
| --- | --- |
| providerOrMarketData | <p>optional provider or existing market data instance</p> |

<a name="MarketData+getProxyAddress"></a>

### traderInterface.getProxyAddress() ⇒ <code>string</code>
<p>Get the proxy address</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getProxyAddress</code>](#MarketData+getProxyAddress)  
**Returns**: <code>string</code> - <p>Address of the perpetual proxy contract</p>  
<a name="MarketData+getTriangulations"></a>

### traderInterface.getTriangulations() ⇒
<p>Get the pre-computed triangulations</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getTriangulations</code>](#MarketData+getTriangulations)  
**Returns**: <p>Triangulations</p>  
<a name="MarketData+smartContractOrderToOrder"></a>

### traderInterface.smartContractOrderToOrder(smOrder) ⇒ <code>Order</code>
<p>Convert the smart contract output of an order into a convenient format of type &quot;Order&quot;</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>smartContractOrderToOrder</code>](#MarketData+smartContractOrderToOrder)  
**Returns**: <code>Order</code> - <p>more convenient format of order, type &quot;Order&quot;</p>  

| Param | Type | Description |
| --- | --- | --- |
| smOrder | <code>SmartContractOrder</code> | <p>SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event</p> |

<a name="MarketData+getReadOnlyProxyInstance"></a>

### traderInterface.getReadOnlyProxyInstance() ⇒ <code>Contract</code>
<p>Get contract instance. Useful for event listening.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getReadOnlyProxyInstance</code>](#MarketData+getReadOnlyProxyInstance)  
**Returns**: <code>Contract</code> - <p>read-only proxy instance</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get contract instance
  let proxy = await mktData.getReadOnlyProxyInstance();
  console.log(proxy);
}
main();
```
<a name="MarketData+exchangeInfo"></a>

### traderInterface.exchangeInfo() ⇒ <code>ExchangeInfo</code>
<p>Information about the products traded in the exchange.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>exchangeInfo</code>](#MarketData+exchangeInfo)  
**Returns**: <code>ExchangeInfo</code> - <p>Array of static data for all the pools and perpetuals in the system.</p>  
**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get exchange info
  let info = await mktData.exchangeInfo();
  console.log(info);
}
main();
```
<a name="MarketData+openOrders"></a>

### traderInterface.openOrders(traderAddr, symbol) ⇒
<p>All open orders for a trader-address and a symbol.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>openOrders</code>](#MarketData+openOrders)  
**Returns**: <p>For each perpetual an array of open orders and corresponding order-ids.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the open orders.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC or a pool symbol, or undefined. If a poolSymbol is provided, the response includes orders in all perpetuals of the given pool. If no symbol is provided, the response includes orders from all perpetuals in all pools.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

### traderInterface.positionRisk(traderAddr, symbol) ⇒ <code>Array.&lt;MarginAccount&gt;</code>
<p>Information about the position open by a given trader in a given perpetual contract, or
for all perpetuals in a pool</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>positionRisk</code>](#MarketData+positionRisk)  
**Returns**: <code>Array.&lt;MarginAccount&gt;</code> - <p>Array of position risks of trader.</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of the trader for which we get the position risk.</p> |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC, or pool symbol (&quot;MATIC&quot;) to get all positions in a given pool, or no symbol to get all positions in all pools.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

### traderInterface.positionRiskOnTrade(traderAddr, order, account, indexPriceInfo) ⇒
<p>Estimates what the position risk will be if a given order is executed.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>positionRiskOnTrade</code>](#MarketData+positionRiskOnTrade)  
**Returns**: <p>Position risk after trade, including order cost and maximal trade sizes for position</p>  

| Param | Description |
| --- | --- |
| traderAddr | <p>Address of trader</p> |
| order | <p>Order to be submitted</p> |
| account | <p>Position risk before trade. Defaults to current position if not given.</p> |
| indexPriceInfo | <p>Index prices and market status (open/closed). Defaults to current market status if not given.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const mktData = new MarketData(config);
  await mktData.createProxyInstance();
  const order: Order = {
       symbol: "MATIC-USD-MATIC",
       side: "BUY",
       type: "MARKET",
       quantity: 100,
       leverage: 2,
       executionTimestamp: Date.now()/1000,
   };
  // Get position risk conditional on this order being executed
  const posRisk = await mktData.positionRiskOnTrade("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", order);
  console.log(posRisk);
}
main();
```
<a name="MarketData+positionRiskOnCollateralAction"></a>

### traderInterface.positionRiskOnCollateralAction(deltaCollateral, account) ⇒ <code>MarginAccount</code>
<p>Estimates what the position risk will be if given amount of collateral is added/removed from the account.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>positionRiskOnCollateralAction</code>](#MarketData+positionRiskOnCollateralAction)  
**Returns**: <code>MarginAccount</code> - <p>Position risk after collateral has been added/removed</p>  

| Param | Type | Description |
| --- | --- | --- |
| deltaCollateral | <code>number</code> | <p>Amount of collateral to add or remove (signed)</p> |
| account | <code>MarginAccount</code> | <p>Position risk before collateral is added or removed</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  const mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // Get position risk conditional on removing 3.14 MATIC
  const traderAddr = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";
  const curPos = await mktData.positionRisk("traderAddr", "BTC-USD-MATIC");
  const posRisk = await mktData.positionRiskOnCollateralAction(-3.14, curPos);
  console.log(posRisk);
}
main();
```
<a name="MarketData+getWalletBalance"></a>

### traderInterface.getWalletBalance(address, symbol) ⇒
<p>Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getWalletBalance</code>](#MarketData+getWalletBalance)  
**Returns**: <p>Perpetual's collateral token balance of the given address.</p>  

| Param | Description |
| --- | --- |
| address | <p>Address to check</p> |
| symbol | <p>Symbol of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get MATIC balance of address
  let marginTokenBalance = await md.getWalletBalance(myaddress, "BTC-USD-MATIC");
  console.log(marginTokenBalance);
}
main();
```
<a name="MarketData+getPoolShareTokenBalance"></a>

### traderInterface.getPoolShareTokenBalance(address, symbolOrId) ⇒ <code>number</code>
<p>Get the address' balance of the pool share token</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPoolShareTokenBalance</code>](#MarketData+getPoolShareTokenBalance)  
**Returns**: <code>number</code> - <p>Pool share token balance of the given address (e.g. dMATIC balance)</p>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | <p>address of the liquidity provider</p> |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>Symbol of the form ETH-USD-MATIC, or MATIC (collateral only), or Pool-Id</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get dMATIC balance of address
  let shareTokenBalance = await md.getPoolShareTokenBalance(myaddress, "MATIC");
  console.log(shareTokenBalance);
}
main();
```
<a name="MarketData+getShareTokenPrice"></a>

### traderInterface.getShareTokenPrice(symbolOrId) ⇒ <code>number</code>
<p>Value of pool token in collateral currency</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getShareTokenPrice</code>](#MarketData+getShareTokenPrice)  
**Returns**: <code>number</code> - <p>current pool share token price in collateral currency</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get price of 1 dMATIC in MATIC
  let shareTokenPrice = await md.getShareTokenPrice(myaddress, "MATIC");
  console.log(shareTokenPrice);
}
main();
```
<a name="MarketData+getParticipationValue"></a>

### traderInterface.getParticipationValue(address, symbolOrId) ⇒
<p>Value of the pool share tokens for this liquidity provider
in poolSymbol-currency (e.g. MATIC, USDC).</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getParticipationValue</code>](#MarketData+getParticipationValue)  
**Returns**: <p>the value (in collateral tokens) of the pool share, #share tokens, shareTokenAddress</p>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | <p>address of liquidity provider</p> |
| symbolOrId | <code>string</code> \| <code>number</code> | <p>symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // get value of pool share token
  let shareToken = await md.getParticipationValue(myaddress, "MATIC");
  console.log(shareToken);
}
main();
```
<a name="MarketData+maxOrderSizeForTrader"></a>

### traderInterface.maxOrderSizeForTrader(traderAddr, symbol) ⇒
<p>Gets the maximal order sizes to open positions (increase size), both long and short,
considering the existing position, state of the perpetual
Accounts for user's wallet balance.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>maxOrderSizeForTrader</code>](#MarketData+maxOrderSizeForTrader)  
**Returns**: <p>Maximal trade sizes</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>Address of trader</p> |
| symbol | <code>symbol</code> | <p>Symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup (authentication required, PK is an environment variable with a private key)
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let md = new MarketData(config);
  await md.createProxyInstance();
  // max order sizes
  let shareToken = await md.maxOrderSizeForTrader(myaddress, "BTC-USD-MATIC");
  console.log(shareToken); // {buy: 314, sell: 415}
}
main();
```
<a name="MarketData+maxSignedPosition"></a>

### traderInterface.maxSignedPosition(side, symbol) ⇒ <code>number</code>
<p>Perpetual-wide maximal signed position size in perpetual.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>maxSignedPosition</code>](#MarketData+maxSignedPosition)  
**Returns**: <code>number</code> - <p>signed maximal position size in base currency</p>  

| Param | Type | Description |
| --- | --- | --- |
| side |  | <p>BUY_SIDE or SELL_SIDE</p> |
| symbol | <code>string</code> | <p>of the form ETH-USD-MATIC.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let maxLongPos = await mktData.maxSignedPosition(BUY_SIDE, "BTC-USD-MATIC");
  console.log(maxLongPos);
}
main();
```
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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get oracle price
  let price = await mktData.getOraclePrice("ETH", "USD");
  console.log(price);
}
main();
```
<a name="MarketData+getOrderStatus"></a>

### traderInterface.getOrderStatus(symbol, orderId, overrides) ⇒
<p>Get the status of an order given a symbol and order Id</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getOrderStatus</code>](#MarketData+getOrderStatus)  
**Returns**: <p>Order status (cancelled = 0, executed = 1, open = 2,  unkown = 3)</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |
| orderId | <p>Order Id</p> |
| overrides |  |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get order stauts
  let status = await mktData.getOrderStatus("ETH-USD-MATIC", "0xmyOrderId");
  console.log(status);
}
main();
```
<a name="MarketData+getOrdersStatus"></a>

### traderInterface.getOrdersStatus(symbol, orderId) ⇒
<p>Get the status of an array of orders given a symbol and their Ids</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getOrdersStatus</code>](#MarketData+getOrdersStatus)  
**Returns**: <p>Array of order status</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form ETH-USD-MATIC</p> |
| orderId | <p>Array of order Ids</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get order stauts
  let status = await mktData.getOrdersStatus("ETH-USD-MATIC", ["0xmyOrderId1", "0xmyOrderId2"]);
  console.log(status);
}
main();
```
<a name="MarketData+getMarkPrice"></a>

### traderInterface.getMarkPrice(symbol) ⇒ <code>number</code>
<p>Get the current mark price</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getMarkPrice</code>](#MarketData+getMarkPrice)  
**Returns**: <code>number</code> - <p>mark price</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get mark price
  let price = await mktData.getMarkPrice("ETH-USD-MATIC");
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualPrice"></a>

### traderInterface.getPerpetualPrice(symbol, quantity) ⇒ <code>number</code>
<p>get the current price for a given quantity</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualPrice</code>](#MarketData+getPerpetualPrice)  
**Returns**: <code>number</code> - <p>price</p>  

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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get perpetual price
  let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
  console.log(price);
}
main();
```
<a name="MarketData+getPerpetualState"></a>

### traderInterface.getPerpetualState(symbol) ⇒ <code>PerpetualState</code>
<p>Query recent perpetual state from blockchain</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualState</code>](#MarketData+getPerpetualState)  
**Returns**: <code>PerpetualState</code> - <p>PerpetualState copy</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="MarketData+getPoolState"></a>

### traderInterface.getPoolState(poolSymbol) ⇒ <code>PoolState</code>
<p>Query recent pool state from blockchain, not including perpetual states</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPoolState</code>](#MarketData+getPoolState)  
**Returns**: <code>PoolState</code> - <p>PoolState copy</p>  

| Param | Type | Description |
| --- | --- | --- |
| poolSymbol | <code>string</code> | <p>symbol of the form USDC</p> |

<a name="MarketData+getPerpetualStaticInfo"></a>

### traderInterface.getPerpetualStaticInfo(symbol) ⇒ <code>PerpetualStaticInfo</code>
<p>Query perpetual static info.
This information is queried once at createProxyInstance-time, and remains static after that.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetualStaticInfo</code>](#MarketData+getPerpetualStaticInfo)  
**Returns**: <code>PerpetualStaticInfo</code> - <p>Perpetual static info copy.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol</p> |

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
  const config = PerpetualDataHandler.readSDKConfig("cardona");
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

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>address of the trader</p> |
| symbol | <code>string</code> | <p>perpetual symbol of the form BTC-USD-MATIC</p> |
| indexPrices |  | <p>optional index prices, will otherwise fetch from REST API</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get available margin
  let mgn = await mktData.getAvailableMargin("0xmyAddress", "ETH-USD-MATIC");
  console.log(mgn);
}
main();
```
<a name="MarketData+getTraderLoyalityScore"></a>

### traderInterface.getTraderLoyalityScore(traderAddr) ⇒ <code>number</code>
<p>Calculate a type of exchange loyality score based on trader volume</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getTraderLoyalityScore</code>](#MarketData+getTraderLoyalityScore)  
**Returns**: <code>number</code> - <p>a loyality score (4 worst, 1 best)</p>  

| Param | Type | Description |
| --- | --- | --- |
| traderAddr | <code>string</code> | <p>address of the trader</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // get scpre
  let s = await mktData.getTraderLoyalityScore("0xmyAddress");
  console.log(s);
}
main();
```
<a name="MarketData+isMarketClosed"></a>

### traderInterface.isMarketClosed(symbol) ⇒ <code>boolean</code>
<p>Get market open/closed status</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>isMarketClosed</code>](#MarketData+isMarketClosed)  
**Returns**: <code>boolean</code> - <p>True if the market is closed</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Perpetual symbol of the form ETH-USD-MATIC</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // is market closed?
  let s = await mktData.isMarketClosed("ETH-USD-MATIC");
  console.log(s);
}
main();
```
<a name="MarketData+getPriceInUSD"></a>

### traderInterface.getPriceInUSD(symbol) ⇒ <code>Map.&lt;string, number&gt;</code>
<p>Get the latest on-chain price of a perpetual base index in USD.</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPriceInUSD</code>](#MarketData+getPriceInUSD)  
**Returns**: <code>Map.&lt;string, number&gt;</code> - <p>Price of the base index in USD, e.g. for ETH-USDC-MATIC, it returns the value of ETH-USD.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USDC-MATIC. If a pool symbol is used, it returns an array of all the USD prices of the indices in the pool. If no argument is provided, it returns all prices of all the indices in the pools of the exchange.</p> |

**Example**  
```js
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
async function main() {
  console.log(MarketData);
  // setup
  const config = PerpetualDataHandler.readSDKConfig("cardona");
  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  // is market closed?
  let px = await mktData.getPriceInUSD("ETH-USDC-USDC");
  console.log(px); // {'ETH-USD' -> 1800}
}
main();
```
<a name="MarketData+fetchPricesForPerpetual"></a>

### traderInterface.fetchPricesForPerpetual(symbol) ⇒
<p>Fetch latest off-chain index and collateral prices</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>fetchPricesForPerpetual</code>](#MarketData+fetchPricesForPerpetual)  
**Returns**: <p>Prices and market-closed information</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Perpetual symbol of the form BTC-USDc-USDC</p> |

<a name="PerpetualDataHandler+getOrderBookContract"></a>

### traderInterface.getOrderBookContract(symbol) ⇒
<p>Returns the order-book contract for the symbol if found or fails</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getOrderBookContract</code>](#PerpetualDataHandler+getOrderBookContract)  
**Returns**: <p>order book contract for the perpetual</p>  

| Param | Description |
| --- | --- |
| symbol | <p>symbol of the form ETH-USD-MATIC</p> |

<a name="PerpetualDataHandler+getPerpetuals"></a>

### traderInterface.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### traderInterface.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### traderInterface.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### traderInterface.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### traderInterface.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### traderInterface.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### traderInterface.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>TraderInterface</code>](#TraderInterface)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

<a name="TraderInterface.chainOrders"></a>

### TraderInterface.chainOrders(orders, ids) ⇒
<p>Takes up to three orders and designates the first one as &quot;parent&quot; of the others.
E.g. the first order opens a position, and the other two are take-profit and/or stop-loss orders.</p>

**Kind**: static method of [<code>TraderInterface</code>](#TraderInterface)  
**Returns**: <p>client orders with dependency info filled in</p>  

| Param | Description |
| --- | --- |
| orders | <p>1, 2 or 3 smart contract orders</p> |
| ids | <p>order ids</p> |

<a name="WriteAccessHandler"></a>

## WriteAccessHandler ⇐ [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)
<p>This is a parent class for the classes that require
write access to the contracts.
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p>

**Kind**: global class  
**Extends**: [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)  

* [WriteAccessHandler](#WriteAccessHandler) ⇐ [<code>PerpetualDataHandler</code>](#PerpetualDataHandler)
    * [new WriteAccessHandler(signer)](#new_WriteAccessHandler_new)
    * [.createProxyInstance(provider)](#WriteAccessHandler+createProxyInstance)
    * [.setAllowance(symbol, amount)](#WriteAccessHandler+setAllowance) ⇒
    * [.getAddress()](#WriteAccessHandler+getAddress) ⇒ <code>string</code>
    * [.swapForMockToken(symbol, amountToPay)](#WriteAccessHandler+swapForMockToken) ⇒
    * [.getOrderBookContract(symbol)](#PerpetualDataHandler+getOrderBookContract) ⇒
    * [.getPerpetuals(ids, overrides)](#PerpetualDataHandler+getPerpetuals) ⇒
    * [.getLiquidityPools(fromIdx, toIdx, overrides)](#PerpetualDataHandler+getLiquidityPools) ⇒
    * [._fillSymbolMaps()](#PerpetualDataHandler+_fillSymbolMaps)
    * [.getSymbolFromPoolId(poolId)](#PerpetualDataHandler+getSymbolFromPoolId) ⇒ <code>symbol</code>
    * [.getPoolIdFromSymbol(symbol)](#PerpetualDataHandler+getPoolIdFromSymbol) ⇒ <code>number</code>
    * [.getPerpIdFromSymbol(symbol)](#PerpetualDataHandler+getPerpIdFromSymbol) ⇒ <code>number</code>
    * [.getSymbolFromPerpId(perpId)](#PerpetualDataHandler+getSymbolFromPerpId) ⇒ <code>string</code>
    * [.symbol4BToLongSymbol(sym)](#PerpetualDataHandler+symbol4BToLongSymbol) ⇒ <code>string</code>
    * [.fetchPriceSubmissionInfoForPerpetual(symbol)](#PerpetualDataHandler+fetchPriceSubmissionInfoForPerpetual) ⇒
    * [.getIndexSymbols(symbol)](#PerpetualDataHandler+getIndexSymbols) ⇒
    * [.fetchLatestFeedPriceInfo(symbol)](#PerpetualDataHandler+fetchLatestFeedPriceInfo) ⇒
    * [.getPriceIds(symbol)](#PerpetualDataHandler+getPriceIds) ⇒
    * [.getPerpetualSymbolsInPool(poolSymbol)](#PerpetualDataHandler+getPerpetualSymbolsInPool) ⇒
    * [.getPoolStaticInfoIndexFromSymbol(symbol)](#PerpetualDataHandler+getPoolStaticInfoIndexFromSymbol) ⇒
    * [.getMarginTokenFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenFromSymbol) ⇒
    * [.getMarginTokenDecimalsFromSymbol(symbol)](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol) ⇒
    * [.getABI(contract)](#PerpetualDataHandler+getABI) ⇒

<a name="new_WriteAccessHandler_new"></a>

### new WriteAccessHandler(signer)
<p>Constructor</p>


| Param | Type | Description |
| --- | --- | --- |
| signer | <code>string</code> \| <code>Signer</code> | <p>Private key or ethers Signer of the account</p> |

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

<a name="PerpetualDataHandler+getPerpetuals"></a>

### writeAccessHandler.getPerpetuals(ids, overrides) ⇒
<p>Get perpetuals for the given ids from onchain</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getPerpetuals</code>](#PerpetualDataHandler+getPerpetuals)  
**Returns**: <p>array of PerpetualData converted into decimals</p>  

| Param | Description |
| --- | --- |
| ids | <p>perpetual ids</p> |
| overrides | <p>optional</p> |

<a name="PerpetualDataHandler+getLiquidityPools"></a>

### writeAccessHandler.getLiquidityPools(fromIdx, toIdx, overrides) ⇒
<p>Get liquidity pools data</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getLiquidityPools</code>](#PerpetualDataHandler+getLiquidityPools)  
**Returns**: <p>array of LiquidityPoolData converted into decimals</p>  

| Param | Description |
| --- | --- |
| fromIdx | <p>starting index (&gt;=1)</p> |
| toIdx | <p>to index (inclusive)</p> |
| overrides | <p>optional</p> |

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

### writeAccessHandler.getSymbolFromPerpId(perpId) ⇒ <code>string</code>
<p>Get the symbol in long format of the perpetual id</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getSymbolFromPerpId</code>](#PerpetualDataHandler+getSymbolFromPerpId)  
**Returns**: <code>string</code> - <p>Symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| perpId | <code>number</code> | <p>perpetual id</p> |

<a name="PerpetualDataHandler+symbol4BToLongSymbol"></a>

### writeAccessHandler.symbol4BToLongSymbol(sym) ⇒ <code>string</code>
**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>symbol4BToLongSymbol</code>](#PerpetualDataHandler+symbol4BToLongSymbol)  
**Returns**: <code>string</code> - <p>Long symbol</p>  

| Param | Type | Description |
| --- | --- | --- |
| sym | <code>string</code> | <p>Short symbol</p> |

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

<a name="PerpetualDataHandler+getMarginTokenFromSymbol"></a>

### writeAccessHandler.getMarginTokenFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getMarginTokenFromSymbol</code>](#PerpetualDataHandler+getMarginTokenFromSymbol)  
**Returns**: <p>Address of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getMarginTokenDecimalsFromSymbol"></a>

### writeAccessHandler.getMarginTokenDecimalsFromSymbol(symbol) ⇒
**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getMarginTokenDecimalsFromSymbol</code>](#PerpetualDataHandler+getMarginTokenDecimalsFromSymbol)  
**Returns**: <p>Decimals of the corresponding token</p>  

| Param | Description |
| --- | --- |
| symbol | <p>Symbol of the form USDC</p> |

<a name="PerpetualDataHandler+getABI"></a>

### writeAccessHandler.getABI(contract) ⇒
<p>Get ABI for LimitOrderBook, Proxy, or Share Pool Token</p>

**Kind**: instance method of [<code>WriteAccessHandler</code>](#WriteAccessHandler)  
**Overrides**: [<code>getABI</code>](#PerpetualDataHandler+getABI)  
**Returns**: <p>ABI for the requested contract</p>  

| Param | Description |
| --- | --- |
| contract | <p>name of contract: proxy|lob|sharetoken</p> |

