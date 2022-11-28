<a name="LiquidatorTool"></a>

## LiquidatorTool
<p>Functions to liquidate traders. This class requires a private key
and executes smart-contract interactions that require gas-payments.</p>

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
| config | <code>NodeSDKConfig</code> | <p>Configuration object, see PerpetualDataHandler. readSDKConfig.</p> |
| privateKey | <code>string</code> | <p>Private key of account that liquidates.</p> |

**Example**  
```js
const config = PerpetualDataHandler.readSDKConfig("testnet")
```
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
<p>Check if the collateral of a trader is above the maintenance margin (&quot;maintenance margin safe&quot;).
If not, the position can be liquidated.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>boolean</code> - <p>True if the trader is maintenance margin safe in the perpetual.
False means that the trader's position can be liquidated.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| traderAddr | <code>string</code> | <p>Address of the trader whose position you want to assess.</p> |

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
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of addresses at locations 'from', 'from'+1 ,..., 'to'-1.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |
| from | <code>number</code> | <p>From which account we start counting (0-indexed).</p> |
| to | <code>number</code> | <p>Until which account we count, non inclusive.</p> |

<a name="LiquidatorTool+getAllActiveAccounts"></a>

### liquidatorTool.getAllActiveAccounts(symbol) ⇒ <code>Array.&lt;string&gt;</code>
<p>Addresses for all the active accounts in this perpetual symbol.</p>

**Kind**: instance method of [<code>LiquidatorTool</code>](#LiquidatorTool)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of addresses.</p>  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | <p>Symbol of the form ETH-USD-MATIC.</p> |

