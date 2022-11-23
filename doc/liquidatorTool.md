<a name="LiquidatorTool"></a>

## LiquidatorTool
<p>Methods to liquidate traders.</p>

**Kind**: global class  

* [LiquidatorTool](#LiquidatorTool)
    * [new LiquidatorTool(config, privateKey)](#new_LiquidatorTool_new)
    * [.liquidateTrader(symbol, traderAddr, [liquidatorAddr])](#LiquidatorTool+liquidateTrader) ⇒ <code>number</code>
    * [.isMaintenanceMarginSafe(symbol, traderAddr)](#LiquidatorTool+isMaintenanceMarginSafe) ⇒ <code>boolean</code>

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

