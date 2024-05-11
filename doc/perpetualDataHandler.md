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

